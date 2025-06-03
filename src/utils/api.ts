import { Case, Message, Mobile, User } from '../types';

// Mock authentication function
export const authenticateUser = (email: string, password: string): Promise<User | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (email === 'user_1' && password === 'password') {
        resolve({
          id: '1',
          name: 'Jonas',
          email: 'Jonas@gmail.com',
          avatar: '/avatar.png',
        });
      } else {
        resolve(null);
      }
    }, 800);
  });
};

// Mock data for cases
const mockCases: Case[] = Array.from({ length: 50 }, (_, i) => ({
  id: `2SSP0000256${i}`,
  ownerId: `owner-${i % 2 === 0 ? 'john' : 'james'}`,
  ownerName: i % 2 === 0 ? 'John' : 'James',
  contactNumber: '768-0987-0987',
  status: i % 3 === 0 ? 'Inactive' : 'Active',
  address: '969 Cox Rd, Gastonia, NC 28054-3455, USA',
  filingDate: '11.2.2025',
  assessedValue: 50000,
  amountOwed: 46000,
  propertyType: 'Single Flat',
}));

// Mock data for messages
const mockMessages: Message[] = Array.from({ length: 30 }, (_, i) => ({
  id: `msg-${i}`,
  senderId: i % 2 === 0 ? 'owner-john' : 'owner-james',
  senderName: i % 2 === 0 ? 'John' : 'James',
  recipientId: '1',
  recipientName: 'Jonas',
  content: `This is a sample message ${i + 1}. Please check the case details.`,
  timestamp: new Date(Date.now() - i * 3600000).toISOString(),
  read: i > 10,
}));

// Mock data for mobile
const mockMobiles: Mobile[] = Array.from({ length: 40 }, (_, i) => ({
  id: `mobile-${i}`,
  ownerId: `owner-${i % 2 === 0 ? 'john' : 'james'}`,
  ownerName: i % 2 === 0 ? 'John' : 'James',
  phoneNumber: '768-0987-0987',
  status: i % 4 === 0 ? 'Inactive' : 'Active',
  deviceType: i % 3 === 0 ? 'iPhone' : 'Android',
  lastContact: new Date(Date.now() - i * 86400000).toISOString(),
}));

// Paginated data fetching
export const fetchCases = (
  page: number = 1,
  limit: number = 10
): Promise<{ data: Case[]; total: number }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedData = mockCases.slice(start, end);

      resolve({
        data: paginatedData,
        total: mockCases.length,
      });
    }, 500);
  });
};

export const fetchCaseById = (id: string): Promise<Case | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const caseItem = mockCases.find((c) => c.id === id);
      resolve(caseItem || null);
    }, 300);
  });
};

export const fetchMessages = (
  page: number = 1,
  limit: number = 10
): Promise<{ data: Message[]; total: number }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedData = mockMessages.slice(start, end);

      resolve({
        data: paginatedData,
        total: mockMessages.length,
      });
    }, 500);
  });
};

export const fetchMessageById = (id: string): Promise<Message | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const message = mockMessages.find((m) => m.id === id);
      resolve(message || null);
    }, 300);
  });
};

export const fetchMobiles = (
  page: number = 1,
  limit: number = 10
): Promise<{ data: Mobile[]; total: number }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedData = mockMobiles.slice(start, end);

      resolve({
        data: paginatedData,
        total: mockMobiles.length,
      });
    }, 500);
  });
};

export const fetchMobileById = (id: string): Promise<Mobile | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mobile = mockMobiles.find((m) => m.id === id);
      resolve(mobile || null);
    }, 300);
  });
};