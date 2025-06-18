import { NavigateFunction } from "react-router-dom";
import { sessionConstants } from "../constants/session.constants";
import { sessionServices } from "../services/session.services";
import { Dispatch } from "@reduxjs/toolkit";
import { disconnectDevice } from "../../utils/twilioDevice";

import { jwtDecode } from "jwt-decode";
import { snackbarActions,snackbarClose } from "../../helper/tools";


function login(email: string, password: string, navigate: NavigateFunction) {
  return (dispatch: Dispatch) => {
    dispatch(request(email));
    sessionServices.login(email, password).then(
      (response) => {
        console.log("response", response);

        const idToken = response?.AuthenticationResult?.IdToken;

        if (idToken) {
          const decodedToken = jwtDecode(idToken);
          setSession(response);
          dispatch(success(decodedToken));
          navigate("/cases");
          dispatch(snackbarActions(false , "SuccessFully Logged In"))
        } else {
          dispatch(failure(true, "No ID token received"));
          
        }
      },
      (error: any) => {
        if (error && error.message) {
          error = error.message;
        }
        dispatch(failure(true, error.toString()));
        dispatch(snackbarActions(true, error.toString()));
          setTimeout(() => {
            dispatch(snackbarClose());
          }, 3000);
      }
    );
  };

  function request(email: string) {
    return { type: sessionConstants.LOGIN, email };
  }
  function success(user: any) {
    return { type: sessionConstants.LOGIN_SUCCESS, user };
  }
  function failure(error: boolean, message: string) {
    return { type: sessionConstants.LOGIN_ERROR, error, message };
  }
}

function logout(navigate:NavigateFunction) {
  return (dispatch:Dispatch) => {
    sessionServices.logout(navigate);
    setSession(null);
    disconnectDevice();
    dispatch(sessionLogout());
  };
  function sessionLogout() {
    return { type: sessionConstants.LOG_OUT };
  }
}

const setSession = (response : any)=>{
  if(response){
    const serviceToken = response?.AuthenticationResult?.IdToken;
    localStorage.setItem('serviceToken', serviceToken) 
  }else{
    localStorage.clear()
  }
}

export const sessionActions = {
  login,
  logout
}