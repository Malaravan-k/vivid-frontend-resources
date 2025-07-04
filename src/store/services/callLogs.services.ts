import { API } from "aws-amplify";
import { getDefaultParamswithoutlimitkey, buildQuery} from "../../helper/tools";

const constantName = 'call-logs'

function getCallLogs(){
  // const encodedAgentId = encodeURIComponent(agentId);
  //   const queryParams = buildQuery(paginationParams)
    return API.get('vivid-api', `${constantName}`, getDefaultParamswithoutlimitkey(null))
         .then((response)=>response)
         .catch((error)=>Promise.reject(error))
}

function getCallLogsDetails(owner_number:any) {
  const encodedOwnerId = encodeURIComponent(owner_number);
  return API.get('vivid-api', `${constantName}/details?owner_number=${encodedOwnerId}`, getDefaultParamswithoutlimitkey(null))
    .then((response) => response)
    .catch((error) => Promise.reject(error));
}


export const callLogsServices = {
  getCallLogs,
  getCallLogsDetails
  
};
