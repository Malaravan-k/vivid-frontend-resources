import React, { useEffect, useRef } from 'react';
import { Message } from '../../types/message.types';
import MessageItem from './MessageItem';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  isLoading: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 p-4 flex items-center justify-center">
        <p className="text-gray-500">Loading messages...</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-2">No messages yet</p>
          <p className="text-sm text-gray-400">Start a conversation by sending a message</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 overflow-y-auto">
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          isCurrentUser={message.senderId === currentUserId}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;