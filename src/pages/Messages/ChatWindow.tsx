import React from 'react';
import { Phone, MoreVertical } from 'lucide-react';
import { Chat, Channel, MessageList, MessageInput, Window } from 'stream-chat-react';
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

const ChatWindow: React.FC<ChatWindowProps> = ({
  selectedUser,
  activeChannel,
  client,
}) => {
  console.log("activeChannel",activeChannel)

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
            
            {/* Message Input */}
            <div className="px-6 py-4 border-t border-gray-200 bg-white">
              <MessageInput />
            </div>
          </Window>
        </Channel>
      </Chat>
    </div>
  );
};

export default ChatWindow;