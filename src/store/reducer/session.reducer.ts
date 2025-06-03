import {produce} from 'immer';
import { sessionConstants } from '../constants/session.constants';

interface SessionState {
  loading: boolean;
  deleteSuccess: boolean;
  error: boolean | string;
  message: string | null;
  isLoggedIn: boolean;
  user: any;
  email: string | null;
  isInitialized: boolean;
  loginCompleted?: boolean;
}

interface SessionAction {
  type: string;
  error?: boolean | string;
  message?: string;
  user?: any;
  email?: string;
}

const initialState: SessionState = {
  loading: false,
  deleteSuccess: false,
  error: false,
  message: null,
  isLoggedIn: false,
  user: null,
  email: null,
  isInitialized: false,
};

const sessionReducer = (state = initialState, action: SessionAction): SessionState =>
  produce(state, (draft) => {
    const { error, message, user, email } = action;

    switch (action.type) {
      case sessionConstants.LOGIN:
        draft.loading = true;
        draft.email = email ?? null;
        draft.isInitialized = true;
        break;

      case sessionConstants.LOGIN_SUCCESS:
        draft.isInitialized = true;
        draft.isLoggedIn = true;
        draft.user = user ?? null;
        draft.loginCompleted = true;
        draft.loading = false;
        break;

      case sessionConstants.LOGIN_ERROR:
        draft.isLoggedIn = false;
        draft.loading = false;
        draft.error = error ?? true;
        draft.message = message ?? null;
        break;
      case sessionConstants.LOG_OUT:
        draft.isLoggedIn = false;
        draft.user = null;
        draft.loading = false;
        draft.isInitialized = false;
        break;

      default:
        break;
    }
  });

export default sessionReducer;
