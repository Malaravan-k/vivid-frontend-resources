import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Send, Paperclip, Smile, Phone, Video, MoreVertical, ArrowLeft, User, Loader2, Check, CheckCheck, AlertCircle } from 'lucide-react';
import { chatActions } from '../../store/actions/chat.actions';
import { RootState } from '../../store/index';

const ChatWindow: React.FC = () => {
  const dispatch = useDispatch();
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    selectedUser,
    activeConversation,
    messagesLoading,
    sendingMessage,
    socketConnected
  } = useSelector((state: RootState) => state.chatReducer);
  const agentId = localStorage.getItem('primary_mobile_number') || 'agent_123';

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 120);
      textarea.style.height = `${newHeight}px`;
    }
  }, [message]);
  
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && selectedUser && !sendingMessage) {
      const messageText = message.trim();
      setMessage('');
      
      try {
        await dispatch(chatActions.sendMessage(
          selectedUser.conversation_sid,
          agentId,
          messageText
        ));
      } catch (error) {
        console.error('Failed to send message:', error);
        setMessage(messageText); // Restore message if sending fails
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatMessageDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getMessageStatusIcon = (status?: string) => {
    switch (status) {
      case 'sending':
        return <Loader2 className="w-3 h-3 animate-spin" />;
      case 'sent':
        return <Check className="w-3 h-3" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3" />;
      case 'failed':
        return <AlertCircle className="w-3 h-3 text-red-400" />;
      default:
        return <Check className="w-3 h-3" />;
    }
  };

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Phone className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Select a conversation</h3>
          <p className="text-gray-600 leading-relaxed">Choose a contact from the sidebar to start messaging and view their information</p>
        </div>
      </div>
    );
  }

  const messages = activeConversation?.response 
    ? [...activeConversation.response].sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
    : [];
  let lastDate = '';

    useEffect(() => {
    scrollToBottom();
  }, [messages]); // This will run whenever messages array changes

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-white to-gray-50/30">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200/50 bg-white/90 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm">
                <div className="w-full h-full bg-emerald-400 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-lg">
                {selectedUser.friendly_name.replace(`agent_${agentId}_owner_`, '')}
              </h2>

            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {messagesLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              </div>
            </div>
            <p className="text-gray-600 font-medium">Loading conversation...</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-sm mx-auto">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Start the conversation</h3>
                <p className="text-gray-600 text-sm">
                  Send a message to begin chatting with {selectedUser.friendly_name.replace(`agent_${agentId}_owner_`, '')}
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.author === agentId;
              const messageDate = formatMessageDate(msg.timestamp);
              const showDateSeparator = messageDate !== lastDate;
              lastDate = messageDate;

              return (
                <div key={msg.id}>
                  {showDateSeparator && (
                    <div className="flex items-center justify-center mb-2">
                      <div className="bg-gray-200/80 text-gray-600 text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm">
                        {messageDate}
                      </div>
                    </div>
                  )}
                  <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1`}>
                    <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                      isOwn
                        ? `bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl rounded-br-lg ${
                            msg.status === 'failed' ? 'border-2 border-red-400' : ''
                          }`
                        : 'bg-white border border-gray-200 text-gray-900 rounded-2xl rounded-bl-lg shadow-sm'
                    } px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-200`}>
                      <p className="text-sm leading-relaxed break-words">{msg.body}</p>
                      <div className={`flex items-center justify-end mt-1 space-x-1 ${
                        isOwn ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        <span className="text-[10px]">{formatMessageTime(msg.timestamp)}</span>
                        {isOwn && (
                          <div className="ml-2">
                            {getMessageStatusIcon(msg.status)}
                          </div>
                        )}
                      </div>
                      <div ref={messagesEndRef}/>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Message Input */}
      <div className="px-6 py-4 border-t border-gray-200/50 bg-white/90 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="flex items-end space-x-3">

          <div className="flex-1 relative">
            <div className="flex items-end bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl px-4 py-3 border border-gray-200/50 focus-within:border-blue-500/50 focus-within:shadow-lg transition-all duration-200">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${selectedUser.friendly_name.replace(`agent_${agentId}_owner_`, '')}...`}
                className="flex-1 bg-transparent border-none outline-none resize-none text-sm placeholder-gray-500 min-h-[24px] max-h-[120px] overflow-y-auto"
                rows={1}
                disabled={sendingMessage}
              />
              <button
                type="button"
                className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!message.trim() || sendingMessage}
            className={`flex-shrink-0 p-3 mb-1 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl ${
              message.trim() && !sendingMessage
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {sendingMessage ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;