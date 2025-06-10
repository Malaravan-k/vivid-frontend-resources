import { produce } from 'immer';
import { voiceMessageConstants } from '../constants/voicemessage.constants';
interface VoiceMessagesState {
  loading: boolean;
  error: boolean | string;
  success: boolean;
  message: string | null;
  record: Record<string, any>;
  records: any[];
  total: number | null;
  page: number;
}

interface VoiceMessagesAction {
  type: string;
  message?: string;
  error?: boolean | string;
  record?: any;
  records?: any[];
  total?: number;
  page?: number;
}

const initialState: VoiceMessagesState = {
  loading: false,
  error: false,
  success: false,
  message: null,
  record: {},
  records: [],
  total: null,
  page: 0,
};

export default function voiceMessagesReducer(
  state: VoiceMessagesState = initialState,
  action: VoiceMessagesAction
): VoiceMessagesState {
  return produce(state, (draft) => {
    switch (action.type) {
      case voiceMessageConstants.LOAD_MESSAGES:
      case voiceMessageConstants.LOAD_MESSAGE:
        draft.loading = true;
        draft.error = false;
        draft.success = false;
        draft.message = null;
        break;

      case voiceMessageConstants.LOAD_MESSAGES_SUCCESS:
        draft.loading = false;
        draft.records = action.records || [];
        draft.total = action.total ?? null;
        draft.page = action.page ?? 0;
        draft.success = true;
        draft.error = false;
        draft.message = null;
        break;

      case voiceMessageConstants.LOAD_MESSAGE_SUCCESS:
        draft.loading = false;
        draft.record = action.record || {};
        draft.success = true;
        draft.error = false;
        draft.message = null;
        break;

      case voiceMessageConstants.LOAD_MESSAGES_ERROR:
      case voiceMessageConstants.LOAD_MESSAGE_ERROR:
        draft.loading = false;
        draft.error = action.error || true;
        draft.message = action.message || null;
        draft.success = false;
        break;
    }
  });
}
