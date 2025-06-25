import { produce } from 'immer';
import { chatConstants } from '../constants/chat.constants';

interface User {
  conversation_sid: string;
  friendly_name: string;
  owner_no: string;
  online?: boolean;
}

interface Message {
  id: string;
  conversation_sid: string;
  author: string;
  body: string;
  timestamp: string;
  read_status?: boolean;
  message_type?: 'text' | 'image' | 'file';
  attachment_url?: string;
  status?: 'sending' | 'sent' | 'delivered' | 'failed';
  isTemp?: boolean;
}

interface Conversation {
  conversation_sid: string;
  response?: Message[];
  last_message?: Message;
  unread_count?: number;
}

interface ChatState {
  loading: boolean;
  error: boolean | string;
  success: boolean;
  message: string | null;

  // Users
  users: User[];
  usersLoading: boolean;
  selectedUser: User | null;

  // Conversations
  activeConversation: Conversation | null;
  activeConversationId: string | null;

  // Messages
  messagesLoading: boolean;
  sendingMessage: boolean;

  // Socket
  socketConnected: boolean;

  // UI State
  isInitialized: boolean;
}

interface ChatAction {
  type: string;
  message?: any;
  error?: boolean | string;
  record?: any;
  user?: User;
  conversationId?: string;
  messageData?: Message;
  status?: string;
}

const initialState: ChatState = {
  loading: false,
  error: false,
  success: false,
  message: null,

  users: [],
  usersLoading: false,
  selectedUser: null,

  activeConversation: null,
  activeConversationId: null,

  messagesLoading: false,
  sendingMessage: false,

  socketConnected: false,

  isInitialized: false,
};

export default function chatReducer(
  state: ChatState = initialState,
  action: ChatAction
): ChatState {
  console.log("Action.messageData",action?.messageData);
  console.log("action.record",action.record);
  
  
  return produce(state, (draft) => {
    switch (action.type) {
      case chatConstants.GET_USERS:
        draft.usersLoading = true;
        draft.error = false;
        break;

      case chatConstants.GET_USERS_SUCCESS:
        draft.users = action.record || [];
        draft.usersLoading = false;
        draft.error = false;
        draft.isInitialized = true;
        break;

      case chatConstants.GET_USERS_ERROR:
        draft.usersLoading = false;
        draft.error = action.error || true;
        draft.message = action.message || null;
        break;

      case chatConstants.GET_CONVERSATION:
        draft.messagesLoading = true;
        draft.error = false;
        break;

      case chatConstants.GET_CONVERSATION_SUCCESS:
        draft.activeConversation = action.record;
        draft.messagesLoading = false;
        draft.error = false;
        break;

      case chatConstants.GET_CONVERSATION_ERROR:
        draft.messagesLoading = false;
        draft.error = action.error || true;
        draft.message = action.message || null;
        break;

      case chatConstants.SEND_MESSAGE:
        draft.sendingMessage = true;
        draft.error = false;
        break;

      case chatConstants.SEND_MESSAGE_SUCCESS:
        draft.sendingMessage = false;
        draft.error = false;
        // Update the message status from temp to sent
        if (draft.activeConversation?.response) {
          const msgIndex = draft.activeConversation.response.findIndex(
            m => m.conversation_sid === action.record?.conversation_sid &&
              m.body === action.record?.body &&
              m.isTemp
          );
          if (msgIndex !== -1) {
            draft.activeConversation.response[msgIndex] = {
              ...action.record,
              status: 'sent',
              isTemp: false
            };
          }
        }
        break;

      case chatConstants.SEND_MESSAGE_ERROR:
        draft.sendingMessage = false;
        draft.error = action.error || true;
        draft.message = action.message || null;
        // Mark failed messages
        if (draft.activeConversation?.response) {
          const failedMsgIndex = draft.activeConversation.response.findIndex(
            m => m.isTemp && m.status === 'sending'
          );
          if (failedMsgIndex !== -1) {
            draft.activeConversation.response[failedMsgIndex].status = 'failed';
          }
        }
        break;

      case chatConstants.ADD_MESSAGE:
        // Add optimistic message for sending
        if (action.messageData && draft.activeConversation) {
          if (!draft.activeConversation.response) {
            draft.activeConversation.response = [];
          }
          draft.activeConversation.response.push({
            ...action.messageData,
            status: 'sending',
            isTemp: true
          });
        }
        break;

      case chatConstants.RECEIVE_MESSAGE:
        if (action.messageData) {
          const { conversation_sid, author, message: body } = action.messageData;

          // Create a proper message object
          const newMessage = {
            id: Date.now().toString(), // Generate a temporary ID if not provided
            conversation_sid,
            author,
            body,
            timestamp: new Date().toISOString(),
            status: 'delivered'
          };
          console.log("cobnvo id",draft.activeConversationId);
          

          // If this is the active conversation, add the message
          if (draft.activeConversationId === conversation_sid) {
            // if (!draft.activeConversation.response) {
            //   draft.activeConversation.response = [];
            // }
           
            // // Check if message already exists (optional)
            // const existingMsg = draft.activeConversation.response.find(
            //   m => m.body === body && m.author === author && m.timestamp === newMessage.timestamp
            // );
              
              draft.activeConversation.response.push(newMessage);
          }

          // Update user list with latest message indicator
          const userIndex = draft.users.findIndex(
            u => u.conversation_sid === conversation_sid
          );
          if (userIndex !== -1) {
            // Update last message for the user
            draft.users[userIndex].last_message = body;
            draft.users[userIndex].last_message_time = newMessage.timestamp;

            // Move user to top of list if not already selected
            if (draft.selectedUser?.conversation_sid !== conversation_sid) {
              const user = draft.users[userIndex];
              draft.users.splice(userIndex, 1);
              draft.users.unshift(user);
            }
          }
        }
        break;
      case chatConstants.SELECT_USER:
        draft.selectedUser = action.user || null;
        break;

      case chatConstants.SET_ACTIVE_CONVERSATION:
        draft.activeConversationId = action.conversationId || null;
        break;

      case chatConstants.CLEAR_ACTIVE_CONVERSATION:
        draft.activeConversation = null;
        draft.activeConversationId = null;
        draft.selectedUser = null;
        break;

      case chatConstants.SOCKET_CONNECTED:
        draft.socketConnected = true;
        break;

      case chatConstants.SOCKET_DISCONNECTED:
        draft.socketConnected = false;
        break;

      case chatConstants.CLEAR_CHAT_ERROR:
        draft.error = false;
        draft.message = null;
        break;

      case chatConstants.RESET_CHAT_STATE:
        return initialState;

      default:
        break;
    }
  });
}