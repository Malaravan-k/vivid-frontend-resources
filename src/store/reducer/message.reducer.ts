import { produce } from 'immer';
import { messageConstants } from '../constants/message.constants';
import { Message, Conversation, Case } from '../../types/message.types';

interface MessageState {
  loading: boolean;
  error: string | null;
  messages: Record<string, Message[]>;
  conversations: Conversation[];
  activeConversation: string | null;
  caseDetails: Record<string, Case>;
  sending: boolean;
}

interface MessageAction {
  type: string;
  conversationId?: string;
  messages?: Message[];
  message?: Message | Omit<Message, 'id' | 'timestamp' | 'read'>;
  error?: string;
  userId?: string;
  conversations?: Conversation[];
  caseDetails?: Case;
  caseId?: string;
}

const initialState: MessageState = {
  loading: false,
  error: null,
  messages: {},
  conversations: [],
  activeConversation: null,
  caseDetails: {},
  sending: false,
};

export default function messageReducer(
  state: MessageState = initialState,
  action: MessageAction
): MessageState {
  return produce(state, (draft) => {
    switch (action.type) {
      case messageConstants.FETCH_MESSAGES:
        draft.loading = true;
        draft.error = null;
        break;
        
      case messageConstants.FETCH_MESSAGES_SUCCESS:
        if (action.conversationId && action.messages) {
          draft.messages[action.conversationId] = action.messages;
        }
        draft.loading = false;
        break;
        
      case messageConstants.FETCH_MESSAGES_ERROR:
        draft.loading = false;
        draft.error = action.error || null;
        break;
        
      case messageConstants.SEND_MESSAGE:
        draft.sending = true;
        break;
        
      case messageConstants.SEND_MESSAGE_SUCCESS:
        if (action.message && 'id' in action.message && action.message.receiverId) {
          const conversationId = state.activeConversation;
          if (conversationId && state.messages[conversationId]) {
            if (!draft.messages[conversationId]) {
              draft.messages[conversationId] = [];
            }
            draft.messages[conversationId].push(action.message as Message);
          }
        }
        draft.sending = false;
        break;
        
      case messageConstants.SEND_MESSAGE_ERROR:
        draft.sending = false;
        draft.error = action.error || null;
        break;
        
      case messageConstants.RECEIVE_MESSAGE:
        if (action.message && 'id' in action.message) {
          const message = action.message as Message;
          const conversationId = state.activeConversation;
          
          // Check if this message belongs to the active conversation
          if (conversationId) {
            if (!draft.messages[conversationId]) {
              draft.messages[conversationId] = [];
            }
            
            // Add message if it doesn't already exist
            const messageExists = state.messages[conversationId]?.some(
              (m) => m.id === message.id
            );
            
            if (!messageExists) {
              draft.messages[conversationId].push(message);
            }
          }
          
          // Update the conversations list with the new message
          const conversationIndex = state.conversations.findIndex(
            (conv) => conv.id === conversationId
          );
          
          if (conversationIndex !== -1) {
            draft.conversations[conversationIndex].lastMessage = message;
            if (conversationId !== state.activeConversation) {
              draft.conversations[conversationIndex].unreadCount += 1;
            }
          }
        }
        break;
        
      case messageConstants.FETCH_CONVERSATIONS:
        draft.loading = true;
        draft.error = null;
        break;
        
      case messageConstants.FETCH_CONVERSATIONS_SUCCESS:
        if (action.conversations) {
          draft.conversations = action.conversations;
        }
        draft.loading = false;
        break;
        
      case messageConstants.FETCH_CONVERSATIONS_ERROR:
        draft.loading = false;
        draft.error = action.error || null;
        break;
        
      case messageConstants.FETCH_CASE_DETAILS:
        draft.loading = true;
        draft.error = null;
        break;
        
      case messageConstants.FETCH_CASE_DETAILS_SUCCESS:
        if (action.caseDetails && action.caseId) {
          draft.caseDetails[action.caseId] = action.caseDetails;
        }
        draft.loading = false;
        break;
        
      case messageConstants.FETCH_CASE_DETAILS_ERROR:
        draft.loading = false;
        draft.error = action.error || null;
        break;
        
      case messageConstants.SET_ACTIVE_CONVERSATION:
        draft.activeConversation = action.conversationId || null;
        break;
        
      case messageConstants.MARK_AS_READ:
        if (action.conversationId) {
          const conversationIndex = state.conversations.findIndex(
            (conv) => conv.id === action.conversationId
          );
          
          if (conversationIndex !== -1) {
            draft.conversations[conversationIndex].unreadCount = 0;
          }
          
          if (state.messages[action.conversationId]) {
            draft.messages[action.conversationId] = state.messages[action.conversationId].map(
              (message) => {
                if (!message.read && message.senderId !== action.userId) {
                  return { ...message, read: true };
                }
                return message;
              }
            );
          }
        }
        break;
    }
  });
}