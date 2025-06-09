import { Dispatch } from "@reduxjs/toolkit";
import { chatServices } from "../services/chat.services";
import { chatConstants } from "../constants/chat.constants";

function getStreamToken(userNo: string, ownerNo: string) {
  return (dispatch: Dispatch) => {
    dispatch(request({ userNo, ownerNo }));
    chatServices.getStreamToken({ user_no: userNo, owner_no: ownerNo }).then(
      async (res) => {
        try {
          // Initialize Stream client with the token
          const userId = userNo.replace(/\D/g, '');
          const client = await chatServices.initializeStreamClient(userId, res.token, res.api_key);
          
          dispatch(success(res));
          dispatch(initializeChat(client, []));
          
          // Load users and channels after successful initialization
          dispatch(getUsers());
          dispatch(getUserChannels(userId));
        } catch (error) {
          dispatch(failure(true, error.toString()));
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

  function request(data: any) {
    return { type: chatConstants.GET_STREAM_TOKEN, data };
  }
  function success(record: any) {
    return { type: chatConstants.GET_STREAM_TOKEN_SUCCESS, record };
  }
  function failure(error: any, message: any) {
    return { type: chatConstants.GET_STREAM_TOKEN_ERROR, error, message };
  }
}

function initializeChat(client: any, channels: any) {
  return (dispatch: Dispatch) => {
    dispatch({ type: chatConstants.INITIALIZE_CHAT_SUCCESS, client, channels });
  };
}

function getUsers() {
  return (dispatch: Dispatch) => {
    dispatch(request());
    chatServices.getUsers().then(
      (res) => {
        dispatch(success(res.users || []));
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

function getUserChannels(userId: string) {
  return (dispatch: Dispatch) => {
    dispatch(request());
    chatServices.getUserChannels(userId).then(
      (channels) => {
        dispatch(success(channels || []));
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
    return { type: chatConstants.GET_USER_CHANNELS };
  }
  function success(record: any) {
    return { type: chatConstants.GET_USER_CHANNELS_SUCCESS, record };
  }
  function failure(error: any, message: any) {
    return { type: chatConstants.GET_USER_CHANNELS_ERROR, error, message };
  }
}

function selectUser(user: any, currentUserId: string) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch({ type: chatConstants.SELECT_USER, user });
      
      // Get or create channel between current user and selected user
      const channel = await chatServices.getOrCreateChannel(currentUserId, user.id);
      dispatch({ type: chatConstants.SET_ACTIVE_CHANNEL, channel });
      
      // Also fetch owner info for this user
      dispatch(getOwnerInfo(user.id));
    } catch (error) {
      console.error('Error selecting user:', error);
    }
  };
}

function createUser(phoneNumber: string, name?: string) {
  return (dispatch: Dispatch) => {
    dispatch(request({ phoneNumber, name }));
    chatServices.createUser({ phoneNumber, name }).then(
      (res) => {
        dispatch(success(res));
        // Refresh users list
        dispatch(getUsers());
      },
      (error) => {
        if (error && error.message) {
          error = error.message;
        }
        dispatch(failure(true, error.toString()));
      }
    );
  };

  function request(data: any) {
    return { type: chatConstants.CREATE_USER, data };
  }
  function success(record: any) {
    return { type: chatConstants.CREATE_USER_SUCCESS, record };
  }
  function failure(error: any, message: any) {
    return { type: chatConstants.CREATE_USER_ERROR, error, message };
  }
}


function createNewUser(agent_no: string, customer_no: string) {
  return (dispatch: Dispatch) => {
    dispatch(request());
    chatServices.createNewUser( agent_no, customer_no ).then(
      (res) => {
        console.log("create chat user resss",res)
        dispatch(success(res));
        // Refresh users list
      },
      (error) => {
        if (error && error.message) {
          error = error.message;
        }
        dispatch(failure(true, error.toString()));
      }
    );
  };

  function request(data?: any) {
    return { type: chatConstants.CREATE_USER, data };
  }
  function success(record: any) {
    return { type: chatConstants.CREATE_USER_SUCCESS, record };
  }
  function failure(error: any, message: any) {
    return { type: chatConstants.CREATE_USER_ERROR, error, message };
  }
}

function getOwnerInfo(userId: string) {
  return (dispatch: Dispatch) => {
    dispatch(request(userId));
    chatServices.getOwnerInfo(userId).then(
      (res) => {
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

  function request(userId: string) {
    return { type: chatConstants.GET_OWNER_INFO, userId };
  }
  function success(record: any) {
    return { type: chatConstants.GET_OWNER_INFO_SUCCESS, record };
  }
  function failure(error: any, message: any) {
    return { type: chatConstants.GET_OWNER_INFO_ERROR, error, message };
  }
}

export const chatActions = {
  getStreamToken,
  initializeChat,
  getUsers,
  getUserChannels,
  selectUser,
  createUser,
  getOwnerInfo,
  createNewUser
};