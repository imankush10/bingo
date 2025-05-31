// utils/bingo.js
export class BingoGame {
  constructor(gridSize = 5, maxPlayers = 6) {
    this.gridSize = gridSize;
    this.maxPlayers = maxPlayers;
    this.maxNumber = gridSize * gridSize;
    this.players = new Map();
    this.currentPlayerIndex = 0;
    this.calledNumbers = [];
    this.gameState = 'waiting'; // waiting, setup, playing, finished
    this.winner = null;
  }

  generateRandomBoard() {
    const numbers = Array.from({ length: this.maxNumber }, (_, i) => i + 1);
    const shuffled = numbers.sort(() => Math.random() - 0.5);
    return this.createBoardMatrix(shuffled);
  }

  createBoardMatrix(numbers) {
    const board = [];
    for (let i = 0; i < this.gridSize; i++) {
      board.push(numbers.slice(i * this.gridSize, (i + 1) * this.gridSize));
    }
    return board;
  }

  addPlayer(playerId, playerName, avatar) {
    if (this.players.size >= this.maxPlayers) {
      throw new Error('Room is full');
    }
    
    this.players.set(playerId, {
      id: playerId,
      name: playerName,
      avatar: avatar,
      board: null,
      markedCells: new Set(),
      completedLines: [],
      bingoCount: 0,
      isReady: false
    });
  }

  removePlayer(playerId) {
    this.players.delete(playerId);
  }

  setPlayerBoard(playerId, board) {
    const player = this.players.get(playerId);
    if (player) {
      player.board = board;
      player.isReady = true;
    }
  }

  callNumber(number) {
    if (this.calledNumbers.includes(number)) {
      throw new Error('Number already called');
    }
    
    this.calledNumbers.push(number);
    
    // Mark number for all players
    this.players.forEach(player => {
      this.markNumberForPlayer(player.id, number);
    });
    
    // Move to next player
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.size;
    
    return this.checkForWinner();
  }

  markNumberForPlayer(playerId, number) {
    const player = this.players.get(playerId);
    if (!player || !player.board) return;

    // Find and mark the number on player's board
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        if (player.board[row][col] === number) {
          player.markedCells.add(`${row}-${col}`);
          this.checkPlayerLines(playerId);
          return;
        }
      }
    }
  }

  checkPlayerLines(playerId) {
    const player = this.players.get(playerId);
    if (!player) return;

    const newLines = [];
    
    // Check rows
    for (let row = 0; row < this.gridSize; row++) {
      if (this.isLineComplete(player, 'row', row)) {
        newLines.push(`row-${row}`);
      }
    }
    
    // Check columns
    for (let col = 0; col < this.gridSize; col++) {
      if (this.isLineComplete(player, 'col', col)) {
        newLines.push(`col-${col}`);
      }
    }
    
    // Check diagonals
    if (this.isLineComplete(player, 'diagonal', 0)) {
      newLines.push('diagonal-0');
    }
    if (this.isLineComplete(player, 'diagonal', 1)) {
      newLines.push('diagonal-1');
    }
    
    // Add only new completed lines
    const previousCount = player.completedLines.length;
    player.completedLines = [...new Set([...player.completedLines, ...newLines])];
    player.bingoCount = player.completedLines.length;
    
    return player.bingoCount > previousCount;
  }

  isLineComplete(player, type, index) {
    const positions = this.getLinePositions(type, index);
    return positions.every(pos => player.markedCells.has(pos));
  }

  getLinePositions(type, index) {
    const positions = [];
    
    if (type === 'row') {
      for (let col = 0; col < this.gridSize; col++) {
        positions.push(`${index}-${col}`);
      }
    } else if (type === 'col') {
      for (let row = 0; row < this.gridSize; row++) {
        positions.push(`${row}-${index}`);
      }
    } else if (type === 'diagonal' && index === 0) {
      for (let i = 0; i < this.gridSize; i++) {
        positions.push(`${i}-${i}`);
      }
    } else if (type === 'diagonal' && index === 1) {
      for (let i = 0; i < this.gridSize; i++) {
        positions.push(`${i}-${this.gridSize - 1 - i}`);
      }
    }
    
    return positions;
  }

  checkForWinner() {
    for (const [playerId, player] of this.players) {
      if (player.bingoCount >= 5) {
        this.winner = playerId;
        this.gameState = 'finished';
        return player;
      }
    }
    return null;
  }

  getCurrentPlayer() {
    const playerIds = Array.from(this.players.keys());
    return playerIds[this.currentPlayerIndex];
  }

  getGameState() {
    return {
      gridSize: this.gridSize,
      players: Array.from(this.players.values()),
      currentPlayer: this.getCurrentPlayer(),
      calledNumbers: this.calledNumbers,
      gameState: this.gameState,
      winner: this.winner
    };
  }
}
