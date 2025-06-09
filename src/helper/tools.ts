import { Dispatch } from "@reduxjs/toolkit";
import { openSnackbar, closeSnackbar } from '../store/reducer/snackbar';
 
// Utility to check if an object is empty
export function isEmpty(object: Record<string, any> = {}): boolean {
  return !(object && Object.keys(object).length);
}
 
// Types for input parameters
interface BuildQueryParams {
  pageSize?: number;
  page?: number;
  delivery_date?: string;
  imageId?: string;
  category_type?: string;
  filter?: Record<string, string | number | boolean>;
  columnfilter?: Record<string, string | number | boolean>;
  queryParams?: Record<string, any>;
}
 
export function snackbarActions(error?:any, message?:any, userInteraction = false) {
  return (dispatch:Dispatch) => {
    if (error) {
      if (userInteraction) {
        dispatch(
          openSnackbar({
            open: true,
            message: message,
            variant: 'userInteraction',
            alert: {
              color: 'error'
            },
            severity: 'error',
            close: true,
            error:true
 
          })
        );
      } else {
        dispatch(
          openSnackbar({
           
            open: true,
            message: message,
            variant: 'alert',
            alert: {
              color: 'error'
            },
            severity: 'error',
            close: true,
            error:true
          })
        );
      }
    } else {
      dispatch(
        openSnackbar({
          open: true,
          message: message,
          variant: 'alert',
          alert: {
            color: 'success'
          },
          severity: 'success',
          close: true,
          error:false
        })
      );
    }
  };
}
 
export function snackbarClose() {
  return (dispatch:Dispatch) => {
    dispatch(closeSnackbar());
  };
}
 
// Main function to build the query object
export const buildQuery = (params: BuildQueryParams): Record<string, any> => {
  const {
    pageSize,
    page,
    delivery_date,
    queryParams,
    imageId,
    category_type,
  } = params;
 
  let { filter, columnfilter } = params;
  let conditional_operator = 'or';
 
  if (columnfilter && !isEmpty(columnfilter)) {
    filter = columnfilter;
    conditional_operator = 'and';
  }
 
  const queryObject: Record<string, any> = {};
 
  if (pageSize !== undefined) queryObject.pageSize = pageSize;
  if (page !== undefined) queryObject.page = page;
  if (delivery_date) queryObject.delivery_date = delivery_date;
  if (imageId) queryObject.imageId = imageId;
  if (category_type) queryObject.category_type = category_type;
 
  if (filter && !isEmpty(filter)) {
    if (typeof filter === 'string') {
      queryObject.filter = filter;
    } else {
      const arr: string[] = [];
      for (const key in filter) {
        if (filter[key] !== undefined && filter[key] !== null && filter[key] !== '') {
          arr.push(`${key}=${filter[key]}`);
        }
      }
      if (arr.length) {
        queryObject.filter = arr.join(',');
        queryObject.conditional_operator = conditional_operator;
      }
    }
  }
 
  if (queryParams && !isEmpty(queryParams)) {
    for (const key in queryParams) {
      if (queryParams[key] !== undefined && queryParams[key] !== null && queryParams[key] !== '') {
        queryObject[key] = queryParams[key];
      }
    }
  }
 
  return { ...queryObject };
};
 
 
export const getDefaultParamswithoutlimitkey = (payload:any, queryString?:any) => {
  return Object.assign({}, payload, queryString);
};