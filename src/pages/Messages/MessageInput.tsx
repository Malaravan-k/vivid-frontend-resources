import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { emitTyping } from '../../utils/socket';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  userId: string;
  conversationId: string;
  disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  userId,
  conversationId,
  disabled = false
}) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Focus the input when the component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    return () => {
      // Clear any pending typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    
    // Emit typing event with debounce
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      emitTyping(userId, conversationId);
    }, 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
      
      // Focus back on the input after sending
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 flex items-center">
      <input
        ref={inputRef}
        type="text"
        value={message}
        onChange={handleChange}
        placeholder="Type a message..."
        className="flex-1 bg-gray-100 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        disabled={disabled}
      />
      <button
        type="submit"
        className={`ml-2 rounded-full p-2 ${
          message.trim() ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'
        } focus:outline-none focus:ring-2 focus:ring-blue-400`}
        disabled={!message.trim() || disabled}
      >
        <Send size={20} />
      </button>
    </form>
  );
};

export default MessageInput;