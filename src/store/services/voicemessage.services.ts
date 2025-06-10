const tokenurl = import.meta.env.VITE_APP_CALLING_SYSTEM_URL

async function getAllVoiceMessages(agentId: string) {
  try {
    const res = await fetch(`${tokenurl}/voicemessages?agentId=${agentId}`);
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch voice messages:', error);
    throw error;
  }
}

async function getVoiceMessageDetails(messageId: string) {
  try {
    const res = await fetch(`${tokenurl}/voicemessages/${messageId}`);
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch voice message details:', error);
    throw error;
  }
}

export const voiceMessageServices = {
  getAllVoiceMessages,
  getVoiceMessageDetails
};
