import { Dispatch } from "@reduxjs/toolkit";
import { voiceMailServices } from "../services/voicemail.services";
import { voiceMailConstants } from "../constants/voicemail.constants";

// Load all voice messages
function loadVoiceMails(agentId: string , paginationParams?:any) {
  return (dispatch: Dispatch) => {
    dispatch(request(agentId));
    voiceMailServices.getAllVoiceMails(agentId ,paginationParams ).then(
      (res) => {
        const { response, error, message } = res;
        const voiceMails = response?.call_logs_summary ? response.call_logs_summary : []
        if (error) {
          dispatch(failure(true, message));
        } else {
          dispatch(success(voiceMails));
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

  function request(agentId: string) {
    return { type: voiceMailConstants.LOAD_MESSAGES, agentId };
  }
  function success(records: any[]) {
    return { type: voiceMailConstants.LOAD_MESSAGES_SUCCESS, records };
  }
  function failure(error: any, message: any) {
    return { type: voiceMailConstants.LOAD_MESSAGES_ERROR, error, message };
  }
}

// Load single voice message by ID
function loadVoiceMaildetails(user_number:any, owner_number:any) {
  return (dispatch: Dispatch) => {
    dispatch(request(user_number));
    voiceMailServices.getVoiceMailDetails(user_number ,owner_number).then(
      (res) => {
        console.log("res|||||||",res)
        const { response, error, message } = res;
        const messageDetails = response?.call_logs[0] || res;
        console.log("messageDetails",messageDetails);
        
        if (error) {
          dispatch(failure(true, message));
        } else {
          dispatch(success(messageDetails));
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

  function request(messageId: string) {
    return { type: voiceMailConstants.LOAD_MESSAGE, messageId };
  }
  function success(record: any) {
    return { type: voiceMailConstants.LOAD_MESSAGE_SUCCESS, record };
  }
  function failure(error: any, message: any) {
    return { type: voiceMailConstants.LOAD_MESSAGE_ERROR, error, message };
  }
}
function updateVoicemailRead(id:string){
  return (dispatch:Dispatch)=>{
    voiceMailServices.updateVoicemailRead(id).then(
      (res)=>{
        const {  message } = res
        dispatch(success(message))
      },
      (error) => {
        if (error && error.message) {
          error = error.message;
        }
        dispatch(failure(true, error.toString()));
      }
    )
  }
  function success(message:any){
    return {type:voiceMailConstants.UPDATE_VOICEMAIL_READ_SUCCESS, message}
  }
  function failure(error: any, message: any) {
    return { type: voiceMailConstants.LOAD_MESSAGE_ERROR, error, message };
  }
}

export const voiceMailsActions = {
  loadVoiceMails,
  loadVoiceMaildetails,
  updateVoicemailRead
};
