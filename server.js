const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.static(__dirname));
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Game state management
const waitingPlayers = [];
const activeGames = new Map();
const players = new Map();

class Game {
  constructor(player1Socket, player2Socket) {
    this.id = `game_${Date.now()}_${Math.random()}`;
    this.players = {
      1: {
        socket: player1Socket,
        id: player1Socket.id,
        choice: null,
        ready: false,
        x: 0,
        y: 0,
        health: 9000,
        superCharge: 0,
        rotation: 0
      },
      2: {
        socket: player2Socket,
        id: player2Socket.id,
        choice: null,
        ready: false,
        x: 0,
        y: 0,
        health: 9000,
        superCharge: 0,
        rotation: 0
      }
    };
    this.state = 'selection';
    this.gameStartTime = 0;
  }

  bothPlayersReady() {
    return this.players[1].ready && this.players[2].ready;
  }

  getPlayerNumber(socketId) {
    if (this.players[1].id === socketId) return 1;
    if (this.players[2].id === socketId) return 2;
    return null;
  }

  getOpponentNumber(playerNum) {
    return playerNum === 1 ? 2 : 1;
  }
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);
  players.set(socket.id, { socket });

  socket.on('find-match', () => {
    console.log(`Player ${socket.id} looking for match`);
    
    if (waitingPlayers.includes(socket.id)) return;

    if (waitingPlayers.length > 0) {
      const opponent = waitingPlayers.shift();
      const opponentSocket = io.sockets.sockets.get(opponent);
      
      if (opponentSocket) {
        const game = new Game(opponentSocket, socket);
        activeGames.set(game.id, game);
        
        players.get(opponent).gameId = game.id;
        players.get(socket.id).gameId = game.id;
        
        opponentSocket.emit('match-found', { gameId: game.id, playerNumber: 1 });
        socket.emit('match-found', { gameId: game.id, playerNumber: 2 });
        
        console.log(`Match created: ${game.id}`);
      }
    } else {
      waitingPlayers.push(socket.id);
      socket.emit('waiting-for-opponent');
    }
  });

  socket.on('cancel-matchmaking', () => {
    const index = waitingPlayers.indexOf(socket.id);
    if (index > -1) waitingPlayers.splice(index, 1);
  });

  socket.on('character-selected', ({ gameId, character }) => {
    const game = activeGames.get(gameId);
    if (!game) return;

    const playerNum = game.getPlayerNumber(socket.id);
    if (!playerNum) return;

    game.players[playerNum].choice = character;
    game.players[playerNum].ready = true;

    const opponentNum = game.getOpponentNumber(playerNum);
    game.players[opponentNum].socket.emit('opponent-selected', { character });

    if (game.bothPlayersReady()) {
      game.state = 'countdown';
      io.to(game.players[1].socket.id).emit('start-countdown', {
        player1Choice: game.players[1].choice,
        player2Choice: game.players[2].choice
      });
      io.to(game.players[2].socket.id).emit('start-countdown', {
        player1Choice: game.players[1].choice,
        player2Choice: game.players[2].choice
      });

      setTimeout(() => {
        game.state = 'playing';
        game.gameStartTime = Date.now();
        io.to(game.players[1].socket.id).emit('game-start');
        io.to(game.players[2].socket.id).emit('game-start');
      }, 3000);
    }
  });

  socket.on('player-update', ({ gameId, data }) => {
    const game = activeGames.get(gameId);
    if (!game || game.state !== 'playing') return;

    const playerNum = game.getPlayerNumber(socket.id);
    if (!playerNum) return;

    Object.assign(game.players[playerNum], data);

    const opponentNum = game.getOpponentNumber(playerNum);
    game.players[opponentNum].socket.emit('opponent-update', {
      playerNum: playerNum,
      data: data
    });
  });

  socket.on('player-attack', ({ gameId, attackData }) => {
    const game = activeGames.get(gameId);
    if (!game || game.state !== 'playing') return;

    const playerNum = game.getPlayerNumber(socket.id);
    if (!playerNum) return;

    const opponentNum = game.getOpponentNumber(playerNum);
    game.players[opponentNum].socket.emit('opponent-attack', {
      playerNum: playerNum,
      attackData: attackData
    });
  });

  socket.on('projectile-created', ({ gameId, projectile }) => {
    const game = activeGames.get(gameId);
    if (!game || game.state !== 'playing') return;

    const playerNum = game.getPlayerNumber(socket.id);
    if (!playerNum) return;

    const opponentNum = game.getOpponentNumber(playerNum);
    game.players[opponentNum].socket.emit('projectile-sync', { projectile });
  });

  socket.on('damage-dealt', ({ gameId, damage, targetPlayer }) => {
    const game = activeGames.get(gameId);
    if (!game || game.state !== 'playing') return;

    game.players[targetPlayer].health -= damage;

    io.to(game.players[1].socket.id).emit('health-update', {
      player1Health: game.players[1].health,
      player2Health: game.players[2].health
    });
    io.to(game.players[2].socket.id).emit('health-update', {
      player1Health: game.players[1].health,
      player2Health: game.players[2].health
    });

    if (game.players[1].health <= 0 || game.players[2].health <= 0) {
      const winner = game.players[1].health > 0 ? 1 : 2;
      game.state = 'finished';
      
      io.to(game.players[1].socket.id).emit('game-over', { winner });
      io.to(game.players[2].socket.id).emit('game-over', { winner });

      setTimeout(() => activeGames.delete(gameId), 5000);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    
    const queueIndex = waitingPlayers.indexOf(socket.id);
    if (queueIndex > -1) waitingPlayers.splice(queueIndex, 1);

    const playerData = players.get(socket.id);
    if (playerData && playerData.gameId) {
      const game = activeGames.get(playerData.gameId);
      if (game) {
        const playerNum = game.getPlayerNumber(socket.id);
        if (playerNum) {
          const opponentNum = game.getOpponentNumber(playerNum);
          game.players[opponentNum].socket.emit('opponent-disconnected');
          activeGames.delete(playerData.gameId);
        }
      }
    }

    players.delete(socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
