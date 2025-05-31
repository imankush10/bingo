// bingo/components/SocketProvider.tsx
'use client';
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

const SocketContext = createContext(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Ensure this runs only on the client
    if (typeof window !== 'undefined') {
      const socketIoUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL;
      
      if (!socketIoUrl) {
        console.error("Socket server URL is not defined. Please set NEXT_PUBLIC_SOCKET_SERVER_URL.");
        return;
      }
      
      console.log('Attempting to connect to Socket.IO server at:', socketIoUrl);

      const newSocket = io(socketIoUrl, {
        reconnectionAttempts: 5,
        reconnectionDelay: 2000, // Increased delay
        transports: ['websocket'], // Prioritize WebSockets
      });

      newSocket.on('connect', () => {
        console.log('Socket connected successfully:', newSocket.id);
        setIsConnected(true);
      });

      newSocket.on('disconnect', (reason) => {
        console.warn('Socket disconnected:', reason);
        setIsConnected(false);
        if (reason === 'io server disconnect') {
          // The server deliberately disconnected the socket
          newSocket.connect();
        }
        // Else, the client will automatically try to reconnect if not a deliberate server disconnect
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message, error.name);
        // Consider providing user feedback if connection fails repeatedly
      });

      setSocket(newSocket);

      // Cleanup on component unmount
      return () => {
        if (newSocket.connected) {
          console.log('Disconnecting socket due to component unmount...');
          newSocket.disconnect();
        } else {
          console.log('Socket was not connected, removing listeners.');
          newSocket.removeAllListeners(); // Clean up listeners if not connected
        }
      };
    }
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
