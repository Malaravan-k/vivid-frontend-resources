import { produce } from 'immer';
import { chatConstants } from '../constants/chat.constants';

interface ChatState {
  loading: boolean;
  error: boolean | string;
  success: boolean;
  message: string | null;
  token: any;
  client: any;
  channels: any[];
  users: any[];
  selectedUser: any;
  activeChannel: any;
  ownerInfo: any;
  usersLoading: boolean;
  channelsLoading: boolean;
  ownerInfoLoading: boolean;
  currentUserId: string | null;
}

interface ChatAction {
  type: string;
  message?: string;
  error?: boolean | string;
  record?: any;
  data?: any;
  client?: any;
  channels?: any[];
  channel?: any;
  user?: any;
  userId?: string;
}

const initialState: ChatState = {
  loading: false,
  error: false,
  success: false,
  message: null,
  token: null,
  client: null,
  channels: [],
  users: [],
  selectedUser: null,
  activeChannel: null,
  ownerInfo: null,
  usersLoading: false,
  channelsLoading: false,
  ownerInfoLoading: false,
  currentUserId: null,
};

export default function chatReducer(
  state: ChatState = initialState,
  action: ChatAction
): ChatState {
  return produce(state, (draft) => {
    switch (action.type) {
      case chatConstants.GET_STREAM_TOKEN:
        draft.loading = true;
        draft.error = false;
        draft.success = false;
        draft.message = null;
        break;
      case chatConstants.GET_STREAM_TOKEN_SUCCESS:
        draft.token = action.record;
        draft.loading = false;
        draft.error = false;
        draft.success = true;
        draft.message = '';
        break;
      case chatConstants.GET_STREAM_TOKEN_ERROR:
        draft.loading = false;
        draft.error = action.error || true;
        draft.message = action.message || null;
        draft.success = false;
        break;

      case chatConstants.INITIALIZE_CHAT_SUCCESS:
        draft.client = action.client;
        draft.channels = action.channels || [];
        if (action.client && action.client.user) {
          draft.currentUserId = action.client.user.id;
        }
        break;

      case chatConstants.GET_USERS:
        draft.usersLoading = true;
        draft.error = false;
        break;
      case chatConstants.GET_USERS_SUCCESS:
        draft.users = action.record || [];
        draft.usersLoading = false;
        draft.error = false;
        break;
      case chatConstants.GET_USERS_ERROR:
        draft.usersLoading = false;
        draft.error = action.error || true;
        draft.message = action.message || null;
        break;

      case chatConstants.GET_USER_CHANNELS:
        draft.channelsLoading = true;
        draft.error = false;
        break;
      case chatConstants.GET_USER_CHANNELS_SUCCESS:
        draft.channels = action.record || [];
        draft.channelsLoading = false;
        draft.error = false;
        break;
      case chatConstants.GET_USER_CHANNELS_ERROR:
        draft.channelsLoading = false;
        draft.error = action.error || true;
        draft.message = action.message || null;
        break;

      case chatConstants.SELECT_USER:
        draft.selectedUser = action.user;
        break;

      case chatConstants.SET_ACTIVE_CHANNEL:
        draft.activeChannel = action.channel;
        break;

      case chatConstants.CREATE_USER:
        draft.loading = true;
        draft.error = false;
        break;
      case chatConstants.CREATE_USER_SUCCESS:
        draft.loading = false;
        draft.error = false;
        draft.success = true;
        break;
      case chatConstants.CREATE_USER_ERROR:
        draft.loading = false;
        draft.error = action.error || true;
        draft.message = action.message || null;
        break;

      case chatConstants.GET_OWNER_INFO:
        draft.ownerInfoLoading = true;
        draft.error = false;
        break;
      case chatConstants.GET_OWNER_INFO_SUCCESS:
        draft.ownerInfo = action.record;
        draft.ownerInfoLoading = false;
        draft.error = false;
        break;
      case chatConstants.GET_OWNER_INFO_ERROR:
        draft.ownerInfoLoading = false;
        draft.error = action.error || true;
        draft.message = action.message || null;
        break;

      default:
        break;
    }
  });
}