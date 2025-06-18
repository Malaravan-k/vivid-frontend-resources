import {API} from 'aws-amplify'
import { getDefaultParamswithoutlimitkey , buildQuery } from '../../helper/tools'

const constantName = 'users'

function loadRecords(params?: any){
    const queryParams = buildQuery(params)
  return API.get('vivid-api', constantName , getDefaultParamswithoutlimitkey(null ,{queryStringParameters : queryParams}))
  .then((response)=> response)
  .catch((error)=> Promise.reject(error))
}

function AddUser(payload:any){
 return API.post('vivid-api', constantName , getDefaultParamswithoutlimitkey({body : payload}))
 .then((response)=> response)
 .catch((error)=>Promise.reject(error))
}

function updateRecord(record: any) {
  const { user_id, ...payload } = record || {}; 

  return API.put(
    'vivid-api',
    `${constantName}/?userId=${user_id}`,
    getDefaultParamswithoutlimitkey({
      body: { ...payload } 
    })
  )
  .then((response) => response)
  .catch((error) => Promise.reject(error));
}


function deleteRecord(id:string) {
  let queryParams = { softDelete: 'True' };
  return API.del('vivid-api', `${constantName}?userId=${id}`, getDefaultParamswithoutlimitkey(null, { queryStringParameters: queryParams }))
    .then((response) => response)
    .catch((error) => Promise.reject(error));
}

function syncTwilioNumbers(){
  return API.get('vivid-api',`sync-twilio`, getDefaultParamswithoutlimitkey(null))
  .then((response)=>response)
  .catch((error)=>Promise.reject(error))
}

function fetchTwilioNumbers(){
  console.log("Vanakkam")
  return API.get('vivid-api',`mobile-numbers`, getDefaultParamswithoutlimitkey(null))
  .then((response)=>response)
  .catch((error)=>Promise.reject(error))
}

function getUserDetails(userId:string){
  return API.get('vivid-api',`${constantName}/details?user_id=${userId}`, getDefaultParamswithoutlimitkey(null))
  .then((response)=>response)
  .catch((error)=>Promise.reject(error))
}

export const userServices = {
  AddUser,
  loadRecords,
  updateRecord,
  deleteRecord,
  syncTwilioNumbers,
  fetchTwilioNumbers,
  getUserDetails
};
