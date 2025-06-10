import { Dispatch } from "@reduxjs/toolkit";
import { voiceMessageServices } from "../services/voicemessage.services";
import { voiceMessageConstants } from "../constants/voicemessage.constants";

// Load all voice messages
function loadVoiceMessages(agentId: string) {
  return (dispatch: Dispatch) => {
    dispatch(request(agentId));
    voiceMessageServices.getAllVoiceMessages(agentId).then(
      (res) => {
        const { response, error, message } = res;
        const messages = response?.data || res;
        if (error) {
          dispatch(failure(true, message));
        } else {
          dispatch(success(messages));
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
    return { type: voiceMessageConstants.LOAD_MESSAGES, agentId };
  }
  function success(messages: any[]) {
    return { type: voiceMessageConstants.LOAD_MESSAGES_SUCCESS, messages };
  }
  function failure(error: any, message: any) {
    return { type: voiceMessageConstants.LOAD_MESSAGES_ERROR, error, message };
  }
}

// Load single voice message by ID
function loadVoiceMessage(messageId: string) {
  return (dispatch: Dispatch) => {
    dispatch(request(messageId));
    voiceMessageServices.getVoiceMessageDetails(messageId).then(
      (res) => {
        const { response, error, message } = res;
        const messageDetails = response || res;
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
    return { type: voiceMessageConstants.LOAD_MESSAGE, messageId };
  }
  function success(messageDetails: any) {
    return { type: voiceMessageConstants.LOAD_MESSAGE_SUCCESS, messageDetails };
  }
  function failure(error: any, message: any) {
    return { type: voiceMessageConstants.LOAD_MESSAGE_ERROR, error, message };
  }
}

export const voiceMessagesActions = {
  loadVoiceMessages,
  loadVoiceMessage,
};
