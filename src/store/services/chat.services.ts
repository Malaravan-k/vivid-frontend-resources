import { API } from 'aws-amplify';
import { getDefaultParamswithoutlimitkey, buildQuery } from '../../helper/tools';

const baseEndpoint = 'message'; // Adjust based on your API gateway

interface SendMessagePayload {
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  message_type?: 'text' | 'image' | 'file';
  attachment_url?: string;
}

interface CreateUserPayload {
  phone_number: string;
  name?: string;
  agent_id: string;
}

interface GetMessagesParams {
  conversation_id: string;
  before_time?: string;
  after_time?: string;
  limit?: number;
}

function getUsers(agentId: string) {
  // const params = { agent_id: agentId };
  // const queryParams = buildQuery(params);
  const encodedAgentId = encodeURIComponent(agentId);
  return API.get('vivid-api', `${baseEndpoint}/user-convos?agent_no=${encodedAgentId}`, getDefaultParamswithoutlimitkey(null))
    .then((response) => response)
    .catch((error) => Promise.reject(error));
}
function getConversation(conversationId: string) {
  return API.get('vivid-api', `${baseEndpoint}/get?conversation_sid=${conversationId}`, getDefaultParamswithoutlimitkey(null))
    .then((response) => response)
    .catch((error) => Promise.reject(error));
}

function sendMessage(payload: SendMessagePayload) {
  return API.post('vivid-api-twilio', `/send-message`, getDefaultParamswithoutlimitkey({
    body: payload
  }))
    .then((response) => response)
    .catch((error) => Promise.reject(error));
}

function createUser(payload: CreateUserPayload) {
  return API.post('vivid-api', `${baseEndpoint}/create`, getDefaultParamswithoutlimitkey({
    body: payload
  }))
    .then((response) => response)
    .catch((error) => Promise.reject(error));
}

export const chatServices = {
  getUsers,
  getConversation,
  sendMessage,
  createUser,
};