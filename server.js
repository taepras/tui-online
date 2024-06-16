const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const GameController = require('./src/gameController');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",  // Allow only this origin, adjust if your port is different
    methods: ["GET", "POST"]
  }
});

const games = {};

// Middleware to serve a static client, assuming it's built in a folder named 'public'
app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('A user connected');

  // Join a room
  socket.on('joinRoom', (roomId, callbackFn) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);

    if (!games[roomId]) {
      console.log('🎮 creating game')
      games[roomId] = new GameController();
    }

    let player = games[roomId].addPlayer(socket.id);
    let playersInfo = games[roomId].players.map(x => x.socketId);

    io.to(roomId).emit('playerJoined', playersInfo);
    callbackFn?.(player, playersInfo);
  });

  socket.on('leaveRoom', (roomId, callbackFn) => {
    console.log(`User ${socket.id} left room ${roomId}`);

    if (!games[roomId]) return;

    games[roomId].removePlayer(socket.id);

    if (games[roomId].players.length == 0) {
      delete games[roomId];
    }
  });

  // Handling user disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

  socket.on('startGame', ({ roomId }, callbackFn) => {
    if (!games[roomId]) return;

    console.log('game start', games[roomId]);
    games[roomId].start();
    games[roomId].players.forEach(player => {
      console.log(player.socketId);
      io.to(player.socketId).emit(
        'startGame', 
        games[roomId].getMaskedGameInfoForPlayer(player.playerId), 
        player
      );
    });
  });

  socket.on('roundPlay', ({ roomId, piecesToPlay }, callbackFn) => {
    if (!games[roomId]) return;

    let playerId = games[roomId].socketIdToPlayerIdMap[socket.id]
    let isOk = games[roomId].commitMove(playerId, piecesToPlay);

    if (!isOk) {
      console.log('[roundPlay] invalid play');
      callbackFn?.(false);
      return;
    }

    console.log('play: ', roomId, socket.id, playerId, piecesToPlay);

    // io.to(roomId).emit('play', {
    //   socketId: socket.id,
    //   playerId: playerId,
    //   turnType: games[roomId].turnType
    // });

    games[roomId].players.forEach(p => {
      io.to(p.socketId).emit('roundUpdate', games[roomId].getMaskedGameInfoForPlayer(p.playerId));
    });

    callbackFn?.(true);

    if (games[roomId].isReadyToReveal())
      io.to(roomId).emit('roundReadyToReveal');
  });

  socket.on('roundReveal', ({ roomId }, callbackFn) => {
    let result = games[roomId].judgeWinner();
    if (result === false) {
      console.log('cannot reveal, round in progress');
      callbackFn?.(false);
      return;
    }

    io.to(roomId).emit('roundReveal', result);
    games[roomId].players.forEach(p => {
      io.to(p.socketId).emit('roundUpdate', games[roomId].getMaskedGameInfoForPlayer(p.playerId));
    });
  });

  socket.on('roundComplete', ({ roomId }) => {
    games[roomId].applyTurnAftermath();
    games[roomId].nextRound();
    io.to(roomId).emit('roundComplete'); 
    games[roomId].players.forEach(p => {
      io.to(p.socketId).emit('roundUpdate', games[roomId].getMaskedGameInfoForPlayer(p.playerId));
    });
  });
});

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});