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
  filters?: Record<string, string | number | boolean>;
  columnFilters?: Record<string, string | number | boolean>;
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

  let { filters, columnFilters } = params;
  let conditional_operator = 'or';

  if (columnFilters && !isEmpty(columnFilters)) {
    filters = columnFilters;
    conditional_operator = 'and';
  }

  const queryObject: Record<string, any> = {};

  if (pageSize !== undefined) queryObject.pageSize = pageSize;
  if (page !== undefined) queryObject.page = page;
  if (delivery_date) queryObject.delivery_date = delivery_date;
  if (imageId) queryObject.imageId = imageId;
  if (category_type) queryObject.category_type = category_type;

  if (filters && !isEmpty(filters)) {
    if (typeof filters === 'string') {
      queryObject.filters = filters;
    } else {
      const arr: string[] = [];
      for (const key in filters) {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          arr.push(`${key}=${filters[key]}`);
        }
      }
      if (arr.length) {
        queryObject.filters = arr.join(',');
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