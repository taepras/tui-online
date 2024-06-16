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
    let playersInfo = games[roomId].players.map(x=>x.socketId);

    io.to(roomId).emit('playerJoined', playersInfo);
    callbackFn(player, playersInfo);
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
    games[roomId].players.map(p => p.socketId).forEach(socketId => {
      console.log(socketId);
      console.log(games[roomId].getPlayerStateBySocketId(socketId));
      io.to(socketId).emit('startGame', games[roomId].getPlayerStateBySocketId(socketId));
    });
  });

  socket.on('play', ({ roomId, piecesToPlay }, callbackFn) => {
    if (!games[roomId]) return;

    let playerId = games[roomId].socketIdToPlayerIdMap[socket.id]

    if (games[roomId].turnType === null) {
      let ok = games[roomId].setTurnTypeFromFirstPlay(piecesToPlay);
      if (!ok) {
        callbackFn(false);
        return;
      }
    } else if (games[roomId].turnType.count !== piecesToPlay.length) {
      callbackFn(false);
      return;
    }

    console.log('play: ', roomId, socket.id, playerId, piecesToPlay);

    io.to(roomId).emit('play', {
      socketId: socket.id,
      playerId: playerId,
      turnType: games[roomId].turnType
    });

    callbackFn(true);

    let result = games[roomId].registerPlay(playerId, piecesToPlay);
    if (result !== null) {
      io.to(roomId).emit('turnComplete', result);

      games[roomId].applyTurnAftermath(result.winnerId);
      console.log('aftermath', games[roomId].players.map(p => p.wins))
      games[roomId].players
        .map(p => p.socketId)
        .forEach(socketId => {
          io.to(socketId).emit(
            'turnAftermath',
            games[roomId].getPlayerStateBySocketId(socketId)
          );
        });
    }
  });
});

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});