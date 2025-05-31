// app/game/[roomId]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import BingoBoard from '../../../components/BingoBoard';
import Avatar from 'boring-avatars';
import { useSocket } from '../../../lib/socket-provider';

export default function GameRoom() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.roomId;
  const { socket } = useSocket();
  const [gameState, setGameState] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [setupTimer, setSetupTimer] = useState(30);
  const [selectedNumber, setSelectedNumber] = useState('');
  const [isSetupPhase, setIsSetupPhase] = useState(true);

  useEffect(() => {
    if (!roomId || !socket) return;

    const handleJoinedRoom = ({ game }) => {
      setGameState(game);
      setCurrentPlayer(game.players.find(p => p.id === socket.id));
    };

    const handlePlayerJoined = ({ game }) => {
      setGameState(game);
    };

    const handlePlayerLeft = ({ game }) => {
      setGameState(game);
    };

    const handlePlayerReady = ({ game }) => {
      setGameState(game);
    };

    const handleGameStarted = ({ game }) => {
      setGameState(game);
      setIsSetupPhase(false);
    };

    const handleNumberCalled = ({ number, game, winner }) => {
      setGameState(game);
      if (winner) {
        alert(`🎉 ${winner.name} wins with BINGO!`);
      }
    };

    const handleError = ({ message }) => {
      alert(message);
    };

    socket.on('joined-room', handleJoinedRoom);
    socket.on('player-joined', handlePlayerJoined);
    socket.on('player-left', handlePlayerLeft);
    socket.on('player-ready', handlePlayerReady);
    socket.on('game-started', handleGameStarted);
    socket.on('number-called', handleNumberCalled);
    socket.on('error', handleError);

    return () => {
      socket.off('joined-room', handleJoinedRoom);
      socket.off('player-joined', handlePlayerJoined);
      socket.off('player-left', handlePlayerLeft);
      socket.off('player-ready', handlePlayerReady);
      socket.off('game-started', handleGameStarted);
      socket.off('number-called', handleNumberCalled);
      socket.off('error', handleError);
    };
  }, [roomId, socket]);

  // Setup timer countdown
  useEffect(() => {
    if (isSetupPhase && gameState?.gameState === 'waiting') {
      const timer = setInterval(() => {
        setSetupTimer(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isSetupPhase, gameState?.gameState]);

  const handleBoardGenerated = (board) => {
    if (socket) {
      socket.emit('set-board', { roomId, board });
    }
  };

  const callNumber = () => {
    const number = parseInt(selectedNumber);
    if (number && number >= 1 && number <= (gameState.gridSize * gameState.gridSize)) {
      socket.emit('call-number', { roomId, number });
      setSelectedNumber('');
    }
  };

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
        <div className="text-white text-2xl">Loading game...</div>
      </div>
    );
  }

  const isCurrentPlayerTurn = gameState.currentPlayer === socket?.id;
  const maxNumber = gameState.gridSize * gameState.gridSize;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">
              🎯 Room {roomId}
            </h1>
            <div className="text-right">
              <p className="text-lg font-semibold">
                {gameState.gridSize}x{gameState.gridSize} Grid
              </p>
              <p className="text-sm text-gray-600">
                {gameState.players.length} players
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Game Board */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              {isSetupPhase ? (
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">Setup Your Board</h2>
                  <div className="text-lg font-semibold text-blue-600">
                    Time remaining: {setupTimer}s
                  </div>
                  {!currentPlayer?.isReady && (
                    <p className="text-gray-600 mt-2">
                      Generate a random board or click cells to assign numbers manually
                    </p>
                  )}
                  {currentPlayer?.isReady && (
                    <p className="text-green-600 mt-2 font-semibold">
                      ✅ Board ready! Waiting for other players...
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">Game in Progress</h2>
                  {gameState.winner ? (
                    <div className="text-2xl font-bold text-green-600">
                      🎉 {gameState.players.find(p => p.id === gameState.winner)?.name} Wins!
                    </div>
                  ) : (
                    <div>
                      <p className="text-lg">
                        Current turn: <span className="font-semibold text-blue-600">
                          {gameState.players.find(p => p.id === gameState.currentPlayer)?.name}
                        </span>
                      </p>
                      {isCurrentPlayerTurn && (
                        <p className="text-green-600 font-semibold">It's your turn!</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              <BingoBoard
                gridSize={gameState.gridSize}
                board={currentPlayer?.board}
                markedCells={currentPlayer?.markedCells}
                onBoardGenerated={handleBoardGenerated}
                isSetupPhase={isSetupPhase && !currentPlayer?.isReady}
                calledNumbers={gameState.calledNumbers}
              />

              {/* Number calling interface */}
              {!isSetupPhase && !gameState.winner && (
                <div className="mt-6 text-center">
                  {isCurrentPlayerTurn ? (
                    <div className="space-y-4">
                      <div className="flex justify-center items-center space-x-4">
                        <input
                          type="number"
                          min="1"
                          max={maxNumber}
                          value={selectedNumber}
                          onChange={(e) => setSelectedNumber(e.target.value)}
                          placeholder={`Enter number (1-${maxNumber})`}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <motion.button
                          onClick={callNumber}
                          disabled={!selectedNumber || gameState.calledNumbers.includes(parseInt(selectedNumber))}
                          className="px-6 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          📢 Call Number
                        </motion.button>
                      </div>
                      {selectedNumber && gameState.calledNumbers.includes(parseInt(selectedNumber)) && (
                        <p className="text-red-500 text-sm">This number has already been called!</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-600">Waiting for {gameState.players.find(p => p.id === gameState.currentPlayer)?.name} to call a number...</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Players List */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Players</h3>
              <div className="space-y-3">
                {gameState.players.map((player) => (
                  <motion.div
                    key={player.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                      player.id === gameState.currentPlayer ? 'bg-blue-100 border-2 border-blue-300' : 'bg-gray-50'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <Avatar
                      size={40}
                      name={player.name}
                      variant={player.avatar.variant}
                      colors={player.avatar.colors}
                    />
                    <div className="flex-1">
                      <p className="font-semibold">{player.name}</p>
                      <div className="flex items-center space-x-2 text-sm">
                        <span>BINGO: {player.bingoCount}/5</span>
                        {player.isReady && <span className="text-green-600">✅</span>}
                        {player.id === socket?.id && <span className="text-blue-600">(You)</span>}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Called Numbers */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Called Numbers</h3>
              <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto">
                {gameState.calledNumbers.map((number, index) => (
                  <motion.div
                    key={number}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === gameState.calledNumbers.length - 1
                        ? 'bg-yellow-400 text-black'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {number}
                  </motion.div>
                ))}
              </div>
              {gameState.calledNumbers.length === 0 && (
                <p className="text-gray-500 text-center">No numbers called yet</p>
              )}
            </div>

            {/* Game Stats */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Game Stats</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-semibold">Grid Size:</span> {gameState.gridSize}x{gameState.gridSize}</p>
                <p><span className="font-semibold">Numbers Called:</span> {gameState.calledNumbers.length}/{maxNumber}</p>
                <p><span className="font-semibold">Game Status:</span> {
                  gameState.gameState === 'waiting' ? '⏳ Setting up' :
                  gameState.gameState === 'playing' ? '🎮 In Progress' :
                  '🏆 Finished'
                }</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
