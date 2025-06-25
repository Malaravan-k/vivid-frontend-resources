import {API} from 'aws-amplify'
import { getDefaultParamswithoutlimitkey , buildQuery } from '../../helper/tools'

const constantName = 'cases'

function loadRecords(params?: any){
    const queryParams = buildQuery(params)
  return API.get('vivid-api', constantName , getDefaultParamswithoutlimitkey(null ,{queryStringParameters : queryParams}))
  .then((response)=> response)
  .catch((error)=> Promise.reject(error))
}

function loadRecord(id:any , useMobile = false){
  const endParam = useMobile ? 'mobile' : 'id'
  return API.get('vivid-api', `case-details?${endParam}=${id}`, getDefaultParamswithoutlimitkey(null))
    .then((response) => response)
    .catch((error) => Promise.reject(error));
}
function searchCaseId(mobile:any){
  return API.get('vivid-api',`case-details/get-case-number?mobile_number=${mobile}`,getDefaultParamswithoutlimitkey(null))
  .then((response)=>response)
  .catch((error)=>Promise.reject(error))
}

export const casesServices = {
    loadRecords,
    loadRecord,
    searchCaseId
}