import { Dispatch } from "@reduxjs/toolkit";
import { callerServices } from "../services/caller.services";
import { callerConstants } from "../constants/caller.constants";

function getCallerToken(id:any) {
  return (dispatch:Dispatch) => {
    dispatch(request(id));
    callerServices.getToken(id).then(
      (res) => {
       const data = JSON.parse(res?.body || '{}'); // Parse the JSON string
       const { response, error, message } = data;
        if (error) {
          dispatch(failure(true, message));
        } else {
          dispatch(success(response?.token));
          localStorage.setItem('twilioToken', response?.token)
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
  function request(id:any) {
    return { type: callerConstants.GET_CALLING_TOKEN, id };
  }
  function success(record:any) {
    return { type: callerConstants.GET_CALLING_TOKEN_SUCCESS, record };
  }
  function failure(error:any, message:any) {
    return { type: callerConstants.GET_CALLING_TOKEN_ERROR, error, message };
  }
}

export const callerActions = {
    getCallerToken
}