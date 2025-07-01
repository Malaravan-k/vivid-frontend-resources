import { Dispatch } from "@reduxjs/toolkit";
import { callerServices } from "../services/caller.services";
import { callerConstants } from "../constants/caller.constants";

function getCallerToken(id:any) {
  return (dispatch:Dispatch) => {
    dispatch(request(id));
    callerServices.getToken(id).then(
      (res) => {
       const data = JSON.parse(res?.body || '{}');
       console.log("response of token " , data) // Parse the JSON string
       const { response, error, message } = data;
        if (error) {
          dispatch(failure(true, message));
        } else {
          dispatch(success(response?.token , response?.agent_id));
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
  function success(token:any , agent_id:any) {
    return { type: callerConstants.GET_CALLING_TOKEN_SUCCESS, token ,agent_id  };
  }
  function failure(error:any, message:any) {
    return { type: callerConstants.GET_CALLING_TOKEN_ERROR, error, message };
  }
}

function clear(){
  return {type: callerConstants.CLEAR}
}

export const callerActions = {
    getCallerToken,
    clear
}