import { produce } from 'immer';
import { callLogsConstants } from '../constants/callLogs.constants';
interface CallLogsState {
    loading: boolean;
    modalLoading:boolean
    error: boolean | string;
    success: boolean;
    message: string | null;
    record: Record<string, any>;
    records: any[];
    total: number | null;
    page: number;
}

interface CallLogsAction {
    type: string;
    message?: string;
    error?: boolean | string;
    callLogsDetails?: any;
    records?: any[];
    total?: number;
    page?: number;
}

const initialState: CallLogsState = {
    loading: false,
    modalLoading:false,
    error: false,
    success: false,
    message: null,
    record: {},
    records: [],
    total: null,
    page: 0,
};

export default function callLogsReducer(
    state: CallLogsState = initialState,
    action: CallLogsAction
): CallLogsState {
    return produce(state, (draft) => {
        switch (action.type) {
            case callLogsConstants.LOAD_CALLLOGS:
                draft.loading = true;
                draft.error = false;
                draft.success = false;
                draft.message = null;
                break;
            case callLogsConstants.LOAD_CALLLOG_DETAILS:
                draft.modalLoading = true;
                draft.error = false;
                draft.success = false;
                draft.message = null;
                break;

            case callLogsConstants.LOAD_CALLLOGS_SUCCESS:
                draft.loading = false;
                draft.records = Array.isArray(action.records) ? action.records : [];
                draft.total = action.total ?? null;
                draft.page = action.page ?? 0;
                draft.success = true;
                draft.error = false;
                draft.message = null;
                break;


            case callLogsConstants.LOAD_CALLLOG_DETAILS_SUCCESS:
                draft.modalLoading = false;
                draft.record = action.callLogsDetails || {};
                draft.success = true;
                draft.error = false;
                draft.message = null;
                break;

            case callLogsConstants.LOAD_CALLLOGS_ERROR:
                draft.loading = false;
                draft.error = action.error || true;
                draft.message = action.message || null;
                draft.success = false;
                break;
            case callLogsConstants.LOAD_CALLLOG_DETAILS_ERROR:
                draft.modalLoading = false;
                draft.error = action.error || true;
                draft.message = action.message || null;
                draft.success = false;
                break;
        }
    });
}
