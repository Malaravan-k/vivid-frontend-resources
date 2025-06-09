import { Dispatch } from "@reduxjs/toolkit";
import { userConstants } from "../constants/user.constants";
import { userServices } from "../services/user.services";
import { loaderActions } from "./loader.actions";
import { snackbarActions ,snackbarClose } from "../../helper/tools";


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
        console.log("error",error)
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
        console.log("errror",error)
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
        console.log("error",error)
        console.log("message",message);
        
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
        console.log("error",error)
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


export const userActions = {
  AddUser,
  loadRecords,
  updateRecord,
  deleteRecord
}