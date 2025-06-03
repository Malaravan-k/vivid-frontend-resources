import { useState } from 'react';
import { Search, Circle, User, Phone, Send } from 'lucide-react';

// Mock data based on the screenshots
const mockMessages = [
  {
    id: '1',
    phoneNumber: '890-6554-977',
    lastMessage: 'May I know the status of my case?',
    timestamp: '12m',
    unread: true,
    messages: [
      { sender: 'user', content: 'Hi.', time: '12:30 PM' },
      { sender: 'user', content: 'I wanted to check the status of case', time: '12:31 PM' },
      { sender: 'user', content: 'Has there been any update?', time: '12:31 PM' },
      { sender: 'agent', content: 'Hello, thank you for reaching out.', time: '12:32 PM' },
      { sender: 'agent', content: 'Your case (#LC-2045) is currently under review by the verification department.', time: '12:32 PM' },
      { sender: 'agent', content: 'We expect an update by June 5, 2025.', time: '12:33 PM' },
      { sender: 'user', content: 'Okay, thank you.', time: '12:34 PM' },
      { sender: 'user', content: 'Is there anything else you need from my side to proceed?', time: '12:35 PM' },
      { sender: 'agent', content: 'At this point, we have all the necessary documents.', time: '12:36 PM' },
      { sender: 'agent', content: 'If anything further is needed, we\'ll notify you via this portal and SMS.', time: '12:37 PM' },
      { sender: 'user', content: 'Thank You', time: '12:38 PM' }
    ]
  },
  {
    id: '2',
    phoneNumber: '890-6554-977',
    lastMessage: 'May I know the status of my case?',
    timestamp: '12m',
    unread: true,
    messages: []
  },
  {
    id: '3',
    phoneNumber: '890-6554-977',
    lastMessage: 'May I know the status of my case?',
    timestamp: '12m',
    unread: true,
    messages: []
  },
  {
    id: '4',
    phoneNumber: '890-6554-977',
    lastMessage: 'May I know the status of my case?',
    timestamp: '12m',
    unread: true,
    messages: []
  },
  {
    id: '5',
    phoneNumber: '890-6554-977',
    lastMessage: 'May I know the status of my case?',
    timestamp: '12m',
    unread: true,
    messages: []
  },
  {
    id: '6',
    phoneNumber: '890-6554-977',
    lastMessage: 'May I know the status of my case?',
    timestamp: '12m',
    unread: true,
    messages: []
  },
  {
    id: '7',
    phoneNumber: '890-6554-977',
    lastMessage: 'May I know the status of my case?',
    timestamp: '12m',
    unread: true,
    messages: []
  },
  {
    id: '8',
    phoneNumber: '890-6554-977',
    lastMessage: 'May I know the status of my case?',
    timestamp: '12m',
    unread: true,
    messages: []
  }
];

const ownerInfo = {
  id: '2SSP00002567',
  address: '969 Cox Rd, Gastonia, NC 28054-3455, USA',
  filingDate: '24.12.2025',
  assessedValue: '$56,000',
  amountOwed: '$34,000',
  propertyType: 'Single Flat',
  propertyStatus: 'Active'
};

const MessagesInterface = () => {
  const [selectedMessage, setSelectedMessage] = useState(mockMessages[0]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMessages = mockMessages.filter(msg => 
    msg.phoneNumber.includes(searchQuery) || 
    msg.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // In a real app, this would send the message to the API
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Main Content */}
      <div className="flex w-full pt-20">
        {/* Left Sidebar - Message List */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            {/* <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
              <p className="text-sm text-gray-500">Acquisition Managers</p>
              <p className="text-xs text-gray-400 mt-1">A user-friendly tool for acquisition managers to handle foreclosure calls, track leads, and manage tasks seamlessly</p>
            </div> */}
            
            {/* <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search messages"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div> */}

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">Messages</span>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">12</span>
              </div>
            </div>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto">
            {filteredMessages.map((message) => (
              <div
                key={message.id}
                onClick={() => setSelectedMessage(message)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedMessage.id === message.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {message.phoneNumber}
                      </h3>
                      <span className="text-xs text-gray-500">{message.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate mt-1">
                      {message.lastMessage}
                    </p>
                  </div>
                  {message.unread && (
                    <Circle className="w-3 h-3 text-blue-500 fill-current" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedMessage.messages.length > 0 ? (
              <>
                {/* Chat Header */}
                <div className="bg-white border-b border-gray-200 p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Phone className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{selectedMessage.phoneNumber}</h3>
                    </div>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {selectedMessage.messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.sender === 'agent' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}>
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="bg-white border-t border-gray-200 p-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message"
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-blue-50">
                <div className="text-center">
                  <h3 className="text-2xl font-medium text-blue-900 mb-2">
                    Tap on a message to reply.
                  </h3>
                  <p className="text-blue-600">
                    Respond here to assist the owner with their case.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Owner Information Panel */}
          {selectedMessage.messages.length > 0 && (
            <div className="w-80 bg-white border-l border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                Owner Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">ID/Case</label>
                  <p className="mt-1 text-sm text-gray-900">{ownerInfo.id}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <p className="mt-1 text-sm text-gray-900">{ownerInfo.address}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Filing Date</label>
                  <p className="mt-1 text-sm text-gray-900">{ownerInfo.filingDate}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Assessed Value</label>
                  <p className="mt-1 text-sm text-gray-900">{ownerInfo.assessedValue}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount Owed</label>
                  <p className="mt-1 text-sm text-gray-900">{ownerInfo.amountOwed}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Property Type</label>
                  <p className="mt-1 text-sm text-gray-900">{ownerInfo.propertyType}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Property Status</label>
                  <p className="mt-1 text-sm text-gray-900">{ownerInfo.propertyStatus}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesInterface;