import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import UserList from './UserList';
import ChatWindow from './ChatWindow';
import { chatActions } from '../../store/actions/chat.actions';
import { RootState } from '../../store/index';
import { MessageCircle, Loader2 } from 'lucide-react';
import { initializeSocket, getSocket } from '../../utils/socketService';
import OwnerInfo from './OwnerInfo';

const ChatApp: React.FC = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const {
    loading,
    error,
    isInitialized,
    users,
    selectedUser,
    socketConnected
  } = useSelector((state: RootState) => state.chatReducer);
  
  const agentNumber = localStorage.getItem('primary_mobile_number');
  console.log("selectedUser", selectedUser);
  
  const tokenurl = import.meta.env.VITE_APP_CALLING_SYSTEM_URL || 'ws://localhost:3001';

  // ALL HOOKS MUST RUN ON EVERY RENDER - MOVED BEFORE EARLY RETURNS

  // Initialize users and socket
  useEffect(() => {
    if (agentNumber) {
      dispatch(chatActions.getUsers(agentNumber));
    }
  }, [dispatch, agentNumber, isInitialized]);

  // Initialize socket connection
  useEffect(() => {
    const socket = initializeSocket(tokenurl);

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      dispatch(chatActions.setSocketConnected(true));
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      dispatch(chatActions.setSocketConnected(false));
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      dispatch(chatActions.setSocketConnected(false));
    });

    // Handle incoming messages
    socket.on('new_message', (messageData) => {
      console.log('New message received from socket:', messageData);
      if(messageData?.author !== agentNumber){
        dispatch(chatActions.receiveMessage(messageData));
      }
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [dispatch, tokenurl, agentNumber]);

  // Join conversation room when user is selected
  useEffect(() => {
    if (selectedUser?.conversation_sid && socketConnected) {
      const socket = getSocket();
      console.log('Joining conversation room:', selectedUser.conversation_sid);
      
      // Join the conversation room
      socket.emit('join', { conversation_sid: selectedUser.conversation_sid });

      // Cleanup on conversation change
      return () => {
        socket.emit('leave', { conversation_sid: selectedUser.conversation_sid });
      };
    }
  }, [selectedUser?.conversation_sid, socketConnected]);

  useEffect(() => {
    if (location.state && isInitialized) {
      const { customer_id, conversation_id, response } = location.state;
      if (response?.conversation_sid) {
        const userToSelect = users.find(u => u.conversation_sid === response.conversation_sid) || response;
        dispatch(chatActions.selectUser(userToSelect));
      } else if (customer_id && conversation_id) {
        const userToSelect = users.find(u => u.conversation_sid === conversation_id) || {
          conversation_sid: conversation_id,
          friendly_name: customer_id,
          owner_no: customer_id
        };
        dispatch(chatActions.selectUser(userToSelect));
      }
    }
  }, [location.state, isInitialized, users, dispatch]);

  if (loading && !isInitialized) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <Loader2 className="absolute -top-1 -right-1 w-6 h-6 text-blue-600 animate-spin" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Initializing Chat</h3>
          <p className="text-gray-600">Setting up your conversations...</p>
        </div>
      </div>
    );
  }

  if (error && !isInitialized) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-red-50 via-white to-pink-100 flex items-center justify-center z-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white text-2xl font-bold">!</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Chat</h3>
          <p className="text-gray-600 mb-6">
            {typeof error === 'string' ? error : 'Please check your connection and try again.'}
          </p>
          <button
            onClick={() => dispatch(chatActions.getUsers(agentNumber))}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16 fixed inset-0 overflow-hidden">
      <div className="absolute inset-4">
        {/* Chat Interface */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20 h-full">
          <div className="flex h-full">
            <UserList />
            <ChatWindow />
            <OwnerInfo/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatApp;