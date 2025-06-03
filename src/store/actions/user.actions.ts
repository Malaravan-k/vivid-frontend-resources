import { Dispatch } from "@reduxjs/toolkit";
import { userConstants } from "../constants/user.constants";
import { userServices } from "../services/user.services";
import { loaderActions } from "./loader.actions";


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



function AddUser(payload:any){
    return(dispatch:Dispatch)=>{
        dispatch(loaderActions.start());
        dispatch(request());
        userServices.AddUser(payload).then(
            (res)=>{
                const {response , error , message} = res;
                if(error){
                    dispatch(failure(true,message))
                    dispatch(loaderActions.end());
                }else{
                    dispatch(success(response, message, error))
                    dispatch(loaderActions.end());
                }
            },(error)=>{
                if(error && error.message){
                    error = error.message
                }
                dispatch(failure(true, error.message))
                dispatch(loaderActions.end());
            }
        )

    }
  function request() {
    return { type: userConstants.ADD_USER};
  }
  function success(record:any, message:any, error:any) {
    return { type: userConstants.ADD_USER_SUCCESS, record, message, error };
  }
  function failure(error:any, message:any) {
    return { type: userConstants.ADD_USER_ERROR, error, message };
  }
}


function updateRecord(record:any) {
  return (dispatch:Dispatch) => {
    dispatch(loaderActions.start());
    dispatch(request(record));
    userServices.updateRecord(record).then(
      (res) => {
        const { response, error, message } = res;
        if (error) {
          dispatch(failure(true, message));
          dispatch(loaderActions.end());
        } else {
          dispatch(success(response, message, error));
          dispatch(loaderActions.end());
        }
      },
      (error) => {
        if (error && error.message) {
          error = error.message;
        }
        dispatch(failure(true, error.toString()));
        dispatch(loaderActions.end());
      }
    );
  };
  function request(record:any) {
    return { type: userConstants.EDIT_USER, record };
  }
  function success(record:any, message:any, error:any) {
    return { type: userConstants.EDIT_USER_SUCCESS, record, message, error };
  }
  function failure(error:any, message:any) {
    return { type: userConstants.EDIT_USER_ERROR, error, message };
  }
}

function deleteRecord(record:any) {
  return (dispatch:Dispatch) => {
    dispatch(request());
    dispatch(loaderActions.start());
    userServices.deleteRecord(record).then(
      (res) => {
        const { error, message } = res;
        if (error) {
          dispatch(failure(true, message));
          dispatch(loaderActions.end());
        } else {
          dispatch(success(record, message, error));
          dispatch(loaderActions.end());
        }
      },
      (error) => {
        if (error && error.message) {
          error = error.message;
        }
        dispatch(failure(true, error.toString()));
        dispatch(loaderActions.end());
      }
    );
  };
  function request() {
    return { type: userConstants.DELETE_USER };
  }
  function success(record:any, message:any, error:any) {
    return { type: userConstants.DELETE_USER_SUCCESS, record, message, error };
  }
  function failure(error:any, message:any) {
    return { type: userConstants.DELETE_USER_ERROR, error, message };
  }
}


export const userActions = {
    AddUser,
    loadRecords,
    updateRecord,
    deleteRecord
}