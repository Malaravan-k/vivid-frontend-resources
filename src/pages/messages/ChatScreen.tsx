import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMessageById } from '../../utils/api';
import { Message } from '../../types';
import Button from '../../components/ui/Button';
import { ArrowLeft, Send, Paperclip, Phone, Camera as VideoCamera, MoreVertical } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ChatScreen = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messageData, setMessageData] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadMessage = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const result = await fetchMessageById(id);
        setMessageData(result);
        
        // Create a mock conversation based on the initial message
        if (result) {
          const mockConversation = generateMockConversation(result);
          setMessages(mockConversation);
        }
      } catch (error) {
        console.error('Failed to fetch message details:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMessage();
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateMockConversation = (initialMessage: Message): Message[] => {
    // Create a mock conversation with 5-10 messages
    const numberOfMessages = 5 + Math.floor(Math.random() * 5);
    const conversation: Message[] = [];
    
    // Add initial message
    conversation.push(initialMessage);
    
    // Generate additional messages
    for (let i = 1; i < numberOfMessages; i++) {
      const isFromUser = i % 2 === 0;
      const timestamp = new Date(
        new Date(initialMessage.timestamp).getTime() + i * 1000 * 60 * 5
      ).toISOString();
      
      conversation.push({
        id: `msg-${initialMessage.id}-${i}`,
        senderId: isFromUser ? user?.id || '1' : initialMessage.senderId,
        senderName: isFromUser ? user?.name || 'You' : initialMessage.senderName,
        recipientId: isFromUser ? initialMessage.senderId : user?.id || '1',
        recipientName: isFromUser ? initialMessage.senderName : user?.name || 'You',
        content: isFromUser 
          ? `This is a response to the case inquiry ${i}.` 
          : `I have a question about this property ${i}. Can you help?`,
        timestamp,
        read: true,
      });
    }
    
    return conversation;
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !user) return;
    
    const newMsg: Message = {
      id: `msg-new-${Date.now()}`,
      senderId: user.id,
      senderName: user.name,
      recipientId: messageData?.senderId || '',
      recipientName: messageData?.senderName || '',
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: false,
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage('');
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!messageData) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-10">
          <h3 className="text-lg font-medium text-gray-900">Message not found</h3>
          <p className="mt-2 text-sm text-gray-500">The message you're looking for doesn't exist or you don't have access.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate('/messages')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Messages
          </Button>
        </div>
      </div>
    );
  }

  const otherPartyName = messageData.senderName === user?.name 
    ? messageData.recipientName 
    : messageData.senderName;

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col">
      <div className="mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/messages')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Messages
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow flex flex-col flex-1 overflow-hidden">
        {/* Chat header */}
        <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
              {otherPartyName.charAt(0)}
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium">{otherPartyName}</h3>
              <p className="text-xs text-gray-500">Online</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" className="rounded-full p-2">
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" className="rounded-full p-2">
              <VideoCamera className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" className="rounded-full p-2">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="space-y-4">
            {messages.map((msg) => {
              const isFromCurrentUser = msg.senderName === user?.name;
              
              return (
                <div 
                  key={msg.id} 
                  className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex flex-col max-w-[70%]">
                    <div 
                      className={`rounded-lg px-4 py-2 inline-block ${
                        isFromCurrentUser
                          ? 'bg-blue-500 text-white rounded-br-none'
                          : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                    </div>
                    <span className="text-xs text-gray-500 mt-1">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Message input */}
        <div className="border-t border-gray-200 p-3 flex items-center">
          <Button variant="ghost" size="sm" className="rounded-full p-2 mr-1">
            <Paperclip className="h-5 w-5 text-gray-500" />
          </Button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 border-0 focus:ring-0 text-sm p-2"
          />
          <Button 
            variant="primary" 
            size="sm" 
            className="rounded-full p-2 ml-1"
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;