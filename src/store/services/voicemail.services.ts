import { API } from "aws-amplify";
import { getDefaultParamswithoutlimitkey, buildQuery} from "../../helper/tools";

const constantName = 'voicemails'

function getAllVoiceMails(){
    return API.get('vivid-api', `${constantName}`, getDefaultParamswithoutlimitkey(null))
         .then((response)=>response)
         .catch((error)=>Promise.reject(error))
}

function getVoiceMailDetails(owner_number:any) {
  const encodedOwnerNumber = encodeURIComponent(owner_number)
  return API.get('vivid-api', `${constantName}/details?owner_number=${encodedOwnerNumber}`, getDefaultParamswithoutlimitkey(null))
    .then((response) => response)
    .catch((error) => Promise.reject(error));
}

function updateVoicemailRead(id:string){
  return API.put('vivid-api',`${constantName}?call_log_id=${id}`, getDefaultParamswithoutlimitkey(null))
   .then((response) => response)
    .catch((error) => Promise.reject(error));
}

export const voiceMailServices = {
  getAllVoiceMails,
  getVoiceMailDetails,
  updateVoicemailRead
};

