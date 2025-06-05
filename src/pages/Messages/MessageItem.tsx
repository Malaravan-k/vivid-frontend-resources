import React from 'react';
import { Message } from '../../types/message.types';
import { format } from 'date-fns';

interface MessageItemProps {
  message: Message;
  isCurrentUser: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isCurrentUser }) => {
  const formattedTime = format(new Date(message.timestamp), 'h:mm a');
  
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isCurrentUser && (
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs mr-2">
          {message.senderId.charAt(0).toUpperCase()}
        </div>
      )}
      
      <div className={`max-w-[70%] ${isCurrentUser ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'} rounded-lg px-4 py-2`}>
        <p className="text-sm">{message.text}</p>
        <p className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
          {formattedTime}
        </p>
      </div>
      
      {isCurrentUser && (
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs ml-2">
          {message.senderId.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
};

export default MessageItem;