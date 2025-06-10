// Create a new context file (CallContext.tsx)
import { createContext, useContext } from 'react';

export type CallContextType = {
  activeCall: any;
  callStatus: string;
  setActiveCall: (call: any) => void;
  setCallStatus: (status: string) => void;
};

export const CallContext = createContext<CallContextType>({
  activeCall: null,
  callStatus: '',
  setActiveCall: () => {},
  setCallStatus: () => {},
});

export const useCallContext = () => useContext(CallContext);