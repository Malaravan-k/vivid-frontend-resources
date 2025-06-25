import { Dispatch } from "@reduxjs/toolkit"
import { casesServices } from "../services/cases.services"
import { casesConstants } from "../constants/cases.constants"

function loadRecords(params?:any) {
    return (dispatch: Dispatch) => {
        dispatch(request())
        casesServices.loadRecords(params).then(
            (res) => {
                const { response, error, message, total, page } = res
                const records = response?.data
                if (error) {
                    dispatch(failure(error, message))
                } else {
                    dispatch(success(records, total, page))
                }
            }, (error) => {
                if (error && error.message) {
                    error = error.message
                }
                dispatch(failure(true, error.message))
            }
        )
    }
    function request() {
        return { type: casesConstants.LOAD_CASES }
    }
    function success(records: any[], total?: number, page?: number) {
        return { type: casesConstants.LOAD_CASES_SUCCESS, records, total, page }
    }
    function failure(error: any, message: any) {
        return { type: casesConstants.LOAD_CASES_SUCCESS, error, message }
    }
}

function loadRecord(id:any) {
  return (dispatch:Dispatch) => {
    dispatch(request(id));
    casesServices.loadRecord(id).then(
      (res) => {
        const { response, error, message } = res;
        if (error) {
          dispatch(failure(true, message));
        } else {
          dispatch(success(response));
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
    return { type: casesConstants.LOAD_CASE, id };
  }
  function success(record:any) {
    return { type: casesConstants.LOAD_CASE_SUCCESS, record };
  }
  function failure(error:any, message:any) {
    return { type: casesConstants.LOAD_CASE_ERROR, error, message };
  }
}

function getCaseId(mobile:any) {
  return (dispatch:Dispatch) => {
    dispatch(request(mobile));
    casesServices.searchCaseId(mobile).then(
      (res) => {
        console.log("response from caseIDDDDDD",res);
        
        const { response, error, message } = res;
        if (error) {
          dispatch(failure(true, message));
        } else {
          dispatch(success(response));
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
  function request(mobile:any) {
    return { type: casesConstants.SEARCH_CASEID, mobile };
  }
  function success(caseId:any) {
    return { type: casesConstants.SEARCH_CASEID_SUCCESS, caseId };
  }
  function failure(error:any, message:any) {
    return { type: casesConstants.SEARCH_CASEID_ERROR, error, message };
  }
}

export const casesActions = {
    loadRecords,
    loadRecord,
    getCaseId
}