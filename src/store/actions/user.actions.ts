import { Dispatch } from "@reduxjs/toolkit";
import { userConstants } from "../constants/user.constants";
import { userServices } from "../services/user.services";
import { loaderActions } from "./loader.actions";
import { snackbarActions, snackbarClose } from "../../helper/tools";


function loadRecords(params?: any) {
  return (dispatch: Dispatch) => {
    dispatch(request());

    userServices.loadRecords(params).then(
      (res) => {
        const { error, message, total, page, response } = res;
        if (error) {
          dispatch(failure(error, message));
        } else {
          const users = response?.users ?? [];
          dispatch(success(users, total, page));
        }
      },
      (error) => {
        dispatch(failure(true, error?.message || 'Something went wrong'));
      }
    );
  };

  function request() {
    return { type: userConstants.GET_USERS };
  }

  function success(records: any[], total: number, page: number) {
    return { type: userConstants.GET_USERS_SUCCESS, records, total, page };
  }

  function failure(error: any, message: any) {
    return { type: userConstants.GET_USERS_ERROR, error, message };
  }
}



function AddUser(payload: any) {
  return (dispatch: Dispatch) => {
    dispatch(loaderActions.start());
    dispatch(request());
    userServices.AddUser(payload).then(
      (res) => {
        const { response, error, message } = res;
        console.log(message)
        if (error) {
          dispatch(failure(true, message))
          dispatch(loaderActions.end());
          dispatch(snackbarActions(true, message))
          setTimeout(() => {
            dispatch(snackbarClose());
          }, 3000);
        } else {
          dispatch(success(response, message, error))
          dispatch(loaderActions.end());
          dispatch(snackbarActions(false, message))
          setTimeout(() => {
            dispatch(snackbarClose());
          }, 3000);
        }
      }, (error) => {
        console.log("error", error)
        if (error && error?.response?.data?.message) {
          error = error?.response?.data?.message
        }
        dispatch(failure(true, error))
        dispatch(loaderActions.end());
        dispatch(snackbarActions(true, error))
        setTimeout(() => {
          dispatch(snackbarClose());
        }, 3000);
      }
    )

  }
  function request() {
    return { type: userConstants.ADD_USER };
  }
  function success(record: any, message: any, error: any) {
    return { type: userConstants.ADD_USER_SUCCESS, record, message, error };
  }
  function failure(error: any, message: any) {
    return { type: userConstants.ADD_USER_ERROR, error, message };
  }
}


function updateRecord(record: any) {
  return (dispatch: Dispatch) => {
    dispatch(loaderActions.start());
    dispatch(request(record));
    userServices.updateRecord(record).then(
      (res) => {
        const { response, error, message } = res;
        if (error) {
          dispatch(failure(true, message));
          dispatch(loaderActions.end());
          dispatch(snackbarActions(true, message))
          setTimeout(() => {
            dispatch(snackbarClose());
          }, 3000);
        } else {
          dispatch(success(response, message, error));
          dispatch(loaderActions.end());
          dispatch(snackbarActions(false, message))
          setTimeout(() => {
            dispatch(snackbarClose());
          }, 3000);
        }
      },
      (error) => {
        console.log("errror", error)
        if (error && error?.response?.data?.message) {
          error = error?.response?.data?.message
        }
        dispatch(failure(true, error));
        dispatch(loaderActions.end());
        dispatch(snackbarActions(true, error))
        setTimeout(() => {
          dispatch(snackbarClose());
        }, 3000);
      }
    );
  };
  function request(record: any) {
    return { type: userConstants.EDIT_USER, record };
  }
  function success(record: any, message: any, error: any) {
    return { type: userConstants.EDIT_USER_SUCCESS, record, message, error };
  }
  function failure(error: any, message: any) {
    return { type: userConstants.EDIT_USER_ERROR, error, message };
  }
}

function deleteRecord(record: any) {
  return (dispatch: Dispatch) => {
    dispatch(request());
    dispatch(loaderActions.start());
    userServices.deleteRecord(record).then(
      (res) => {
        const { error, message } = res;
        console.log("error", error)
        console.log("message", message);

        if (error) {
          dispatch(failure(true, message));
          dispatch(loaderActions.end());
          dispatch(snackbarActions(error, message))
          setTimeout(() => {
            dispatch(snackbarClose());
          }, 3000);
        } else {
          dispatch(success(record, message, error));
          dispatch(loaderActions.end());
          dispatch(snackbarActions(false, message))
          setTimeout(() => {
            dispatch(snackbarClose());
          }, 3000);
        }
      },
      (error) => {
        console.log("error", error)
        if (error && error?.response?.data?.message) {
          error = error?.response?.data?.message
        }

        dispatch(failure(true, error.toString()));
        dispatch(loaderActions.end());
        dispatch(snackbarActions(true, error.message))
        setTimeout(() => {
          dispatch(snackbarClose());
        }, 3000);
      }
    );
  };
  function request() {
    return { type: userConstants.DELETE_USER };
  }
  function success(record: any, message: any, error: any) {
    return { type: userConstants.DELETE_USER_SUCCESS, record, message, error };
  }
  function failure(error: any, message: any) {
    return { type: userConstants.DELETE_USER_ERROR, error, message };
  }
}

