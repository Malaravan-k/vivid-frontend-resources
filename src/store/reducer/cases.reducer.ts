import { produce } from 'immer';
import { casesConstants } from '../constants/cases.constants';

interface UserState {
  loading: boolean;
  error: boolean | string;
  success: boolean;
  message: string | null;
  record: Record<string, any>;
  records: any[];
  recordsMetaData: Record<string, any>;
  total: number | null;
  pageSize: number | null;
  page: number;
  deleteSuccess:boolean;
  caseId: any;
  getCaseIdLoading:boolean
}

interface UserAction {
  type: string;
  message?: string;
  error?: boolean | string;
  record?: any;
  records?: any[];
  total?: number;
  page?: number;
  caseId?:null
}
const initialState: UserState = {
  loading: false,
  error: false,
  success: false,
  message: null,
  record: {},
  records: [],
  recordsMetaData: {},
  total: null,
  pageSize: null,
  page: 0,
  deleteSuccess:false,
  caseId:null,
  getCaseIdLoading:false
};

export default function caseReducer(
  state: UserState = initialState,
  action: UserAction
): UserState {
  return produce(state, (draft) => {
    console.log("action.record",action.record);
    
    switch (action.type) {
      case casesConstants.LOAD_CASES:
      case casesConstants.LOAD_CASE:
        draft.loading = true;
        draft.error = false;
        draft.success = false;
        draft.message = null;
        break;
      case casesConstants.LOAD_CASES_SUCCESS:
        draft.loading = false;
        draft.records = action.records || [];
        draft.error = false;
        draft.message = action.message || null;
        draft.total = action.total ?? null;
        draft.page = action.page ?? 0;
        break;
      case casesConstants.LOAD_CASE_SUCCESS:
        draft.record = action.record? action.record : {};
        draft.loading = false;
        draft.error = false;
        draft.success = false;
        draft.message = '';
        break;
      case casesConstants.LOAD_CASE_ERROR:
      case casesConstants.LOAD_CASES_ERROR:
        draft.loading = false;
        draft.error = action.error || true;
        draft.message = action.message || null;
        draft.success = false;
        break;
      case casesConstants.SEARCH_CASEID:
        draft.getCaseIdLoading = true;
        draft.error = false;
        draft.message = null;
        draft.success = false;
        break;
      case casesConstants.SEARCH_CASEID_SUCCESS:
        draft.getCaseIdLoading = false;
        draft.caseId = action.caseId;
        draft.message = action.message ?? null;
        draft.error = false;
        draft.success = true;
        break;
      case casesConstants.SEARCH_CASEID_ERROR:
        draft.getCaseIdLoading = false;
        draft.error = action.error || true;
        draft.message = action.message || null;
        draft.success = false;
        break;
    }
})
}