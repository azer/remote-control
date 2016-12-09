## remote-control

Run remote commands in a web page via HTTP requests.

## Install

```bash
$ npm install azer/remote-control
```

## Usage

Start running;

```bash
$ remote-control -p [port] # or; ./node_modules/.bin/remote-control
// => Running at [internal-ip]:[port]
```

And include it in your page;

```json
<script type="text/javascript" src="http://[ip]:[port]"></script>
```

Now remote-control API is available in your web page. You can register commands;

```js
remoteControl.register('reload', function () {
  location.reload(true)
})
```

The browser on this page will be connected to the remote control server via websockets.

```bash
$ curl http://[ip]:[port]/commands/reload
// => Ran command "reload" on [n] clients.
```

## Example Commands

#### Reload CSS Stylesheets

```js
remoteControl.register('reload-css', reloadCSS)

function reloadCSS () {
  const styles = document.querySelectorAll('link')
  for (let style of styles) {
    if (style.rel === "stylesheet") {
      style.href = style.href.replace(/\.css[\?\d]*$/, '.css?' + Date.now())
    }
  }
}
```
