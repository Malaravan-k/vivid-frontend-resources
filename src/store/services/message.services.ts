import { Message, Conversation, Case } from '../../types/message.types';
import { mockMessages, mockConversations, mockCases } from '../../mock/data';

async function fetchMessages(conversationId: string): Promise<Message[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockMessages[conversationId] || []);
    }, 500);
  });
}

async function sendMessage(message: Omit<Message, 'id' | 'timestamp' | 'read'>): Promise<Message> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newMessage: Message = {
        ...message,
        id: `msg-${Date.now()}`,
        timestamp: new Date().toISOString(),
        read: false
      };
      resolve(newMessage);
    }, 300);
  });
}

async function fetchConversations(userId: string): Promise<Conversation[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockConversations.filter(conv => conv.participants.includes(userId)));
    }, 500);
  });
}

async function fetchCaseDetails(caseId: string): Promise<Case> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const caseDetails = mockCases[caseId];
      if (caseDetails) {
        resolve(caseDetails);
      } else {
        reject(new Error('Case not found'));
      }
    }, 500);
  });
}

async function markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (mockMessages[conversationId]) {
        mockMessages[conversationId] = mockMessages[conversationId].map(msg => ({
          ...msg,
          read: true
        }));
      }
      resolve();
    }, 300);
  });
}

export const messageServices = {
  fetchMessages,
  sendMessage,
  fetchConversations,
  fetchCaseDetails,
  markMessagesAsRead,
};