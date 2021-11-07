const express = require('express');
const path = require('path');
const cors = require('cors');

const EXPRESS_PORT = 3000;

const app = express();
const bodyParser = require('body-parser');
const server = require('http').createServer(app);

const io = require('socket.io')(server, {
  cors: {
    origin: `http://localhost:${EXPRESS_PORT}`,
    method: ['GET', 'POST'],
  },
});

const ModelMsg = require('./models/msgModel');
const controllerMsg = require('./controllers/msgController');

app.use(bodyParser.json());

app.use(cors());
app.use('/', express.static(path.join(__dirname, 'src')));
app.set('views', path.join(__dirname, 'src'));
app.set('view engine', 'ejs');

const dataHora = new Date();
const dataFormat = `${dataHora.getDay()}-${dataHora.getMonth()}-${dataHora.getFullYear()}`;
const horaFormat = `${dataHora.getHours()}:${dataHora.getMinutes()}:${dataHora.getSeconds()}`;
const timestamp = `${dataFormat} ${horaFormat}`; 

const allNicks = {};

io.on('connection', (socket) => { // socket
  allNicks[socket.id] = socket.id.substring(0, 16);
  io.emit('connectUser', Object.values(allNicks)); // connectUser

  socket.on('nickname', (data) => {
    allNicks[socket.id] = data;
    io.emit('connectUser', Object.values(allNicks)); // connectUser
  });

  socket.on('message', async ({ chatMessage, nickname }) => {
    await ModelMsg.create({ chatMessage, nickname, timestamp });
    io.emit('message', `${timestamp} - ${nickname}: ${chatMessage}`); // message
  });

  socket.on('disconnect', () => {
    delete allNicks[socket.id];
    io.emit('connectUser', Object.values(allNicks)); // disconnectUser
  });
});

app.get('/', controllerMsg.getAllMsg);

server.listen(EXPRESS_PORT, () => {
  console.log(`Servidor ouvindo na porta ${EXPRESS_PORT}`);
});