import { Dispatch } from "@reduxjs/toolkit";
import { callLogsServices } from "../services/callLogs.services";
import { callLogsConstants } from "../constants/callLogs.constants";

// Load all voice messages
function loadCallLogs() {
  return (dispatch: Dispatch) => {
    dispatch(request());
    callLogsServices.getCallLogs().then(
      (res) => {
        const { response, error, message } = res;
        const records =response?.call_logs_summary ? response.call_logs_summary : [];
        if (error) {
          dispatch(failure(true, message));
        } else {
          dispatch(success(records));
        }
      },
      (error) => {
        if (error && error.message) {
          error = error.message;
        }
        dispatch(failure(true, error.toString()));
      }
    );
  };

  function request() {
    return { type: callLogsConstants.LOAD_CALLLOGS };
  }
  function success(records: any[]) {
    return { type: callLogsConstants.LOAD_CALLLOGS_SUCCESS, records };
  }
  function failure(error: any, message: any) {
    return { type: callLogsConstants.LOAD_CALLLOGS_ERROR, error, message };
  }
}

// Load single voice message by ID
function loadCallLogsDetails(owner_number:any) {
  return (dispatch: Dispatch) => {
    dispatch(request())
    callLogsServices.getCallLogsDetails(owner_number).then(
      (res) => {
        const { response, error, message } = res;
        const callLogsDetails = response?.call_logs || res;
        if (error) {
          dispatch(failure(true, message));
        } else {
          dispatch(success(callLogsDetails));
        }
      },
      (error) => {
        if (error && error.message) {
          error = error.message;
        }
        dispatch(failure(true, error.toString()));
      }
    );
  };

  function request() {
    return { type: callLogsConstants.LOAD_CALLLOG_DETAILS };
  }
  function success(callLogsDetails: any) {
    return { type: callLogsConstants.LOAD_CALLLOG_DETAILS_SUCCESS, callLogsDetails };
  }
  function failure(error: any, message: any) {
    return { type: callLogsConstants.LOAD_CALLLOG_DETAILS_ERROR, error, message };
  }
}



export const callLogsActions = {
  loadCallLogs,
  loadCallLogsDetails,
};
