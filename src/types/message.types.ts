export interface Message {
  id: string;
  text: string;
  senderId: string;
  receiverId: string;
  timestamp: string;
  read: boolean;
}

export interface User {
  id: string;
  name: string;
  phoneNumber: string;
  avatar?: string;
}

export interface Case {
  id: string;
  idNumber: string;
  address: string;
  filingDate: string;
  assessedValue: string;
  amountOwed: string;
  propertyType: string;
  propertyStatus: string;
  ownerId: string;
}

export interface Conversation {
  id: string;
  caseId: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
}