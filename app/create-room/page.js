// app/create-room/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import AvatarSelector from '../../components/Avatar';
import { useSocket } from '../../lib/socket-provider';

export default function CreateRoom() {
  const router = useRouter();
  const { socket } = useSocket();
  const [playerName, setPlayerName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState({
    variant: 'marble',
    colors: ['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']
  });
  const [gridSize, setGridSize] = useState(5);
  const [maxPlayers, setMaxPlayers] = useState(6);

  useEffect(() => {
    if (!socket) return;

    const handleRoomCreated = ({ roomId }) => {
      router.push(`/game/${roomId}`);
    };

    const handleError = ({ message }) => {
      alert(message);
    };

    socket.on('room-created', handleRoomCreated);
    socket.on('error', handleError);

    return () => {
      socket.off('room-created', handleRoomCreated);
      socket.off('error', handleError);
    };
  }, [socket, router]);

  const createRoom = () => {
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }

    if (!socket) {
      alert('Socket not connected');
      return;
    }

    socket.emit('create-room', {
      playerName: playerName.trim(),
      avatar: selectedAvatar,
      gridSize,
      maxPlayers
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-500 to-pink-400 flex items-center justify-center p-4">
      <motion.div 
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          🏠 Create Room
        </h1>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your name"
              maxLength={20}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose Your Avatar
            </label>
            <AvatarSelector
              selectedAvatar={selectedAvatar}
              onAvatarChange={setSelectedAvatar}
              playerName={playerName}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grid Size
            </label>
            <select
              value={gridSize}
              onChange={(e) => setGridSize(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5x5 Grid (1-25)</option>
              <option value={7}>7x7 Grid (1-49)</option>
              <option value={10}>10x10 Grid (1-100)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Players
            </label>
            <select
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value={2}>2 Players</option>
              <option value={4}>4 Players</option>
              <option value={6}>6 Players</option>
              <option value={8}>8 Players</option>
            </select>
          </div>

          <motion.button
            onClick={createRoom}
            className="w-full py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            🚀 Create Room
          </motion.button>

          <button
            onClick={() => router.push('/')}
            className="w-full py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  );
}
