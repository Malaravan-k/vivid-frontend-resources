import { Dispatch } from '@reduxjs/toolkit';
import { messageConstants } from '../constants/message.constants';
import { messageServices } from '../services/message.services';
import { Message, Conversation, Case } from '../../types/message.types';

function fetchMessages(conversationId: string) {
  return (dispatch: Dispatch) => {
    dispatch(request(conversationId));
    
    messageServices.fetchMessages(conversationId).then(
      (messages) => {
        dispatch(success(messages));
      },
      (error) => {
        dispatch(failure(error.toString()));
      }
    );
  };
  
  function request(conversationId: string) {
    return { type: messageConstants.FETCH_MESSAGES, conversationId };
  }
  
  function success(messages: Message[]) {
    return { type: messageConstants.FETCH_MESSAGES_SUCCESS, messages };
  }
  
  function failure(error: string) {
    return { type: messageConstants.FETCH_MESSAGES_ERROR, error };
  }
}

function sendMessage(message: Omit<Message, 'id' | 'timestamp' | 'read'>) {
  return (dispatch: Dispatch) => {
    dispatch(request(message));
    
    messageServices.sendMessage(message).then(
      (sentMessage) => {
        dispatch(success(sentMessage));
      },
      (error) => {
        dispatch(failure(error.toString()));
      }
    );
  };
  
  function request(message: Omit<Message, 'id' | 'timestamp' | 'read'>) {
    return { type: messageConstants.SEND_MESSAGE, message };
  }
  
  function success(message: Message) {
    return { type: messageConstants.SEND_MESSAGE_SUCCESS, message };
  }
  
  function failure(error: string) {
    return { type: messageConstants.SEND_MESSAGE_ERROR, error };
  }
}

function receiveMessage(message: Message) {
  return {
    type: messageConstants.RECEIVE_MESSAGE,
    message
  };
}

function fetchConversations(userId: string) {
  return (dispatch: Dispatch) => {
    dispatch(request(userId));
    
    messageServices.fetchConversations(userId).then(
      (conversations) => {
        dispatch(success(conversations));
      },
      (error) => {
        dispatch(failure(error.toString()));
      }
    );
  };
  
  function request(userId: string) {
    return { type: messageConstants.FETCH_CONVERSATIONS, userId };
  }
  
  function success(conversations: Conversation[]) {
    return { type: messageConstants.FETCH_CONVERSATIONS_SUCCESS, conversations };
  }
  
  function failure(error: string) {
    return { type: messageConstants.FETCH_CONVERSATIONS_ERROR, error };
  }
}

function fetchCaseDetails(caseId: string) {
  return (dispatch: Dispatch) => {
    dispatch(request(caseId));
    
    messageServices.fetchCaseDetails(caseId).then(
      (caseDetails) => {
        dispatch(success(caseDetails));
      },
      (error) => {
        dispatch(failure(error.toString()));
      }
    );
  };
  
  function request(caseId: string) {
    return { type: messageConstants.FETCH_CASE_DETAILS, caseId };
  }
  
  function success(caseDetails: Case) {
    return { type: messageConstants.FETCH_CASE_DETAILS_SUCCESS, caseDetails };
  }
  
  function failure(error: string) {
    return { type: messageConstants.FETCH_CASE_DETAILS_ERROR, error };
  }
}

function setActiveConversation(conversationId: string) {
  return {
    type: messageConstants.SET_ACTIVE_CONVERSATION,
    conversationId
  };
}

function markAsRead(conversationId: string, userId: string) {
  return (dispatch: Dispatch) => {
    messageServices.markMessagesAsRead(conversationId, userId)
      .then(() => {
        dispatch({
          type: messageConstants.MARK_AS_READ,
          conversationId,
          userId
        });
      })
      .catch((error) => {
        console.error('Failed to mark messages as read:', error);
      });
  };
}

export const messageActions = {
  fetchMessages,
  sendMessage,
  receiveMessage,
  fetchConversations,
  fetchCaseDetails,
  setActiveConversation,
  markAsRead
};