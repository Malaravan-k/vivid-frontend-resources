import React, { useEffect, useState } from 'react';
import { StreamChat } from 'stream-chat';
import UserList from './UserList';
import ChatWindow from './ChatWindow';
import OwnerInfo from './OwnerInfo';
import { dispatch } from '../../store';
import { casesActions } from '../../store/actions/cases.actions';
import { useSelector } from 'react-redux';
import {RootState} from '../../store/index'
import { useLocation } from 'react-router-dom';

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
  const location = useLocation();
  console.log("location",location)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<StreamChat | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeChannel, setActiveChannel] = useState<any>(null);
  const [ownerInfo, setOwnerInfo] = useState<any | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { loading: casesLoading, record } = useSelector((state: RootState) => state.caseReducer);
  const { user, isLoggedIn} = useSelector((state: RootState) => state.sessionReducer);
 useEffect(()=>{
  setOwnerInfo(record)
}, [record])
console.log("currentUserId",currentUserId)
useEffect(() => {
  if (location.state) {
    const { customer_id, channel_id,agent_id} = location.state;

    if (customer_id && channel_id && client && currentUserId) {
      autoSelectUser(customer_id, channel_id , agent_id);
    }
  }
}, [location.state, client, currentUserId]);
console.log("client!!!!!", client)

const autoSelectUser = async (customer_id: User, channelId: string , agent_id :string) => {
  try {
    console.log("user>>>>>>>",customer_id)
    console.log("channelId",channelId);
    
    // Use the passed channel ID to create or get the channel
    const channel = client!.channel('messaging', channelId, {
      members: [agent_id, customer_id],
    });

    await channel.watch();
    setActiveChannel(channel);
    const userToSelect = users.find(u => u.id === customer_id) || {
        id: customer_id,
        name: customer_id,
        phone: customer_id
      };
      
    setSelectedUser(userToSelect);
    // Load owner info
    const useMobile = true;
    const Id = user?.name.replace('+', '');
    dispatch(casesActions.loadRecord(Id, useMobile));
  } catch (err) {
    console.error('Error auto-selecting user:', err);
  }
};

  
  const agentNumber = localStorage.getItem('primary_mobile_number')?.replace(/\D/g, '');
  const apiEndpoint = import.meta.env.VITE_APP_CALLING_SYSTEM_URL;

  // localStorage keys
  const STREAM_TOKEN_KEY = 'stream_token_data';

useEffect(() => {
  initializeChat();
  // Cleanup function to disconnect when component unmounts
  return () => {
    if (client) {
      client.disconnectUser().catch(err => 
        console.warn('Error during cleanup disconnect:', err)
      );
    }
  };
}, []); //

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
    console.log("storedTokenData",storedTokenData);
    
    if (storedTokenData) {
      token = storedTokenData.token;
      api_key = storedTokenData.api_key;
    } else {
      const response = await fetch(`${apiEndpoint}/stream-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_no: agentNumber,
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

    // Step 2: Create a fresh client instance
    const streamClient = StreamChat.getInstance(api_key);
   
    const userId = agentNumber?.replace(/\D/g, '');
    console.log("userId",userId);
    
    console.log("streamClient:::",streamClient);
    
    // Step 3: Always connect the user (no need to check if already connected)
    await streamClient.connectUser(
      {
        id: `${userId}`,
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
    
    if (err instanceof Error && (err.message.includes('401') || err.message.includes('403'))) {
      localStorage.removeItem(STREAM_TOKEN_KEY);
      console.log('Cleared stored credentials due to authentication error');
    }
    
    // setError(err instanceof Error ? err.message : 'Failed to initialize chat');
    setLoading(false);
  }
};

const loadUsers = async (streamClient: StreamChat) => {
  try {

    console.log("Hiiiiiii Vanakkam")
    const userId = agentNumber?.replace(/\D/g, '');
    const channelsResponse = await streamClient.queryChannels(
      { 
        type: 'messaging',
        members: { $in: [`${userId}`] } 
      },
      { last_message_at: -1 },
      { 
        limit: 50,
        member: true,
        presence: true
      }
    );
 console.log("channelsResponse",channelsResponse)
    // Handle different response structures
    const channels = Array.isArray(channelsResponse) ? 
      channelsResponse : 
      (channelsResponse.channels || []);

    // Extract unique user IDs from channel members
    const relatedUserIds = new Set<string>();
    
    channels.forEach((channel: any) => {
      const members = channel.state?.members || channel.members || [];
      
      Object.values(members).forEach((member: any) => {
        const memberId = member.user_id || member.user?.id;
        if (memberId && memberId !== `${userId}`) {
          relatedUserIds.add(memberId);
        }
      });
    });

    let usersList: User[] = [];
    console.log("usersList::",usersList)

    if (relatedUserIds.size > 0) {
      const usersResponse = await streamClient.queryUsers(
        { id: { $in: Array.from(relatedUserIds) } },
        { last_active: -1 },
        { limit: 50 }
      );

      const usersData = Array.isArray(usersResponse) ? 
        usersResponse : 
        (usersResponse.users || []);

      usersList = usersData.map((user: any) => ({
        id: user.id,
        name: user.name || user.id,
        phone: user.phone || user.id,
        online: user.online,
        last_active: user.last_active,
      }));
    }



    setUsers(usersList);
  } catch (err) {
    console.error('Error loading users:', err);
    setError('Failed to load chat history. Please try again.');
    setUsers([]);
  }
};

  const selectUser = async (user: User) => {
    try {
      if (!client || !currentUserId) return;
      setSelectedUser(user);
      console.log("user" , user)
      console.log("location?.state?.channel_id",location?.state?.channel_id);
      
      // Create or get existing channel
      const userId = user?.name.replace(/\D/g, '')
      const channelId = `${currentUserId}-${userId}`
      const channel = client.channel('messaging',channelId,{
        members: [`${currentUserId}`, `${userId}`],
      });
      await channel.watch();
      setActiveChannel(channel);
      // Load owner info
      const useMobile = true;
      const Id = user?.name.replace('+', '')
      dispatch(casesActions.loadRecord(Id , useMobile))
    } catch (err) {
      console.error('Error selecting user:', err);
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
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
    <div className="rounded-xl overflow-hidden bg-gray-100">
      <div className="flex h-[700px] bg-white ">
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