import {API} from 'aws-amplify'
import { getDefaultParamswithoutlimitkey , buildQuery } from '../../helper/tools'

const constantName = 'cases'

function loadRecords(params?: any){
    const queryParams = buildQuery(params)
  return API.get('vivid-api', constantName , getDefaultParamswithoutlimitkey(null ,{queryStringParameters : queryParams}))
  .then((response)=> response)
  .catch((error)=> Promise.reject(error))
}

function loadRecord(id:any) {
  return API.get('vivid-api', `case-details?id=${id}`, getDefaultParamswithoutlimitkey(null))
    .then((response) => response)
    .catch((error) => Promise.reject(error));
}

export const casesServices = {
    loadRecords,
    loadRecord
}