// components/Avatar.js
import { useState } from 'react';
import Avatar from 'boring-avatars';
import { motion } from 'framer-motion';

const avatarVariants = ['marble', 'beam', 'pixel', 'sunset', 'ring', 'bauhaus'];
const avatarColors = [
  ['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90'],
  ['#264653', '#2A9D8F', '#E9C46A', '#F4A261', '#E76F51'],
  ['#E63946', '#F77F00', '#FCBF49', '#003566', '#0077B6'],
  ['#7209B7', '#A663CC', '#4C956C', '#61A5C2', '#F18701'],
  ['#FF006E', '#8338EC', '#3A86FF', '#06FFA5', '#FFBE0B'],
  ['#F72585', '#B5179E', '#7209B7', '#480CA8', '#3A0CA3']
];

export default function AvatarSelector({ selectedAvatar, onAvatarChange, playerName }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextAvatar = () => {
    const newIndex = (currentIndex + 1) % avatarVariants.length;
    setCurrentIndex(newIndex);
    onAvatarChange({
      variant: avatarVariants[newIndex],
      colors: avatarColors[newIndex]
    });
  };

  const prevAvatar = () => {
    const newIndex = currentIndex === 0 ? avatarVariants.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    onAvatarChange({
      variant: avatarVariants[newIndex],
      colors: avatarColors[newIndex]
    });
  };

  return (
    <div className="flex items-center justify-center space-x-4 p-6 bg-white rounded-lg shadow-lg">
      <motion.button
        className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={prevAvatar}
      >
        ⬅️
      </motion.button>

      <motion.div
        key={currentIndex}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center"
      >
        <Avatar
          size={80}
          name={playerName}
          variant={avatarVariants[currentIndex]}
          colors={avatarColors[currentIndex]}
        />
        <p className="mt-2 text-sm font-medium text-gray-600">
          {avatarVariants[currentIndex]}
        </p>
      </motion.div>

      <motion.button
        className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={nextAvatar}
      >
        ➡️
      </motion.button>
    </div>
  );
}
