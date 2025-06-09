import React, { useEffect, useState } from 'react';
import { StreamChat } from 'stream-chat';
import UserList from './UserList';
import ChatWindow from './ChatWindow';
import OwnerInfo from './OwnerInfo';
import { dispatch } from '../../store';
import { casesActions } from '../../store/actions/cases.actions';
import { useSelector } from 'react-redux';
import {RootState} from '../../store/index'

interface User {
  id: string;
  name: string;
  phone: string;
  online?: boolean;
  last_active?: string;
}

interface OwnerInfo {
  idCase: string;
  address: string;
  filingDate: string;
  assessedValue: string;
  amountOwed: string;
  propertyType: string;
  propertyStatus: string;
}

interface StreamTokenData {
  token: string;
  api_key: string;
}

const ChatApp: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<StreamChat | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeChannel, setActiveChannel] = useState<any>(null);
  const [ownerInfo, setOwnerInfo] = useState<any | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
const { loading: casesLoading, record } = useSelector((state: RootState) => state.caseReducer);
const { user } = useSelector((state: RootState) => state.sessionReducer);
console.log("casesLoading",casesLoading)
console.log("record",record);

useEffect(()=>{
  setOwnerInfo(record)
}, [record])
  
  const agentNumber = `+${user?.['custom:mobileNumber']}`;
  const apiEndpoint = import.meta.env.VITE_APP_CALLING_SYSTEM_URL;

  // localStorage keys
  const STREAM_TOKEN_KEY = 'stream_token_data';

  useEffect(() => {
    initializeChat();
  }, []);

  // Helper function to get stored token data
  const getStoredTokenData = (): StreamTokenData | null => {
    try {
      const storedData = localStorage.getItem(STREAM_TOKEN_KEY);
      if (storedData) {
        const tokenData: StreamTokenData = JSON.parse(storedData);
        return tokenData;
      }
    } catch (error) {
      console.error('Error reading stored token:', error);
      localStorage.removeItem(STREAM_TOKEN_KEY);
    }
    return null;
  };
  const storeTokenData = (token: string, api_key: string): void => {
    const tokenData: StreamTokenData = {
      token,
      api_key
    };
    localStorage.setItem(STREAM_TOKEN_KEY, JSON.stringify(tokenData));
  };

  const initializeChat = async () => {
    try {
      setLoading(true);
      setError(null);

      let token: string;
      let api_key: string;
      const storedTokenData = getStoredTokenData();
      if (storedTokenData) {
        token = storedTokenData.token;
        api_key = storedTokenData.api_key;
      } else {
        const response = await fetch(`${apiEndpoint}/stream-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_no: agentNumber,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const responseData = await response.json();
        token = responseData.token;
        api_key = responseData.api_key;
        storeTokenData(token, api_key);
      }

      const streamClient = StreamChat.getInstance(api_key);
      const userId = agentNumber.replace(/\D/g, '');
      
      await streamClient.connectUser(
        {
          id: userId,
          name: agentNumber,
        },
        token
      );

      setClient(streamClient);
      setCurrentUserId(userId);

      await loadUsers(streamClient);

      setLoading(false);
    } catch (err) {
      console.error('Error initializing chat:', err);
      
      // If there's an authentication error, clear stored credentials and retry once
      if (err instanceof Error && (err.message.includes('401') || err.message.includes('403'))) {
        localStorage.removeItem(STREAM_TOKEN_KEY);
        console.log('Cleared stored credentials due to authentication error');
      }
      
      setError(err instanceof Error ? err.message : 'Failed to initialize chat');
      setLoading(false);
    }
  };

  const loadUsers = async (streamClient: StreamChat) => {
    try {
      const response = await streamClient.queryUsers(
        {}, // Empty filter to get all users
        { last_active: -1 }, // Sort by last active
        { limit: 50 }
      );

      const usersList = response.users
        .filter(user => user.id !== currentUserId) // Exclude current user
        .map(user => ({
          id: user.id,
          name: user.name || user.id,
          phone: user.phone || user.id,
          online: user.online,
          last_active: user.last_active,
        }));

      setUsers(usersList);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const selectUser = async (user: User) => {
    try {
      if (!client || !currentUserId) return;

      setSelectedUser(user);
      console.log("user" , user)

      // Create or get existing channel
      const channel = client.channel('messaging', {
        members: [currentUserId, user.id],
      });

      await channel.watch();
      setActiveChannel(channel);

      // Load owner info
      const useMobile = true;
      const Id = user?.name.replace('+', '')
      dispatch(casesActions.loadRecord(Id , useMobile))
      console.log("user",user)
    } catch (err) {
      console.error('Error selecting user:', err);
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">!</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading chat</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={initializeChat}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[600px] bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">Acquisition Managers Portal</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[600px] bg-white">
        <UserList 
          users={users}
          selectedUser={selectedUser}
          onUserSelect={selectUser}
        />
        <ChatWindow 
          selectedUser={selectedUser}
          activeChannel={activeChannel}
          client={client}
        />
        <OwnerInfo 
          selectedUser={selectedUser}
          ownerInfo={ownerInfo}
          casesLoading = {casesLoading}
        />
      </div>
    </div>
  );
};

export default ChatApp;