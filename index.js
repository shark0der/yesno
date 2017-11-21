const raspi = require('raspi');
const gpio = require('raspi-gpio');

const data = { yes: 0, no: 0 };
let lastyes = 1;
let lastno = 1;

const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const connections = [];

/* web stuff */

app.use(express.static('public'));
server.listen(80);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/public/index.html');
});

io.on('connection', function (socket) {
  socket.emit('update', data);
  connections.push(socket);
});

function sendUpdate() {
  console.log('update:', data);
  connections.forEach(function(conn) {
    conn.emit('update', data);
    console.log('emitted:', data);
  });
}

/* gpio stuff */

raspi.init(() => {

  const pinyes = new gpio.DigitalInput({
    pin: 'P1-7',
    pullResistor: gpio.PULL_UP
  });

  const pinno = new gpio.DigitalInput({
    pin: 'P1-11',
    pullResistor: gpio.PULL_UP
  });

  const y = () => {
    const value = pinyes.read();
    if (value != lastyes) {
      lastyes = value;
      console.log('>> Y:' + value);
      if (!value) {
        data.yes++;
        sendUpdate();
      }
    }
    setTimeout(y, 25);
  }
  y();

  const n = () => {
    const value = pinno.read();
    if (value != lastno) {
      lastno = value;
      console.log('>> N:' + value);
      if (!value) {
        data.no++;
        sendUpdate();
      }
    }
    setTimeout(n, 25);
  }
  n();

});
