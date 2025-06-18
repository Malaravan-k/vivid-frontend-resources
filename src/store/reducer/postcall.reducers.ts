import { produce } from 'immer';
import { postCallConstants } from '../constants/postcall.constants';
interface postCallState {
    loading: boolean;
    error: boolean | string;
    success: boolean;
    message: string | null;
    record: Record<string, any>;
}

interface postCallActions {
    type: string;
    message?: string;
    error?: boolean | string;
    postCallDetails?: any;
}

const initialState: postCallState = {
    loading: false,
    error: false,
    success: false,
    message: null,
    record: {},
};

export default function postCallReducer(
    state: postCallState = initialState,
    action: postCallActions
): postCallState {
    return produce(state, (draft) => {
        switch (action.type) {
            case postCallConstants.LOAD_POSTCALL:
                draft.loading = true;
                draft.error = false;
                draft.success = false;
                draft.message = null;
                break;
            case postCallConstants.LOAD_POSTCALL_SUCCESS:
                draft.loading = false;
                draft.record = action.postCallDetails || {};
                draft.success = true;
                draft.error = false;
                draft.message = null;
                break;
            case postCallConstants.LOAD_POSTCALL_ERROR:
            case postCallConstants.UPDATE_POSTCALL_FORM_ERROR:
                draft.loading = false;
                draft.error = action.error || true;
                draft.message = action.message || null;
                draft.success = false;
                break;
            case postCallConstants.UPDATE_POSTCALL_FORM:
                draft.loading = false;
                draft.error = false;
                draft.message = null;
                 draft.success = false;
                 break;
            case postCallConstants.UPDATE_POSTCALL_FORM_SUCCESS:
                draft.success = true;
                draft.error =false;
                draft.message = action.message ?? null
                break;
            case postCallConstants.RESET_SUCCESS:
                draft.success = false;
                break;
        }
    });
}
