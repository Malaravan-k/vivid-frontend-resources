import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { messageActions } from '../../store/actions/message.actions';
import { initializeSocket, disconnectSocket, sendMessage as socketSendMessage } from '../../utils/socket';
import ConversationList from './ConversationList';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import CaseDetails from './CaseDetails';
import { Message } from '../../types/message.types';
import { Phone, Mail, Video } from 'lucide-react';
import { RootState } from '../../store';

// Mock current user (would come from auth)
const CURRENT_USER_ID = "user-123";

const MessagesContainer: React.FC = () => {
  const dispatch = useDispatch();
  const {
    messages,
    conversations,
    activeConversation,
    caseDetails,
    loading,
    sending
  } = useSelector((state:RootState) => state.messageReducer);
  
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  
  // Initialize socket connection
  useEffect(() => {
    const socket = initializeSocket(dispatch, CURRENT_USER_ID);
    
    return () => {
      disconnectSocket();
    };
  }, [dispatch]);
  
  // Fetch conversations on component mount
  useEffect(() => {
    dispatch(messageActions.fetchConversations(CURRENT_USER_ID));
  }, [dispatch]);
  
  // Fetch messages when active conversation changes
  useEffect(() => {
    if (activeConversation) {
      dispatch(messageActions.fetchMessages(activeConversation));
      dispatch(messageActions.markAsRead(activeConversation, CURRENT_USER_ID));
      
      // Find the case ID for this conversation
      const conversation = conversations.find(c => c.id === activeConversation);
      if (conversation && conversation.caseId) {
        setActiveCaseId(conversation.caseId);
        dispatch(messageActions.fetchCaseDetails(conversation.caseId));
      }
    }
  }, [dispatch, activeConversation, conversations]);
  
  const handleSelectConversation = (conversationId: string) => {
    dispatch(messageActions.setActiveConversation(conversationId));
  };
  
  const handleSendMessage = (text: string) => {
    if (!activeConversation) return;
    
    const conversation = conversations.find(c => c.id === activeConversation);
    if (!conversation) return;
    
    // Find the other participant
    const recipientId = conversation.participants.find(id => id !== CURRENT_USER_ID);
    if (!recipientId) return;
    
    const messageData: Omit<Message, 'id' | 'timestamp' | 'read'> = {
      text,
      senderId: CURRENT_USER_ID,
      receiverId: recipientId
    };
    
    // Send through both Redux and Socket
    dispatch(messageActions.sendMessage(messageData));
    socketSendMessage(messageData);
  };
  
  const activeMessages = activeConversation && messages[activeConversation] 
    ? messages[activeConversation] 
    : [];
  
  const activeCaseDetails = activeCaseId && caseDetails[activeCaseId]
    ? caseDetails[activeCaseId]
    : null;
  
  return (
    <div className="h-[700px] flex flex-col bg-white rounded-xl">
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Conversations List */}
        <div className="w-80 border-r border-gray-200 flex flex-col">
          <ConversationList
            conversations={conversations}
            activeConversationId={activeConversation}
            onSelectConversation={handleSelectConversation}
            userId={CURRENT_USER_ID}
            isLoading={loading}
          />
        </div>
        
        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {activeConversation ? (
            <>
              {/* Chat header */}
              <div className="border-b border-gray-200 p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white mr-3">
                    <span className="text-sm font-medium">
                      {conversations.find(c => c.id === activeConversation)?.participants.find(id => id !== CURRENT_USER_ID)?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-medium">
                      {conversations.find(c => c.id === activeConversation)?.participants.find(id => id !== CURRENT_USER_ID) || 'Unknown'}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {activeCaseDetails?.idNumber || 'Loading case...'}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
                    <Phone size={18} />
                  </button>
                  <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
                    <Video size={18} />
                  </button>
                  <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
                    <Mail size={18} />
                  </button>
                </div>
              </div>
              
              {/* Messages */}
              <MessageList
                messages={activeMessages}
                currentUserId={CURRENT_USER_ID}
                isLoading={loading}
              />
              
              {/* Message Input */}
              <MessageInput
                onSendMessage={handleSendMessage}
                userId={CURRENT_USER_ID}
                conversationId={activeConversation}
                disabled={sending}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-xl mb-2">Select a conversation to start messaging</p>
                <p className="text-sm">or create a new conversation</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Case Details Panel */}
        <div className="w-80">
          <CaseDetails
            caseDetails={activeCaseDetails}
            isLoading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default MessagesContainer;