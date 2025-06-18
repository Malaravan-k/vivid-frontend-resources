import { API } from "aws-amplify";
import { getDefaultParamswithoutlimitkey, buildQuery} from "../../helper/tools";

const constantName = 'call-logs'

function getCallLogs(agentId:string ,paginationParams?:any){
    const queryParams = buildQuery(paginationParams)
    return API.get('vivid-api', `${constantName}?user_number=${agentId}`, getDefaultParamswithoutlimitkey(null,{queryStringParameters : queryParams}))
         .then((response)=>response)
         .catch((error)=>Promise.reject(error))
}

function getCallLogsDetails(user_number:any, owner_number:any) {
  return API.get('vivid-api', `${constantName}/details?user_number=${user_number}&owner_number=${owner_number}`, getDefaultParamswithoutlimitkey(null))
    .then((response) => response)
    .catch((error) => Promise.reject(error));
}


export const callLogsServices = {
  getCallLogs,
  getCallLogsDetails
  
};
