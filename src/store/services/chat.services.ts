import { StreamChat } from 'stream-chat';
const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || 'http://localhost:5001';
const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;
const postUrl = import.meta.env.VITE_APP_CALLING_SYSTEM_URL
interface TokenRequest {
  user_no: string;
  owner_no: string;
}

interface TokenResponse {
  token: string;
  api_key: string;
}

interface CreateUserRequest {
  phoneNumber: string;
  name?: string;
}

let streamClient: StreamChat | null = null;

async function getStreamToken(data: TokenRequest): Promise<TokenResponse> {
  try {
    const response = await fetch(`${API_ENDPOINT}/stream-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch stream token:', error);
    throw error;
  }
}

async function initializeStreamClient(userId: string, token: string, apiKey: string) {
  try {
    if (streamClient) {
      await streamClient.disconnectUser();
    }

    streamClient = StreamChat.getInstance(apiKey);
    
    await streamClient.connectUser(
      {
        id: userId,
        name: userId,
      },
      token
    );

    return streamClient;
  } catch (error) {
    console.error('Failed to initialize Stream client:', error);
    throw error;
  }
}

async function createUser(userData: CreateUserRequest) {
  try {
    if (!streamClient) {
      throw new Error('Stream client not initialized');
    }

    const userId = userData.phoneNumber.replace(/\D/g, '');
    
    // Create user in GetStream
    const user = await streamClient.upsertUser({
      id: userId,
      name: userData.name || userData.phoneNumber,
      phone: userData.phoneNumber,
    });

    return { user, success: true };
  } catch (error) {
    console.error('Failed to create user:', error);
    throw error;
  }
}

async function getUsers() {
  try {
    if (!streamClient) {
      throw new Error('Stream client not initialized');
    }

    // Query users from GetStream
    const response = await streamClient.queryUsers(
      {}, // Empty filter to get all users
      { last_active: -1 }, // Sort by last active
      { limit: 50 }
    );

    const users = response.users.map(user => ({
      id: user.id,
      name: user.name || user.id,
      phone: user.phone || user.id,
      online: user.online,
      last_active: user.last_active,
    }));

    return { users, success: true };
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw error;
  }
}

async function getOrCreateChannel(currentUserId: string, targetUserId: string) {
  try {
    if (!streamClient) {
      throw new Error('Stream client not initialized');
    }

    // Create or get existing channel between two users
    const channel = streamClient.channel('messaging', {
      members: [currentUserId, targetUserId],
    });

    await channel.watch();
    return channel;
  } catch (error) {
    console.error('Failed to get or create channel:', error);
    throw error;
  }
}

async function getUserChannels(userId: string) {
  try {
    if (!streamClient) {
      throw new Error('Stream client not initialized');
    }

    // Get all channels for the current user
    const channels = await streamClient.queryChannels(
      {
        type: 'messaging',
        members: { $in: [userId] },
      },
      { last_message_at: -1 },
      { limit: 20 }
    );

    return channels;
  } catch (error) {
    console.error('Failed to fetch user channels:', error);
    throw error;
  }
}

async function createNewUser(agent_no: any , customer_no:any) {
  try {
    const res = await fetch(`${postUrl}/init-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agent_no: agent_no,
        customer_no:customer_no
      }),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Failed to post message:', error);
    throw error;
  }
}

// function createNewUser(payload:any){
//  return API.post('vivid-api', constantName , getDefaultParamswithoutlimitkey({body : payload}))
//  .then((response)=> response)
//  .catch((error)=>Promise.reject(error))
// }

async function getOwnerInfo(userId: string) {
  try {
    // This would fetch owner information from your backend
    const response = await fetch(`${API_ENDPOINT}/owner-info/${userId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      // Return mock data if API is not available
      return {
        idCase: '25SP00002567',
        address: '969 Cox Rd, Gastonia, NC 28054-3455, USA',
        filingDate: '24.12.2025',
        assessedValue: '$56,000',
        amountOwed: '$34,000',
        propertyType: 'Single Flat',
        propertyStatus: 'Active',
      };
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch owner info:', error);
    // Return mock data as fallback
    return {
      idCase: '25SP00002567',
      address: '969 Cox Rd, Gastonia, NC 28054-3455, USA',
      filingDate: '24.12.2025',
      assessedValue: '$56,000',
      amountOwed: '$34,000',
      propertyType: 'Single Flat',
      propertyStatus: 'Active',
    };
  }
}


function getStreamClient() {
  return streamClient;
}

export const chatServices = {
  getStreamToken,
  initializeStreamClient,
  createUser,
  getUsers,
  getOrCreateChannel,
  getUserChannels,
  getOwnerInfo,
  getStreamClient,
  createNewUser
};