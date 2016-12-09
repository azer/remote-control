const WebSocket = require("faye-websocket")
const debug = require("debug")("remote-control")
const routeMap = require("route-map")
const http = require("http")

module.exports = createServer

function createServer (ip, port, options) {
  const server = http.createServer(route).listen(port, ip)
  const sockets = []
  const match = routeMap({
    '/commands/:command': call,
    '/': printClientSideCode
  })

  server.on('upgrade', function (request, socket, body) {
    if (!WebSocket.isWebSocket(request)) return

    let ws = new WebSocket(request, socket, body)
    const ind = sockets.push(ws) - 1

    ws.on('message', function (msg) {
      console.log('message', msg)
    })

    ws.on('close', function(event) {
      ws = null
      sockets[ind] = undefined
      debug("Socket connection  [%d] closed", ind)
    })

    debug("Socket connection [%d] established", ind)
  })

  if (!options.quiet) console.log(`Server is running on ${ip}:${port}`)

  function route (req, res) {
    const m = match(req.url)
    if (m) return m.fn(req, res, m)

    res.setHeader('content-type', 'plain/text')
    res.end('not found')
  }

  function call (req, res, m) {
    debug('Running %s command on all remote clients.', m.params.command)

    let ctr = 0;
    for (let socket of sockets) {
      if (socket) {
        socket.send(JSON.stringify({ command: m.params.command }))
        ctr++
      }
    }

    res.statusCode = 200
    res.setHeader('Content-Type', 'plain/text')
    res.end(`Command "${m.params.command}" executed in ${ctr} clients.`)
  }

  function printClientSideCode (req, res) {
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/javascript')
    res.end(getClientSideCode(ip, port))
  }

}

function getClientSideCode (ip, port) {
  return `window.remoteControl = (function () {
  const commands = {}
  reconnect()

  return {
    commands: commands,
    socket: ws,
    register: register
  }

  function open () {
    console.log('Remote control connection established')
  }

  function message (msg) {
    const parsed = JSON.parse(msg.data)
    if (parsed.command) call(parsed.command, parsed.params)
  }

  function close () {
    setTimeout(reconnect, 1000)
  }

  function call (cmd, params) {
    if (!commands[cmd]) throw new Error('Invalid remote command: ' + cmd)
    commands[cmd]()
  }

  function register (cmd, fn) {
    commands[cmd] = fn
  }

  function reconnect () {
    ws = new WebSocket("ws://${ip}:${port}");
    ws.onopen = open;
    ws.onmessage = message;
    ws.onclose = close;
  }
}())`
}
