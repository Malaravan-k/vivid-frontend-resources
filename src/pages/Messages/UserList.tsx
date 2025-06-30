import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Phone, User, MessageCircle } from 'lucide-react';
import { chatActions } from '../../store/actions/chat.actions';
import { RootState } from '../../store/index';

interface User {
  conversation_sid: string;
  friendly_name: string;
  owner_no: string;
}

const UserList: React.FC = () => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { users, usersLoading, selectedUser } = useSelector((state: RootState) => state.chatReducer);
  const agentId = localStorage.getItem('primary_mobile_number') || 'agent_123';

  const filteredUsers = users.filter((user: User) =>
    user.owner_no.includes(searchTerm) ||
    user.conversation_sid.includes(searchTerm) ||
    user.friendly_name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  useEffect(()=>{
    if(selectedUser){
    dispatch(chatActions.selectUser(selectedUser))
    }
  },[])

  const handleUserSelect = (user: any) => {
    dispatch(chatActions.selectUser(user));
  };

  const getDisplayName = (friendlyName: string) => {
    return friendlyName.replace(`agent_${agentId}_owner_`, '');
  };

  useEffect(() => {
    if (users.length > 0 && !selectedUser) {
      console.log("Auto-selecting first user");
      handleUserSelect(filteredUsers[0]);
    }
  }, [users]);

  return (
    <div className="w-80 lg:w-96 bg-gradient-to-b from-white to-gray-50/50 border-r border-gray-200/50 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200/50 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Messages
          </h2>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-100/80 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 py-4 border-b border-gray-200/50 bg-gradient-to-r from-emerald-50/80 to-blue-50/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span className="font-medium text-gray-800">Active Chats</span>
          </div>
          <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
            {filteredUsers.length}
          </span>
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto">
        {usersLoading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-gray-500 text-sm">Loading contacts...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">No contacts found</h3>
            <p className="text-gray-500 text-sm">No users match your search criteria</p>
          </div>
        ) : (
          filteredUsers.map((user:any) => {
            const isSelected = selectedUser?.conversation_sid === user.conversation_sid;
            
            return (
              <div
                key={user.conversation_sid}
                onClick={() => handleUserSelect(user)}
                className={`relative p-4 border-b border-gray-100/50 cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 ${
                  isSelected 
                    ? 'bg-gradient-to-r from-blue-100/80 to-indigo-100/80 border-l-4 border-l-blue-500 shadow-sm' 
                    : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <User className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate text-sm">
                      {getDisplayName(user.friendly_name)}
                    </h3>
                    <p className="text-xs text-gray-600 truncate flex items-center gap-1 mt-1">
                      <Phone className="w-3 h-3" />
                      {user.owner_no}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default UserList;