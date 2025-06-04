// material-ui
import { AlertProps, SnackbarOrigin } from '@mui/material';

// ==============================|| TYPES - SNACKBAR  ||============================== //

export type SnackbarActionProps = {
  payload?: SnackbarProps;
};

export interface SnackbarProps {
  action: boolean;
  open: boolean;
  message: string;
  anchorOrigin: SnackbarOrigin;
  variant: string;
  alert: AlertProps;
  transition: string;
  close: boolean;
  actionButton: boolean;
  dense: boolean;
  maxStack: number;
  iconVariant: string;
}


export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Case {
  case_id: string;
  ownerId: string;
  owner_name: string;
  contactNumber: string;
  status: 'Active' | 'Inactive';
  address?: string;
  filingDate?: string;
  assessedValue?: number;
  amountOwed?: number;
  propertyType?: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Mobile {
  id: string;
  ownerId: string;
  ownerName: string;
  phoneNumber: string;
  status: 'Active' | 'Inactive';
  deviceType?: string;
  lastContact?: string;
}