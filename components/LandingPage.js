// components/LandingPage.js
'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: "0px 10px 20px rgba(0,0,0,0.2)" },
    tap: { scale: 0.95 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center">
      <div className="text-center">
        <motion.h1 
          className="text-8xl font-bold text-white mb-4 drop-shadow-lg"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          🎯 BINGO
        </motion.h1>
        
        <motion.p 
          className="text-2xl text-white mb-12 drop-shadow-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          The Ultimate Multiplayer Experience
        </motion.p>

        <div className="space-y-6">
          <motion.button
            className="w-64 py-4 px-8 bg-green-500 text-white text-xl font-bold rounded-full shadow-lg hover:bg-green-600 transition-colors"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            onClick={() => router.push('/join-room')}
          >
            🎮 PLAY NOW
          </motion.button>

          <motion.button
            className="w-64 py-4 px-8 bg-blue-500 text-white text-xl font-bold rounded-full shadow-lg hover:bg-blue-600 transition-colors"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            onClick={() => router.push('/create-room')}
          >
            🏠 CREATE ROOM
          </motion.button>

          <motion.button
            className="w-64 py-4 px-8 bg-yellow-500 text-white text-xl font-bold rounded-full shadow-lg hover:bg-yellow-600 transition-colors"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            onClick={() => router.push('/join-room')}
          >
            🚪 JOIN ROOM
          </motion.button>
        </div>

        <motion.div 
          className="mt-12 text-white text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <p>🎲 Multiple grid sizes • 👥 Up to 6 players • 🏆 Real-time gameplay</p>
        </motion.div>
      </div>
    </div>
  );
}
