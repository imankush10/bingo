// components/BingoBoard.js
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function BingoBoard({ 
  gridSize, 
  board, 
  markedCells, 
  onBoardGenerated, 
  isSetupPhase,
  calledNumbers 
}) {
  const [localBoard, setLocalBoard] = useState(board || []);
  const [setupBoard, setSetupBoard] = useState([]);
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    if (isSetupPhase) {
      // Initialize empty board for manual setup
      const emptyBoard = Array(gridSize).fill().map(() => Array(gridSize).fill(null));
      setSetupBoard(emptyBoard);
    }
  }, [gridSize, isSetupPhase]);

  const generateRandomBoard = () => {
    const maxNumber = gridSize * gridSize;
    const numbers = Array.from({ length: maxNumber }, (_, i) => i + 1);
    const shuffled = numbers.sort(() => Math.random() - 0.5);
    
    const newBoard = [];
    for (let i = 0; i < gridSize; i++) {
      newBoard.push(shuffled.slice(i * gridSize, (i + 1) * gridSize));
    }
    
    setLocalBoard(newBoard);
    onBoardGenerated(newBoard);
  };

  const handleCellClick = (row, col) => {
    if (!isSetupPhase) return;

    const newBoard = [...setupBoard];
    
    if (newBoard[row][col] === null) {
      // Assign next number
      newBoard[row][col] = clickCount + 1;
      setClickCount(clickCount + 1);
    } else if (newBoard[row][col] === clickCount) {
      // Remove last assigned number
      newBoard[row][col] = null;
      setClickCount(clickCount - 1);
    }
    
    setSetupBoard(newBoard);
    
    // Check if board is complete
    const isComplete = newBoard.every(row => row.every(cell => cell !== null));
    if (isComplete) {
      setLocalBoard(newBoard);
      onBoardGenerated(newBoard);
    }
  };

  const displayBoard = isSetupPhase ? setupBoard : localBoard;

  const getCellStyle = (row, col, number) => {
    const isMarked = markedCells?.has(`${row}-${col}`);
    const isLastCalled = calledNumbers?.[calledNumbers.length - 1] === number;
    
    let baseStyle = "w-12 h-12 border-2 border-gray-300 flex items-center justify-center font-bold text-lg rounded-lg transition-all duration-300 cursor-pointer ";
    
    if (isMarked) {
      baseStyle += "bg-red-500 text-white border-red-600 ";
    } else if (isLastCalled) {
      baseStyle += "bg-yellow-400 text-black border-yellow-500 animate-pulse ";
    } else {
      baseStyle += "bg-white text-gray-800 hover:bg-gray-100 ";
    }
    
    return baseStyle;
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {isSetupPhase && (
        <div className="text-center mb-4">
          <button
            onClick={generateRandomBoard}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mb-2"
          >
            🎲 Generate Random Board
          </button>
          <p className="text-sm text-gray-600">
            Or click cells to assign numbers manually (Click count: {clickCount}/{gridSize * gridSize})
          </p>
        </div>
      )}

      <div 
        className="grid gap-2 p-4 bg-gray-100 rounded-lg shadow-lg"
        style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
      >
        {displayBoard.map((row, rowIndex) =>
          row.map((number, colIndex) => (
            <motion.div
              key={`${rowIndex}-${colIndex}`}
              className={getCellStyle(rowIndex, colIndex, number)}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: (rowIndex * gridSize + colIndex) * 0.05 }}
            >
              {number || ''}
            </motion.div>
          ))
        )}
      </div>

      {!isSetupPhase && (
        <div className="text-center">
          <p className="text-lg font-semibold">
            BINGO Progress: {markedCells?.size || 0} marked
          </p>
        </div>
      )}
    </div>
  );
}
