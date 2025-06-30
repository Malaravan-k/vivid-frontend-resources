import { Dispatch } from "@reduxjs/toolkit";
import { chatServices } from "../services/chat.services";
import { chatConstants } from "../constants/chat.constants";
import { NavigateFunction } from "react-router-dom";
import { casesActions } from "./cases.actions";

function getUsers(agentId: string) {
  return (dispatch: Dispatch) => {
    dispatch(request());
    chatServices.getUsers(agentId).then(
      (res) => {
        console.log("Users response:", res);
        const { response, error, message } = res;
        if (error) {
          dispatch(failure(error, message));
        } else {
          dispatch(success(response || []));
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
    return { type: chatConstants.GET_USERS };
  }
  function success(record: any) {
    return { type: chatConstants.GET_USERS_SUCCESS, record };
  }
  function failure(error: any, message: any) {
    return { type: chatConstants.GET_USERS_ERROR, error, message };
  }
}

function getConversation(conversationId: string) {
  return (dispatch: Dispatch) => {
    dispatch(request());
    chatServices.getConversation(conversationId).then(
      (res) => {
        console.log("Conversation response:", res);
        dispatch(success(res));
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
    return { type: chatConstants.GET_CONVERSATION };
  }
  function success(record: any) {
    return { type: chatConstants.GET_CONVERSATION_SUCCESS, record };
  }
  function failure(error: any, message: any) {
    return { type: chatConstants.GET_CONVERSATION_ERROR, error, message };
  }
}

function sendMessage(conversationId: string, senderId: string, message: string) {
  return (dispatch: Dispatch) => {
    // Create optimistic message
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      conversation_sid: conversationId,
      author: senderId,
      body: message,
      timestamp: new Date().toISOString(),
      status: 'sending',
      isTemp: true
    };
    
    // Add optimistic message to UI immediately
    dispatch({ 
      type: chatConstants.ADD_MESSAGE, 
      messageData: optimisticMessage 
    });
    
    dispatch(request());
    
    chatServices.sendMessage({
      conversation_sid: conversationId,
      author: senderId,
      message: message,
    }).then(
      (res) => {
        console.log("Message sent successfully:", res);
        const messageWithMetadata = {
          ...res,
          conversation_sid: conversationId,
          author: senderId,
          body: message,
          timestamp: res.timestamp || new Date().toISOString(),
          id: res.id || `msg-${Date.now()}`,
          status: 'sent'
        };
        dispatch(success(messageWithMetadata));
      },
      (error) => {
        console.error("Failed to send message:", error);
        if (error && error.message) {
          error = error.message;
        }
        dispatch(failure(true, error.toString()));
      }
    );
  };

  function request() { 
    return { type: chatConstants.SEND_MESSAGE }; 
  }
  function success(record: any) { 
    return { type: chatConstants.SEND_MESSAGE_SUCCESS, record }; 
  }
  function failure(error: any, message: any) { 
    return { type: chatConstants.SEND_MESSAGE_ERROR, error, message }; 
  }
}

function selectUser(user: any) {
  return async (dispatch: Dispatch) => {
    try {
      const conversationId = user?.conversation_sid;
      dispatch({ type: chatConstants.SELECT_USER, user });
      
      if (conversationId) {
        dispatch(getConversation(conversationId));
        dispatch({ type: chatConstants.SET_ACTIVE_CONVERSATION, conversationId });
      }

      // Load case information for the selected user
      if (user?.owner_no) {
        const phoneNumber = user.owner_no.replace(/\D/g, ''); // Remove non-digits
        dispatch(casesActions.loadRecord(phoneNumber));
      }
    } catch (error) {
      console.error('Error selecting user:', error);
    }
  };
}

function createUser(agentId: string | null, phoneNumber: string | null, navigate?: NavigateFunction) {
  return (dispatch: Dispatch) => {
    dispatch(request());
    chatServices.createUser({
      agent_no: agentId,
      owner_no: phoneNumber,
    }).then(
      (res) => {
        console.log("User created:", res);
        dispatch(success(res));
        if (navigate) {
          navigate('/messages', { state: res });
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
    return { type: chatConstants.CREATE_USER };
  }
  function success(record: any) {
    return { type: chatConstants.CREATE_USER_SUCCESS, record };
  }
  function failure(error: any, message: any) {
    return { type: chatConstants.CREATE_USER_ERROR, error, message };
  }
}

function receiveMessage(messageData: any) {
  console.log("Hii from receive action",messageData);
  return {
    type: chatConstants.RECEIVE_MESSAGE,
    messageData
  };
}

function setSocketConnected(connected: boolean) {
  return {
    type: connected ? chatConstants.SOCKET_CONNECTED : chatConstants.SOCKET_DISCONNECTED
  };
}

function resetChat(){
  return { type:chatConstants.RESET_CHAT_STATE}
}

export const chatActions = {
  getUsers,
  getConversation,
  sendMessage,
  selectUser,
  createUser,
  receiveMessage,
  setSocketConnected,
  resetChat
};