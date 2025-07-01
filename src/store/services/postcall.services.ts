import { API } from "aws-amplify";
import { getDefaultParamswithoutlimitkey } from "../../helper/tools";

const constantName = 'post-call'

function getPostCallDetails(caseId: any,ownerNumber:any,ownerName:any) {
    return API.get('vivid-api', `${constantName}?case_no=${caseId}&owner_name=${ownerName}&phone_number=${ownerNumber}`, getDefaultParamswithoutlimitkey(null))
        .then((response) => response)
        .catch((error) => Promise.reject(error));
}
function updatePostCallForm( record: any) {
    return API.post('vivid-api', `post-call`, getDefaultParamswithoutlimitkey(null, { body: record }))
        .then((response) => response)
        .catch((error) => Promise.reject(error));
}


export const postCallServices = {
    getPostCallDetails,
    updatePostCallForm
}