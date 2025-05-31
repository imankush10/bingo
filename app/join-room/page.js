// app/join-room/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import AvatarSelector from '../../components/Avatar';
import { useSocket } from '../../lib/socket-provider';

export default function JoinRoom() {
  const router = useRouter();
  const { socket } = useSocket();
  const [playerName, setPlayerName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState({
    variant: 'marble',
    colors: ['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']
  });
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('');

  useEffect(() => {
    if (!socket) return;

    const handleRoomsList = (rooms) => {
      setAvailableRooms(rooms);
    };

    const handleJoinedRoom = ({ roomId }) => {
      router.push(`/game/${roomId}`);
    };

    const handleError = ({ message }) => {
      alert(message);
    };

    socket.on('rooms-list', handleRoomsList);
    socket.on('joined-room', handleJoinedRoom);
    socket.on('error', handleError);

    // Get available rooms
    socket.emit('get-rooms');

    return () => {
      socket.off('rooms-list', handleRoomsList);
      socket.off('joined-room', handleJoinedRoom);
      socket.off('error', handleError);
    };
  }, [socket, router]);

  const joinRoom = () => {
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }

    if (!selectedRoom) {
      alert('Please select a room');
      return;
    }

    if (!socket) {
      alert('Socket not connected');
      return;
    }

    socket.emit('join-room', {
      roomId: selectedRoom,
      playerName: playerName.trim(),
      avatar: selectedAvatar
    });
  };

  const refreshRooms = () => {
    if (socket) {
      socket.emit('get-rooms');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-blue-500 to-purple-400 flex items-center justify-center p-4">
      <motion.div 
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          🚪 Join Room
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
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
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Available Rooms</h3>
              <button
                onClick={refreshRooms}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm"
              >
                🔄 Refresh
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {availableRooms.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No rooms available</p>
              ) : (
                availableRooms.map((room) => (
                  <motion.div
                    key={room.roomId}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedRoom === room.roomId
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedRoom(room.roomId)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">Room {room.roomId}</p>
                        <p className="text-sm text-gray-600">
                          {room.gridSize}x{room.gridSize} Grid
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {room.playerCount}/{room.maxPlayers} Players
                        </p>
                        <div className="flex space-x-1">
                          {Array.from({ length: room.maxPlayers }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full ${
                                i < room.playerCount ? 'bg-green-500' : 'bg-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            <motion.button
              onClick={joinRoom}
              disabled={!selectedRoom || !playerName.trim()}
              className="w-full py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              whileHover={{ scale: selectedRoom && playerName.trim() ? 1.02 : 1 }}
              whileTap={{ scale: selectedRoom && playerName.trim() ? 0.98 : 1 }}
            >
              🎮 Join Selected Room
            </motion.button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  );
}
