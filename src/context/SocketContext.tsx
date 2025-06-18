// contexts/SocketContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSelector } from 'react-redux';
import io, { Socket } from 'socket.io-client';
import {RootState} from '../store/index'

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  callStatus: string;
  setCallStatus: (status: string) => void;
  connectSocket: () => void;
  disconnectSocket: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

const tokenurl = import.meta.env.VITE_APP_CALLING_SYSTEM_URL;

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [callStatus, setCallStatus] = useState('Disconnected');
  const {user , isLoggedIn} = useSelector((state:RootState)=>state.sessionReducer)
  const {agentId} = useSelector((state:RootState)=>state.callerReducer)
  const agentNumber = agentId?.replace(/\s+/g, '')
  useEffect(()=>{
    if(!isLoggedIn){
    disconnectSocket()
    }
  },[isLoggedIn])
  console.log("callStatus:::",callStatus)
  const newSocket = io(tokenurl);
    // useEffect(() => {
    //   const handleStatusUpdate = (data: { CallStatus: string }) => {
    //     console.log("Socket status update:::::", data.CallStatus);
    //     setCallStatus(data.CallStatus);
    //   };
    //   console.log("Socket status update:::::");
    //   // newSocket.on('call_status_update', handleStatusUpdate);
  
    //   return () => {
    //     newSocket.off('call_status_update', handleStatusUpdate);
    //   };
    // }, [callStatus]);
  const connectSocket = () => {
    if (socket?.connected) {
      console.log('Socket already connected');
      return;
    }
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      newSocket.emit('join', agentNumber);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('call_status_update', (data: { CallStatus: string }) => {
      console.log("data",data)
      console.log('Socket status update:', data.CallStatus);
      setCallStatus(data.CallStatus);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });
  };

  const disconnectSocket = () => {
    console.log("Disconnecting the socket")
    console.log("socket is here",socket);
    
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
      setCallStatus('Disconnected');
    }
  };

  // Auto-connect on mount
  // useEffect(() => {
  //   connectSocket();
  //   // Cleanup on unmount
  //   return () => {
  //     disconnectSocket();
  //   };
  // }, []);

  const value: SocketContextType = {
    socket,
    isConnected,
    callStatus,
    setCallStatus,
    connectSocket,
    disconnectSocket,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use socket context
export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};