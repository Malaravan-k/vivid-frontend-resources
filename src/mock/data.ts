import { Message, Conversation, Case } from '../types/message.types';

export const mockMessages: Record<string, Message[]> = {
  'conv-1': [
    {
      id: 'msg-1',
      text: 'I wanted to check the status of case',
      senderId: '890-6554-977',
      receiverId: 'user-123',
      timestamp: '2024-03-10T10:00:00Z',
      read: true
    },
    {
      id: 'msg-2',
      text: 'Hello, thank you for reaching out.',
      senderId: 'user-123',
      receiverId: '890-6554-977',
      timestamp: '2024-03-10T10:01:00Z',
      read: true
    },
    {
      id: 'msg-3',
      text: 'Your case (PLC-20453) is currently under review by the verification department.',
      senderId: 'user-123',
      receiverId: '890-6554-977',
      timestamp: '2024-03-10T10:02:00Z',
      read: true
    },
    {
      id: 'msg-4',
      text: 'We cannot proceed until June 5, 2025.',
      senderId: 'user-123',
      receiverId: '890-6554-977',
      timestamp: '2024-03-10T10:02:30Z',
      read: true
    },
    {
      id: 'msg-5',
      text: 'Okay, thank you.',
      senderId: '890-6554-977',
      receiverId: 'user-123',
      timestamp: '2024-03-10T10:03:00Z',
      read: true
    }
  ],
  'conv-2': [
    {
      id: 'msg-6',
      text: 'Hi, I need assistance with my property assessment.',
      senderId: '657-8765-989',
      receiverId: 'user-123',
      timestamp: '2024-03-09T15:00:00Z',
      read: false
    },
    {
      id: 'msg-7',
      text: 'Hello! I\'d be happy to help. Could you please provide your case number?',
      senderId: 'user-123',
      receiverId: '657-8765-989',
      timestamp: '2024-03-09T15:05:00Z',
      read: true
    },
    {
      id: 'msg-8',
      text: 'Yes, it\'s 25SP00002568',
      senderId: '657-8765-989',
      receiverId: 'user-123',
      timestamp: '2024-03-09T15:10:00Z',
      read: false
    }
  ],
  'conv-3': [
    {
      id: 'msg-9',
      text: 'When is my next payment due?',
      senderId: '445-3321-778',
      receiverId: 'user-123',
      timestamp: '2024-03-08T09:00:00Z',
      read: true
    },
    {
      id: 'msg-10',
      text: 'Let me check that for you.',
      senderId: 'user-123',
      receiverId: '445-3321-778',
      timestamp: '2024-03-08T09:05:00Z',
      read: true
    },
    {
      id: 'msg-11',
      text: 'Your next payment of $2,500 is due on April 15, 2024.',
      senderId: 'user-123',
      receiverId: '445-3321-778',
      timestamp: '2024-03-08T09:06:00Z',
      read: true
    }
  ],
  'conv-4': [
    {
      id: 'msg-12',
      text: 'I\'d like to request a property reassessment',
      senderId: '223-9988-445',
      receiverId: 'user-123',
      timestamp: '2024-03-07T14:30:00Z',
      read: false
    }
  ]
};

export const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    caseId: 'case-1',
    participants: ['user-123', '890-6554-977'],
    lastMessage: mockMessages['conv-1'][mockMessages['conv-1'].length - 1],
    unreadCount: 0
  },
  {
    id: 'conv-2',
    caseId: 'case-2',
    participants: ['user-123', '657-8765-989'],
    lastMessage: mockMessages['conv-2'][mockMessages['conv-2'].length - 1],
    unreadCount: 2
  },
  {
    id: 'conv-3',
    caseId: 'case-3',
    participants: ['user-123', '445-3321-778'],
    lastMessage: mockMessages['conv-3'][mockMessages['conv-3'].length - 1],
    unreadCount: 0
  },
  {
    id: 'conv-4',
    caseId: 'case-4',
    participants: ['user-123', '223-9988-445'],
    lastMessage: mockMessages['conv-4'][mockMessages['conv-4'].length - 1],
    unreadCount: 1
  }
];

export const mockCases: Record<string, Case> = {
  'case-1': {
    id: 'case-1',
    idNumber: '25SP00002567',
    address: '669 Cox Rd, Gastonia, NC 28054-3455, USA',
    filingDate: '24.12.2025',
    assessedValue: '$ 56,000',
    amountOwed: '$ 34,000',
    propertyType: 'Single Flat',
    propertyStatus: 'Active',
    ownerId: '890-6554-977'
  },
  'case-2': {
    id: 'case-2',
    idNumber: '25SP00002568',
    address: '123 Main St, Charlotte, NC 28202',
    filingDate: '15.01.2026',
    assessedValue: '$ 78,000',
    amountOwed: '$ 45,000',
    propertyType: 'Duplex',
    propertyStatus: 'Pending',
    ownerId: '657-8765-989'
  },
  'case-3': {
    id: 'case-3',
    idNumber: '25SP00002569',
    address: '456 Park Ave, Raleigh, NC 27601',
    filingDate: '01.02.2026',
    assessedValue: '$ 125,000',
    amountOwed: '$ 82,000',
    propertyType: 'Commercial',
    propertyStatus: 'Active',
    ownerId: '445-3321-778'
  },
  'case-4': {
    id: 'case-4',
    idNumber: '25SP00002570',
    address: '789 Oak St, Durham, NC 27701',
    filingDate: '10.03.2026',
    assessedValue: '$ 95,000',
    amountOwed: '$ 67,000',
    propertyType: 'Single Family',
    propertyStatus: 'Under Review',
    ownerId: '223-9988-445'
  }
};