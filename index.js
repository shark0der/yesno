const raspi = require('raspi');
const gpio = require('raspi-gpio');
const fs = require('fs');

let data = { yes: 0, no: 0 };
let lastyes = 1;
let lastno = 1;
let lastreset = 1;

const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const connections = [];

console.log('starting up');

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

let promise = Promise.resolve();

function readatstartup() {
  const json = fs.readFileSync('db.json');
  data = JSON.parse(json);
  syncupdate(data);
}

function syncupdate(data) {

  console.log('syncupdate:', data);

  connections.forEach(function(conn) {
    conn.emit('update', data);
    console.log('emitted:', data);
  });

  promise = promise
    .then(() => new Promise(function(resolve, reject) {
      const json = JSON.stringify(data);
      fs.writeFile('db.json', json, (err) => {
        if (err) { reject(err); }
        console.log('data saved: ', json);
        resolve();
      });
    }))
    .catch((e) => { console.log('Error writing:', e); });
}

readatstartup();

/* gpio stuff */

raspi.init(() => {

  const pinyes = new gpio.DigitalInput({
    pin: 'P1-7',
    pullResistor: gpio.PULL_UP
  });

  const yes = () => {
    const value = pinyes.read();
    if (value != lastyes) {
      lastyes = value;
      console.log('>> Y:' + value);
      if (!value) {
        data.yes++;
        syncupdate(data);
      }
    }
    setTimeout(yes, 25);
  }
  yes();

  const pinno = new gpio.DigitalInput({
    pin: 'P1-11',
    pullResistor: gpio.PULL_UP
  });

  const no = () => {
    const value = pinno.read();
    if (value != lastno) {
      lastno = value;
      console.log('>> N:' + value);
      if (!value) {
        data.no++;
        syncupdate(data);
      }
    }
    setTimeout(no, 25);
  }
  no();

  const pinreset = new gpio.DigitalInput({
    pin: 'P1-13',
    pullResistor: gpio.PULL_UP
  });

  const reset = () => {
    const value = pinreset.read();
    if (value != lastreset) {
      lastreset = value;
      console.log('>> R:' + value);
      if (!value) {
        data.no = 0;
        data.yes = 0;
        syncupdate(data);
      }
    }
    setTimeout(reset, 25);
  }
  reset();

});
