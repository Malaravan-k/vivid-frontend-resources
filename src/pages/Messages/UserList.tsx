import React, { useState } from 'react';
import { Search, Phone } from 'lucide-react';

interface User {
  id: string;
  name: string;
  phone: string;
  online?: boolean;
  last_active?: string;
}

interface UserListProps {
  users: User[];
  selectedUser: User | null;
  onUserSelect: (user: User) => void;
}

const UserList: React.FC<UserListProps> = ({
  users,
  selectedUser,
  onUserSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter((user: User) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm) ||
    user.id.includes(searchTerm)
  );
  
  const formatLastActive = (lastActive: string) => {
    if (!lastActive) return '';
    const now = new Date();
    const activeTime = new Date(lastActive);
    const diffInMinutes = Math.floor((now.getTime() - activeTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d`;
    }
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search messages"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      {/* Messages Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-800">User List</span>
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
            {filteredUsers.length}
          </span>
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <Phone className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p>No users found</p>
            <p className="text-xs">Create a new user to start chatting</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => onUserSelect(user)}
              className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${
                selectedUser?.id === user.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  {user.online && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 truncate">{user.name}</h3>
                    <div className="flex items-center space-x-2">
                      {user.last_active && (
                        <span className="text-xs text-gray-500">
                          {formatLastActive(user.last_active)}
                        </span>
                      )}
                      {user.online && (
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 truncate mt-1">{user.phone}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserList;