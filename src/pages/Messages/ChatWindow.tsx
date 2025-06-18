import React, { useState, useRef, useEffect } from 'react';
import { Phone, Send, Paperclip, Smile } from 'lucide-react';
import { Chat, Channel, MessageList, Window } from 'stream-chat-react';
import { StreamChat } from 'stream-chat';
import 'stream-chat-react/dist/css/v2/index.css';

interface User {
  id: string;
  name: string;
  phone: string;
  online?: boolean;
}

interface ChatWindowProps {
  selectedUser: User | null;
  activeChannel: any;
  client: StreamChat | null;
}

// Custom expandable message input component
const ExpandableMessageInput: React.FC<{ channel: any }> = ({ channel }) => {
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      
      // Calculate new height
      const newHeight = Math.min(textarea.scrollHeight, 120); // Max height of 120px (about 5 lines)
      textarea.style.height = `${newHeight}px`;
    }
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && channel) {
      const messageText = message.trim();
      setMessage(''); // Clear immediately for better UX
      
      try {
        await channel.sendMessage({ text: messageText });
      } catch (error) {
        console.error('Error sending message:', error);
        // Restore message if sending failed
        setMessage(messageText);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !channel) return;

    setIsUploading(true);
    try {
      // Upload file to Stream
      const response = await channel.sendImage(file);
      console.log('File uploaded successfully:', response);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end space-x-3">
      {/* Attachment button */}
      <button
        type="button"
        className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 transition-colors"
      >
        <Paperclip className="w-5 h-5" />
      </button>

      {/* Message input container */}
      <div className="flex-1 relative">
        <div className="flex items-end bg-gray-100 rounded-2xl px-4 py-2">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none outline-none resize-none text-sm placeholder-gray-500 min-h-[24px] max-h-[120px] overflow-y-auto"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#CBD5E0 transparent'
            }}
            rows={1}
          />
          
          {/* Emoji button */}
          <button
            type="button"
            className="flex-shrink-0 ml-2 p-1 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Smile className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Send button */}
      <button
        type="submit"
        disabled={!message.trim()}
        className={`flex-shrink-0 p-2 rounded-full transition-colors ${
          message.trim()
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        <Send className="w-5 h-5" />
      </button>
    </form>
  );
};

const ChatWindow: React.FC<ChatWindowProps> = ({
  selectedUser,
  activeChannel,
  client,
}) => {
  console.log("activeChannel", activeChannel);

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No conversation selected</h3>
          <p className="text-gray-500">Choose a conversation from the sidebar to start messaging</p>
        </div>
      </div>
    );
  }

  if (!client || !activeChannel) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      <Chat client={client} theme="messaging light">
        <Channel channel={activeChannel}>
          <Window>
            {/* Custom Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    {selectedUser.online && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">{selectedUser.name}</h2>
                    <p className="text-sm text-gray-500">
                      {selectedUser.online ? 'Active now' : 'Last seen recently'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-hidden">
              <MessageList />
            </div>
            
            {/* Custom Message Input */}
            <div className="px-6 py-4 border-t border-gray-200 bg-white">
              <ExpandableMessageInput channel={activeChannel} />
            </div>
          </Window>
        </Channel>
      </Chat>
    </div>
  );
};

export default ChatWindow;