import React from 'react';
import { Conversation } from '../../types/message.types';
import { format } from 'date-fns';
import { ChevronDown } from 'lucide-react';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  userId: string;
  isLoading: boolean;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  userId,
  isLoading
}) => {
  // Sort conversations by last message timestamp (newest first)
  const sortedConversations = [...conversations].sort((a, b) => {
    if (!a.lastMessage) return 1;
    if (!b.lastMessage) return -1;
    return new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime();
  });

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold">Messages</h2>
          <ChevronDown className="ml-1 h-4 w-4 text-gray-500" />
        </div>
        <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">12</div>
      </div>
      
      <div className="px-4 py-2 border-b border-gray-200">
        <input
          type="text"
          placeholder="Search messages"
          className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">Loading conversations...</div>
        ) : sortedConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No conversations found</div>
        ) : (
          sortedConversations.map((conversation) => {
            const isActive = activeConversationId === conversation.id;
            const otherParticipant = conversation.participants.find(id => id !== userId) || '';
            const lastMessageTime = conversation.lastMessage 
              ? format(new Date(conversation.lastMessage.timestamp), 'h:mm a')
              : '';
            
            return (
              <div
                key={conversation.id}
                className={`p-3 flex cursor-pointer hover:bg-gray-100 ${
                  isActive ? 'bg-blue-50' : ''
                }`}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white mr-3 flex-shrink-0">
                  {otherParticipant.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-900 truncate">
                      {otherParticipant || 'Unknown'}
                    </h3>
                    <span className="text-xs text-gray-500">{lastMessageTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 truncate">
                      {conversation.lastMessage?.text || 'No messages yet'}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConversationList;