import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSelector } from 'react-redux';
import io, { Socket } from 'socket.io-client';
import { RootState } from '../store/index';

interface CallState {
  status: string;
  isMuted: boolean;
  callStartTime: Date | null;
  elapsedTime: number;
  ownerNumber: string | null;
  caseId: string | null;
  isPostCallAvailable: boolean;
  call: any | null;
}

interface CallContextType {
  socket: Socket | null;
  isConnected: boolean;
  activeCall: CallState | null;
  callStatus: string;
  incomingCall:any

  // Call management methods
  startCall: (caseId: string, ownerNumber: string, call: any) => void;
  setIncomingCall: () => void;
  endCall: () => void;
  updateCallStatus: (status: string) => void;
  toggleMute: () => void;
  setCall: (call: any) => void;
  setCallStatus: (status: string) => void;
  setActiveCall: (call: any) => void;

  // Check if current case has active call
  isCurrentCaseInCall: (caseId: string) => boolean;

  // Socket methods
  connectSocket: () => void;
  disconnectSocket: () => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

interface CallProviderProps {
  children: ReactNode;
}

const tokenurl = import.meta.env.VITE_APP_CALLING_SYSTEM_URL;

const initialCallState: CallState = {
  status: 'Disconnected',
  isMuted: false,
  callStartTime: null,
  elapsedTime: 0,
  ownerNumber: null,
  caseId: null,
  isPostCallAvailable: false,
  call: null,
};

export const CallProvider: React.FC<CallProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [callStatus, setCallStatus] = useState('Disconnected');
  const [incomingCall,setIncomingCall] = useState(null)
  const [isConnected, setIsConnected] = useState(false);
  const [activeCall, setActiveCall] = useState<CallState | null>(null);
  console.log("incoming call from context",incomingCall);
  

  const { user, isLoggedIn } = useSelector((state: RootState) => state.sessionReducer);
  const { agentId } = useSelector((state: RootState) => state.callerReducer);
  console.log("agentId::::",agentId);
  
  const agentNumber = agentId?.replace(/\s+/g, '');
  console.log("activeCall111((@)(!*!(90329013", activeCall);

  // Timer ref for call duration
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Disconnect socket when user logs out
  useEffect(() => {
    if (!isLoggedIn) {
      disconnectSocket();
      setActiveCall(null);
      setCallStatus('Disconnected');
    }
  }, [isLoggedIn]);

  // Sync callStatus with activeCall status
  useEffect(() => {
    if (activeCall) {
      setCallStatus(activeCall.status);
    } else {
      setCallStatus('Disconnected');
    }
  }, [activeCall?.status]);

  // Handle call timer
  useEffect(() => {
    if (callStatus.toLowerCase() === 'in-progress' && activeCall) {
      if (!activeCall.callStartTime) {
        setActiveCall(prev => prev ? {
          ...prev,
          callStartTime: new Date()
        } : null);
      }

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      timerRef.current = setInterval(() => {
        setActiveCall(prev => prev ? {
          ...prev,
          elapsedTime: prev.elapsedTime + 1
        } : null);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (activeCall && !['in-progress', 'hold'].includes(callStatus.toLowerCase())) {
        if (callStatus.toLowerCase() === 'completed') {
          setActiveCall(prev => prev ? {
            ...prev,
            elapsedTime: 0,
            callStartTime: null,
            isPostCallAvailable: true,
          } : null);
        } else {
          setActiveCall(prev => prev ? {
            ...prev,
            elapsedTime: 0,
            callStartTime: null
          } : null);
        }
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [callStatus, activeCall?.callStartTime]);

  const connectSocket = () => {
    if (socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    const newSocket = io(tokenurl);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      newSocket.emit('join', { "agent_id": agentNumber });
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('call_status_update', (data: { CallStatus: string }) => {
      console.log('Socket status update:', data.CallStatus);
      updateCallStatus(data.CallStatus);
    });
    newSocket.on('voicemail_update',(data)=>{
    console.log('Voicemail socket is listening',data)
    })

    newSocket.on('new_message', (messageData) => {
    console.log('This is from my Context  socket for message', messageData);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });
  };

  const disconnectSocket = () => {
    console.log("Disconnecting the socket");
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  };

  const startCall = (caseId: string, ownerNumber: string, call: any) => {
    const newCallState = {
      ...initialCallState,
      status: callStatus || 'in-progress', // Use current call status for incoming calls
      ownerNumber,
      caseId,
      call,
    };
    setActiveCall(newCallState);
    setCallStatus(newCallState.status);
  };

  const endCall = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setActiveCall(null);
    setCallStatus('Disconnected');
  };

  const updateCallStatus = (status: string) => {
    setCallStatus(status);

    if (!activeCall) return;

    setActiveCall(prev => prev ? {
      ...prev,
      status,
      isPostCallAvailable: ['completed'].some(s => status.toLowerCase().includes(s.toLowerCase()))
    } : null);
  };

  const toggleMute = () => {
    if (!activeCall?.call) {
      console.error('No active call to mute');
      return;
    }

    try {
      const newMuteState = !activeCall.isMuted;
      activeCall.call.mute(newMuteState);
      setActiveCall(prev => prev ? {
        ...prev,
        isMuted: newMuteState
      } : null);
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  };

  const setCall = (call: any) => {
    setActiveCall(prev => prev ? {
      ...prev,
      call
    } : null);
  };

  const isCurrentCaseInCall = (caseId: string): boolean => {
    return activeCall?.caseId === caseId &&
      ['in-progress', 'ringing', 'calling', 'connecting', 'initiated','completed'].includes(callStatus.toLowerCase());
  };

  const value: CallContextType = {
    socket,
    isConnected,
    activeCall,
    callStatus,
    startCall,
    endCall,
    updateCallStatus,
    toggleMute,
    setActiveCall,
    setCall,
    setCallStatus,
    isCurrentCaseInCall,
    connectSocket,
    disconnectSocket,
    incomingCall,
    setIncomingCall
  };

  return (
    <CallContext.Provider value={value}>
      {children}
    </CallContext.Provider>
  );
};

// Custom hook to use call context
export const useCall = (): CallContextType => {
  const context = useContext(CallContext);
  if (context === undefined) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};