function syncTwilioNumbers() {
  return (dispatch: Dispatch) => {
    dispatch(request())
    userServices.syncTwilioNumbers().then(
      (res) => {
        console.log("response for sync twilio",res)
        const { message, error } = res
        if (error) {
          dispatch(failure(message, error))
          dispatch(snackbarActions(true, message))
          setTimeout(() => {
            dispatch(snackbarClose());
          }, 3000);
        } else {
          dispatch(success(message, error))
          dispatch(snackbarActions(false, message))
          setTimeout(() => {
            dispatch(snackbarClose());
          }, 3000);
        }
      },
      (error) => {
        if (error && error.message) {
          error = error.message
        }
        dispatch(failure(error, true))
        dispatch(snackbarActions(true, message))
        setTimeout(() => {
          dispatch(snackbarClose());
        }, 3000);
      }
    )
  }
  function request() {
    return { type: userConstants.SYNC_TWILIO_NUMBER }
  }
  function success(message: any, error: any) {
    return { type: userConstants.SYNC_TWILIO_NUMBER, message, error }
  }
  function failure(message: any, error: any) {
    return { type: userConstants.SYNC_TWILIO_NUMBER, message, error }
  }
}

function fetchTwilioNumbers() {
  return (dispatch: Dispatch) => {
    dispatch(request())
    console.log("hiiiiii")
    userServices.fetchTwilioNumbers().then(
      (res) => {
        const { available_numbers, message, error } = res
        if (error) {
          dispatch(failure(message, error))
          dispatch(snackbarActions(true, message))
          setTimeout(() => {
            dispatch(snackbarClose());
          }, 3000);
        } else {
          console.log("available_numbers", available_numbers)
          dispatch(success(available_numbers, message, error))
          dispatch(snackbarActions(false, message))
          setTimeout(() => {
            dispatch(snackbarClose());
          }, 3000);
        }
      },
      (error) => {
        console.log("error", error)
        if (error && error.message) {
          error = error.message
        }

        dispatch(failure(error, true))
        dispatch(snackbarActions(true, error))
        setTimeout(() => {
          dispatch(snackbarClose());
        }, 3000);
      }
    )
  }
  function request() {
    return { type: userConstants.FETCH_TWILIO_NUMBERS }
  }
  function success(mobileNumbers: any, message: any, error: any) {
    console.log("records", mobileNumbers)
    return { type: userConstants.FETCH_TWILIO_NUMBERS_SUCCESS, mobileNumbers, message, error }
  }
  function failure(message: any, error: any) {
    return { type: userConstants.FETCH_TWILIO_NUMBERS_SUCCESS, message, error }
  }
}

function getUserDetails(userId: string) {
  return (dispatch: Dispatch) => {
    dispatch(request());
    userServices.getUserDetails(userId).then(
      (res) => {
        const { error, message, response } = res;
        if (error) {
          dispatch(failure(error, message));
        } else {
          // Get the primary mobile number from mobile_numbers
          const mobileNumbers = response?.phone_numbers || [];
          const primaryMobileObj = mobileNumbers.find((m: any) => m.is_primary);
          dispatch(success(response,primaryMobileObj?.phone_number));
          if (primaryMobileObj?.phone_number) {
            localStorage.setItem('primary_mobile_number', primaryMobileObj.phone_number);
          }
        }
      },
      (error) => {
        dispatch(failure(true, error?.message || 'Something went wrong'));
      }
    );
  };

  function request() {
    return { type: userConstants.GET_USER_DETAILS };
  }

  function success(userDetails: any[],primaryMobileNumber:any) {
    return { type: userConstants.GET_USER_DETAILS_SUCCESS, userDetails ,primaryMobileNumber };
  }

  function failure(error: any, message: any) {
    return { type: userConstants.GET_USER_DETAILS_ERROR, error, message };
  }
}

function clear(){
  return {type : userConstants.CLEAR}
}


export const userActions = {
  AddUser,
  loadRecords,
  updateRecord,
  deleteRecord,
  syncTwilioNumbers,
  fetchTwilioNumbers,
  getUserDetails,
  clear
}