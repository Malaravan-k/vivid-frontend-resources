const tokenurl = import.meta.env.VITE_APP_CALLING_SYSTEM_URL

async function getToken(agentId: any) {
  try {
    console.log("agentId", agentId)
    // Encode the agentId to handle special characters like +
    const encodedAgentId = encodeURIComponent(agentId);
    const res = await fetch(`${tokenurl}/twilio-token?agent_number=${encodedAgentId}`);
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch token:', error);
    throw error;
  }
}

export const callerServices = {
  getToken
};