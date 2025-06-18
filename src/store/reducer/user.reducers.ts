import { produce } from 'immer';
import { userConstants } from '../constants/user.constants';

interface UserState {
  loading: boolean;
  error: boolean | string;
  success: boolean;
  message: string | null;
  record: Record<string, any>;
  userRecords: any;
  recordsMetaData: Record<string, any>;
  total: number | null;
  pageSize: number | null;
  page: number;
  deleteSuccess: boolean;
  mobileNumbers:any;
  userDetails:any;
  primaryMobileNumber:any
}

interface UserAction {
  type: string;
  message?: string;
  error?: boolean | string;
  record?: any;
  records?: any[];
  total?: number;
  page?: number;
  mobileNumbers?:any[],
  userDetails?:any,
  primaryMobileNumber?:any
}

const initialState: UserState = {
  loading: false,
  error: false,
  success: false,
  message: null,
  record: {},
  userRecords: [],
  recordsMetaData: {},
  total: null,
  pageSize: null,
  page: 0,
  deleteSuccess: false,
  mobileNumbers:[],
  userDetails:{},
  primaryMobileNumber:null
};

const userReducer = (state = initialState, props: UserAction): UserState =>
  produce(state, (draft) => {
    const { type, message, error, record, records,mobileNumbers, total, page,userDetails,primaryMobileNumber } = props;    
    switch (type) {
      case userConstants.GET_USERS:
      case userConstants.FETCH_TWILIO_NUMBERS:
      case userConstants.GET_USER_DETAILS:
        draft.loading = true;
        draft.error = false;
        draft.success = false;
        draft.message = null;
        draft.deleteSuccess = false;
        break;
      case userConstants.SYNC_TWILIO_NUMBER:
        draft.loading = false;
        draft.error = false;
        draft.success = false;
        draft.message = null;
        draft.deleteSuccess = false;
        break;
      case userConstants.GET_USERS_SUCCESS:
        draft.loading = false;
        draft.userRecords = records || [];
        draft.total = total ?? null;
        draft.page = page ?? 0;
        draft.error = false;
        draft.message = message ?? null;
        break;
      
      case userConstants.FETCH_TWILIO_NUMBERS_SUCCESS:
        draft.loading = false;
        draft.mobileNumbers = mobileNumbers || [];
        draft.message = message || null;
        draft.success = false;
        draft.error = false;
        break;
      case userConstants.GET_USERS_ERROR:
      case userConstants.GET_USER_DETAILS_ERROR:
      case userConstants.SYNC_TWILIO_NUMBER_ERROR:
      case userConstants.FETCH_TWILIO_NUMBERS_ERROR:
        draft.loading = false;
        draft.error = error ?? true;
        draft.message = message ?? null;
        draft.success = false;
        break;
      case userConstants.ADD_USER_SUCCESS:
        draft.loading = false;
        draft.error = false;
        draft.success = true;
        draft.message = message ?? null;
        break;

      case userConstants.ADD_USER_ERROR:
        draft.loading = false;
        draft.error = error ?? true;
        draft.success = false;
        draft.message = message ?? null;
        break;

      case userConstants.EDIT_USER_SUCCESS:
        const updatedList = state.userRecords.concat(record);
        draft.userRecords = updatedList.filter(
          (v, i, a) => a.findIndex((v2) => v2.user_id === v.user_id) === i
        );
        draft.loading = false;
        draft.error = false;
        draft.success = true;
        draft.message = message ?? null;
        draft.total = (state.total ?? 0) + (Array.isArray(record) ? record.length : 1);
        break;

      case userConstants.EDIT_USER_ERROR:
        draft.loading = false;
        draft.error = error ?? true;
        draft.success = false;
        draft.message = message ?? null;
        break;
      case userConstants.GET_USER_DETAILS_SUCCESS:
        draft.loading = false;
        draft.error = false;
        draft.userDetails = userDetails
        draft.primaryMobileNumber = primaryMobileNumber
        draft.message=message ?? null
        break;
      case userConstants.DELETE_USER_SUCCESS:
        draft.loading = false;
        draft.error = false;
        draft.success = false;
        draft.message = message ?? null;
        draft.total = (state.total ?? 1) - 1;
        draft.deleteSuccess = true;
        break;
      case userConstants.SYNC_TWILIO_NUMBER_SUCCESS:
        draft.loading= false;
        draft.error = false;
        draft.message = message ?? null;
        draft.success = false;
        break;
      case userConstants.DELETE_USER_ERROR:
        draft.loading = false;
        draft.error = error ?? true;
        draft.success = false;
        draft.message = message ?? null;
        break;

      default:
        break;
    }
  });

export default userReducer;
