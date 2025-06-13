import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './useAuth';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = io('http://localhost:3001', {
        auth: {
          userId: user.id,
          username: user.username,
        },
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
        console.log('Connecté au serveur Socket.IO');
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
        console.log('Déconnecté du serveur Socket.IO');
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  const value = {
    socket,
    isConnected,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket doit être utilisé dans SocketProvider');
  }
  return context;
}