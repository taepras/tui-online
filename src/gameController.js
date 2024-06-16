const PIECES = [
  1, 2,
  3, 3, 4, 4,
  5, 5, 6, 6,
  7, 7, 8, 8,
  9, 9, 10, 10,
  11, 11, 12, 12,
  13, 13, 13, 13, 13, 14, 14, 14, 14, 14
];

const VALID_HU = [
  [1, 3, 5],
  [2, 4, 6],
  [7, 9, 11],
  [8, 10, 12],
];

const MAX_PLAYERS = 4;

const VALID_3HU_COMBOS = [[1, 3, 5], [2, 4, 6], [7, 9, 11], [8, 10, 12]]
const VALID_3JUK_COMBOS = [[13, 13, 13], [14, 14, 14]]

class GameController {
  constructor() {
    this.round = 0;
    this.gameLeader = 0;
    this.turnLeader = 0;
    this.turnType = null;
    // {
    //   count: 1,
    //   isHu: false
    // }

    this.allPieces = [...PIECES]
    this.players = [];
    this.playerTemplate = {
      playerId: -1,
      socketId: null,
      goal: 0,
      hand: [],
      wins: [],
      piecesToPlay: [],
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

      // // debugging hu
      // this.players[0].hand = [1, 3, 5, 13, 13, 13, 13, 13];
      // this.players[1].hand = [2, 4, 6, 8, 10, 12, 14, 14];
      // this.players[2].hand = [3, 5, 7, 9, 11, 12, 14, 14];
      // this.players[3].hand = [4, 6, 7, 8, 9, 10, 11, 14];

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

    // let newPlayer = { ...this.playerTemplate };
    let newPlayer = JSON.parse(JSON.stringify(this.playerTemplate));
    newPlayer.socketId = socketId;
    newPlayer.playerId = this.players.length;
    this.players.push(newPlayer);

    this.socketIdToPlayerIdMap[socketId] = newPlayer.playerId;

    return newPlayer;
  }

  removePlayer(socketId) {
    this.players = this.players.filter(p => p.socketId != socketId);
  }

  setTurnTypeFromFirstPlay(piecesPlayed) {
    if (!this.checkValidPlay(piecesPlayed)) return false;
    this.turnType = {
      count: piecesPlayed.length,
      isHu: this.checkValidHuPlay(piecesPlayed)
    }
    return this.turnType;
  }

  checkValidPlayWithTurnType(piecesToPlay) {
    if (this.turnType === null) return this.checkValidPlay(piecesToPlay);
    let isValid = true;
    isValid = isValid && piecesToPlay.length == this.turnType.count;
    isValid = isValid && this.turnType.isHu
      ? this.checkValidHuPlay(piecesToPlay)
      : piecesToPlay.every((p) => p == piecesToPlay[0]); // invalid moves are just disqualified at comparison
    return isValid;
  }

  checkValidPlay(piecesToPlay) {
    if (piecesToPlay.length == 0) return false;
    else if (piecesToPlay.length == 1) return true;
    else if (piecesToPlay.length == 2)
      return piecesToPlay[0] == piecesToPlay[1];

    let isValid = false;
    isValid = isValid || piecesToPlay.every((p) => p == 13); // red sa juk
    isValid = isValid || piecesToPlay.every((p) => p == 14); // black sa juk
    isValid = isValid || this.checkValidHuPlay(piecesToPlay);
    return isValid;
  }

  checkValidHuPlay(piecesToPlay) {
    if (piecesToPlay.length < 3) return false;

    const validSets = [
      [1, 3, 5],
      [2, 4, 6],
      [7, 9, 11],
      [8, 10, 12],
    ];
    console.log('ptp', piecesToPlay);
    return validSets.some((validSet) =>
      validSet.every((validPiece) => piecesToPlay.includes(validPiece))
    );
  }

  registerPlay(playerId, piecesToPlay) {
    if (this.turnType !== null && this.turnType.count !== piecesToPlay.length)
      return null;

    this.players[playerId].piecesToPlay = piecesToPlay;

    // if all played -- judge winner
    if (this.players.every(p => p.piecesToPlay.length > 0)) {
      console.log('judging...');
      let topPiece = 999;
      let winnerId = -1;
      for (let i in this.players) {
        if (!this.checkValidPlayWithTurnType(this.players[i].piecesToPlay))
          continue;
        let topPieceForPlayer = Math.min(...this.players[i].piecesToPlay)
        if (topPieceForPlayer < topPiece) {
          topPiece = topPieceForPlayer;
          winnerId = i;
        }
      }
      return { winnerId: +winnerId, topPiece };
    }

    return null;
  }

  applyTurnAftermath(winnerId) {
    winnerId = +winnerId;
    let winningPile = this.players[winnerId].piecesToPlay.map(p => []);
    let nPlayers = this.players.length;
    for (let i = 0; i < nPlayers; i++) {
      let clockIndex = (i + winnerId) % nPlayers;
      console.log(i, winnerId, nPlayers, (i + winnerId), (i + winnerId) % nPlayers)
      console.log('processing player', clockIndex, this.players[clockIndex].piecesToPlay);
      for (let j = 0; j < winningPile.length; j++) {
        let pieceType = this.players[clockIndex].piecesToPlay[j];

        // build winning pile
        winningPile[j].push(pieceType);

        // remove from hand
        var index = this.players[clockIndex].hand.indexOf(pieceType);
        if (index !== -1) {
          this.players[clockIndex].hand.splice(index, 1);
        }
      }
    }
    console.log('apply aftermath')
    this.players[winnerId].wins.push(...winningPile);
    this.players.forEach(p => p.piecesToPlay = [])

    this.turnLeader = winnerId;
    this.turnType = null;

    return this.players;
  }

  getMaskedGameInfoForPlayer (playerId) {
    return players; // TODO: mask info
  }
}

module.exports = GameController; // Exporting the GameController for use in other parts of the application
