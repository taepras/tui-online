const PIECES = [
  1, 2,
  3, 3, 4, 4,
  5, 5, 6, 6,
  7, 7, 8, 8,
  9, 9, 10, 10,
  11, 11, 12, 12,
  13, 13, 13, 13, 13, 14, 14, 14, 14, 14
];

const MAX_PLAYERS = 4;

const VALID_3HU_COMBOS = [[1, 3, 5], [2, 4, 6], [7, 9, 11], [8, 10, 12]]
const VALID_3JUL_COMBOS = [[13, 13, 13], [14, 14, 14]]

class GameController {
  constructor() {
    this.round = 0;
    this.gameLeader = 0;
    this.turnLeader = 0;

    this.allPieces = [...PIECES]
    this.players = [];
    this.playerTemplate = {
      playerId: -1,
      socketId: null,
      goal: 0,
      hand: [],
      wins: [],
      selected: [],
    }

    this.socketIdToPlayerIdMap = {};

    this.gameState = 'waiting'; 
    // Possible states: 'waiting', 'start', 'set_goal', 'leader_turn', 'followers_turn'
  }

  setState(newGameState) {

    this.gameState = newGameState;

    if (this.gameState == 'start') {
      this.allPieces = [...PIECES];
      this.allPieces.sort((a, b) => 0.5 - Math.random());

      this.players.forEach((p, i) => {
        p.hand = this.allPieces.slice((i * 8), (i * 8) + 8);
        p.hand.sort((a, b) => a - b);
        console.log(p.hand);
        
      });

      this.setState('set_goal');


    } else if (this.gameState == 'set_goal') {
      // gameLeader.
    } else if (this.gameState == 'leader_turn') {
      
    }

  }

  start() {
    this.setState('start');
  }

  getPlayersState() {
    return this.players;
  }

  getPlayerStateBySocketId(socketId) {
    const index = this.socketIdToPlayerIdMap[socketId];
    return this.players[index];
  }

  addPlayer(socketId) {
    if (this.players.length >= 4) return false;

    let newPlayer = { ...this.playerTemplate };
    newPlayer.socketId = socketId;
    newPlayer.playerId = this.players.length;
    this.players.push(newPlayer);

    this.socketIdToPlayerIdMap[socketId] = newPlayer.playerId;

    return newPlayer;
  }

  removePlayer(socketId) {
    this.players = this.players.filter(p => p.socketId != socketId);
  }

}

module.exports = GameController; // Exporting the GameController for use in other parts of the application
