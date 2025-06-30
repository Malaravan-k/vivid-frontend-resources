import { Dispatch } from "@reduxjs/toolkit";
import { voiceMailServices } from "../services/voicemail.services";
import { voiceMailConstants } from "../constants/voicemail.constants";

// Load all voice messages
function loadVoiceMails() {
  return (dispatch: Dispatch) => {
    dispatch(request());
    voiceMailServices.getAllVoiceMails().then(
      (res) => {
        const { response, error, message } = res;
        const voiceMails = response?.voicemail_logs ? response.voicemail_logs : []
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

  function request() {
    return { type: voiceMailConstants.LOAD_MESSAGE };
  }
  function success(records: any[]) {
    return { type: voiceMailConstants.LOAD_MESSAGES_SUCCESS, records };
  }
  function failure(error: any, message: any) {
    return { type: voiceMailConstants.LOAD_MESSAGES_ERROR, error, message };
  }
}

// Load single voice message by ID
function loadVoiceMaildetails(owner_number:any) {
  return (dispatch: Dispatch) => {
    dispatch(request());
    voiceMailServices.getVoiceMailDetails(owner_number).then(
      (res) => {
        console.log("res|||||||",res)
        const { response, error, message } = res;
        const messageDetails = response?.voicemails || res;
        console.log("messageDetails",messageDetails);
        if (error) {
          dispatch(failure(true, message));
        } else {
          console.log("Hiii da");
          
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

  function request() {
    return { type: voiceMailConstants.LOAD_MESSAGE };
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
