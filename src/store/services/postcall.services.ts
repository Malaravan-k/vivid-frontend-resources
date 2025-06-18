import { API } from "aws-amplify";
import { getDefaultParamswithoutlimitkey } from "../../helper/tools";

const constantName = 'post_calls'

function getPostCallDetails(caseId: any) {
    return API.get('vivid-api', `${constantName}?case_id=${caseId}`, getDefaultParamswithoutlimitkey(null))
        .then((response) => response)
        .catch((error) => Promise.reject(error));
}
function updatePostCallForm(case_id: any, record: any) {
    return API.put('vivid-api', `${constantName}?case_id=${case_id}`, getDefaultParamswithoutlimitkey(null, { body: record }))
        .then((response) => response)
        .catch((error) => Promise.reject(error));
}


export const postCallServices = {
    getPostCallDetails,
    updatePostCallForm
}