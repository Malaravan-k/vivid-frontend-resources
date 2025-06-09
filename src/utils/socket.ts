import { io, Socket } from 'socket.io-client';
import { messageActions } from '../store/actions/message.actions'
import { Dispatch } from '@reduxjs/toolkit';
import { Message } from '../types/message.types'

let socket: Socket;

export const initializeSocket = (dispatch: Dispatch, userId: string) => {
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
  
  // Close any existing connection
  if (socket) {
    socket.close();
  }
  
  // Create new connection
  socket = io(SOCKET_URL, {
    query: { userId },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });
  
  // Socket event listeners
  socket.on('connect', () => {
    console.log('Connected to websocket server');
  });
  
  socket.on('disconnect', () => {
    console.log('Disconnected from websocket server');
  });
  
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
  
  socket.on('reconnect', (attempt) => {
    console.log(`Reconnected on attempt: ${attempt}`);
  });
  
  socket.on('message', (message: Message) => {
    dispatch(messageActions.receiveMessage(message));
  });
  
  socket.on('typing', ({ userId, conversationId }: { userId: string; conversationId: string }) => {
    // Handle typing indicator (could dispatch an action to show typing status)
    console.log(`User ${userId} is typing in conversation ${conversationId}`);
  });
  
  return socket;
};

export const sendMessage = (message: Omit<Message, 'id' | 'timestamp' | 'read'>) => {
  if (socket && socket.connected) {
    socket.emit('message', message);
  } else {
    console.error('Socket not connected');
  }
};

export const emitTyping = (userId: string, conversationId: string) => {
  if (socket && socket.connected) {
    socket.emit('typing', { userId, conversationId });
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};