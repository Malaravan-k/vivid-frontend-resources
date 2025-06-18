import { Dispatch } from "@reduxjs/toolkit";
import { postCallServices } from "../services/postcall.services";
import { postCallConstants } from "../constants/postcall.constants";
import { loaderActions } from "./loader.actions";
import { snackbarActions, snackbarClose } from "../../helper/tools";

function getPostCallDetails(caseId : any) {
  return (dispatch: Dispatch) => {
    dispatch(request(caseId))
    postCallServices.getPostCallDetails(caseId).then(
      (res) => {
        const { response, error, message } = res;
        const postCallDetails = response?.[0] || res;
        console.log("postCallDetails",postCallDetails);
        
        if (error) {
          dispatch(failure(true, message));
        } else {
          dispatch(success(postCallDetails));
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

  function request(caseId: string) {
    return { type: postCallConstants.LOAD_POSTCALL, caseId };
  }
  function success(postCallDetails: any) {
    return { type: postCallConstants.LOAD_POSTCALL_SUCCESS, postCallDetails };
  }
  function failure(error: any, message: any) {
    return { type: postCallConstants.LOAD_POSTCALL_ERROR, error, message };
  }
}

function updateRecord(caseId:any,record: any) {
  return (dispatch: Dispatch) => {
    dispatch(loaderActions.start());
    dispatch(request(record));
    postCallServices.updatePostCallForm(caseId,record).then(
      (res) => {
        const { response, error, message } = res;
        if (error) {
          dispatch(failure(true, message));
          dispatch(loaderActions.end());
          dispatch(snackbarActions(true, message))
          setTimeout(() => {
            dispatch(snackbarClose());
          }, 3000);
        } else {
          dispatch(success(response, message, error));
          dispatch(loaderActions.end());
          dispatch(snackbarActions(false, message))
          setTimeout(() => {
            dispatch(snackbarClose());
          }, 3000);
        }
      },
      (error) => {
        console.log("errror", error)
        if (error && error?.response?.data?.message) {
          error = error?.response?.data?.message
        }
        dispatch(failure(true, error));
        dispatch(loaderActions.end());
        dispatch(snackbarActions(true, error))
        setTimeout(() => {
          dispatch(snackbarClose());
        }, 3000);
      }
    );
  };
  function request(record: any) {
    return { type: postCallConstants.UPDATE_POSTCALL_FORM, record };
  }
  function success(record: any, message: any, error: any) {
    return { type: postCallConstants.UPDATE_POSTCALL_FORM_SUCCESS, record, message, error };
  }
  function failure(error: any, message: any) {
    return { type: postCallConstants.UPDATE_POSTCALL_FORM_ERROR, error, message };
  }
}

function resetSuccess(){
 return {type : postCallConstants.RESET_SUCCESS}
}

export const postCallActions = {
    getPostCallDetails,
    updateRecord,
    resetSuccess
}