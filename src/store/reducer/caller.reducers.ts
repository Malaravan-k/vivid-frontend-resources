import { produce } from 'immer';
import { callerConstants } from '../constants/caller.constants';

interface UserState {
  loading: boolean;
  error: boolean | string;
  success: boolean;
  message: string | null;
  token: Record<string, any>;
}

interface UserAction {
  type: string;
  message?: string;
  error?: boolean | string;
  record?: any;
}

const initialState: UserState = {
  loading: false,
  error: false,
  success: false,
  message: null,
  token: {},
};

export default function callerReducer(
  state: UserState = initialState,
  action: UserAction
): UserState {
  return produce(state, (draft) => {
    switch (action.type) {
      case callerConstants.GET_CALLING_TOKEN:
        draft.loading = true;
        draft.error = false;
        draft.success = false;
        draft.message = null;
        break;
      case callerConstants.GET_CALLING_TOKEN_SUCCESS:
        draft.token = action.record;
        draft.loading = false;
        draft.error = false;
        draft.success = false;
        draft.message = '';
        break;
      case callerConstants.GET_CALLING_TOKEN_ERROR:
        draft.loading = false;
        draft.error = action.error || true;
        draft.message = action.message || null;
        draft.success = false;
        break;
    }
})
}