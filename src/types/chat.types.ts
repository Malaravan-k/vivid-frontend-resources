export interface User {
  id: string;
  name: string;
  phone: string;
  lastMessage?: string;
  timestamp?: string;
  unreadCount?: number;
  online?: boolean;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: string;
  type?: 'text' | 'image' | 'file';
}

export interface OwnerInfo {
  idCase: string;
  address: string;
  filingDate: string;
  assessedValue: string;
  amountOwed: string;
  propertyType: string;
  propertyStatus: string;
  ownerName?: string;
  phoneNumber?: string;
  email?: string;
}

export interface StreamTokenResponse {
  token: string;
  api_key: string;
}

export interface CreateUserRequest {
  phoneNumber: string;
  name?: string;
}