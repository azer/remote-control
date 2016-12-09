startRemoteControl () {
  ../bin/remote-control -p 9999 -h localhost --quiet & echo $! >/tmp/remote-control.pid
}

stopRemoteControl () {
    touch /tmp/remote-control-pid
    kill `cat /tmp/remote-control.pid` 2> /dev/null || true
}

stopRemoteControl
startRemoteControl
python -m SimpleHTTPServer

