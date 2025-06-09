import { ReactNode, useEffect, useCallback, useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/index';
import { initializeDevice, acceptIncomingCall, rejectIncomingCall, disconnectDevice } from '../../components/CallerDevice/twilioDevice';
import IncomingCallModal from '../../components/CaseDetails/IncomingCallModal';
import { callerActions } from '../../store/actions/caller.action';

interface LayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
}

const Layout = ({ children }: LayoutProps) => {
  const { loading } = useAuth();
  const { isLoggedIn, user } = useSelector((state: RootState) => state.sessionReducer);
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [callerNumber, setCallerNumber] = useState('');
  const [callAccepted, setCallAccepted] = useState(false);
  const [showIncomingModal, setShowIncomingModal] = useState(false);
  const [callStatus, setCallStatus] = useState('');
  const callAcceptedRef = useRef(false);
  const autoRejectTimeout = useRef<NodeJS.Timeout | null>(null);
  const dispatch = useDispatch();
  
  const userRole = user?.["custom:role"];
  const agentNumber = user?.["custom:mobileNumber"];
  const agentId = `vivid_agent_${agentNumber?.replace('+', '')}`;

  const handleIncomingCall = useCallback((conn: any) => {
    // Only handle calls if user is logged in and exists
    if (!isLoggedIn || !user) {
      console.log("Ignoring call - user not logged in");
      conn.reject();
      return;
    }

    console.log("Incoming call with parameters:", conn.parameters);
    const from = conn.parameters.From || 'Unknown';
    
    setCallerNumber(from);
    setIncomingCall(conn);
    setShowIncomingModal(true);
    setCallStatus('Incoming call...');
    callAcceptedRef.current = false;

    if (autoRejectTimeout.current) {
      clearTimeout(autoRejectTimeout.current);
    }

    autoRejectTimeout.current = setTimeout(() => {
      if (!callAcceptedRef.current) {
        console.log("Auto-rejecting call after timeout");
        rejectIncomingCall();
        setShowIncomingModal(false);
        setCallStatus('Missed call');
      }
    }, 20000);
  }, [isLoggedIn, user]);

  const initializeTwilioDevice = useCallback(() => {
    if (!isLoggedIn || !user) return;
    const storedToken = localStorage.getItem('twilioToken');
    if (storedToken) {
      console.log("Initializing Twilio device with existing token");
      initializeDevice(storedToken, handleIncomingCall, setCallStatus);
    } else {
      console.log("Requesting new Twilio token");
      dispatch(callerActions.getCallerToken(agentId));
    }
  }, [agentId, dispatch, handleIncomingCall, isLoggedIn, user]);

  const acceptCall = async () => {
    // Only allow accepting calls if user is logged in
    if (!isLoggedIn || !user) return;

    console.log("Attempting to accept call");
    callAcceptedRef.current = true;
    setCallStatus('Connecting...');
    
    if (autoRejectTimeout.current) {
      clearTimeout(autoRejectTimeout.current);
      autoRejectTimeout.current = null;
    }

    const success = acceptIncomingCall();
    if (success) {
      setCallAccepted(true);
      setCallStatus('Call in progress');
    } else {
      setCallStatus('Failed to accept call');
      setShowIncomingModal(false);
      setCallAccepted(false);
    }
  };

  const rejectCall = () => {
    console.log("Rejecting call");
    rejectIncomingCall();
    setShowIncomingModal(false);
    setCallStatus('Call rejected');
    setCallAccepted(false);
    
    if (autoRejectTimeout.current) {
      clearTimeout(autoRejectTimeout.current);
      autoRejectTimeout.current = null;
    }
  };

  const hangupCall = () => {
    console.log("Hanging up call");
    disconnectDevice();
    setShowIncomingModal(false);
    setCallStatus('Call ended');
    setCallAccepted(false);
  };

  useEffect(() => {
    // Only initialize if user is logged in, exists, and has the right role
    if (isLoggedIn && user && userRole === 'User' && agentNumber) {
      console.log("Initializing Twilio for user:", agentNumber);
      initializeTwilioDevice();
    }

    return () => {
      console.log("Cleaning up Twilio device");
      disconnectDevice();
      if (autoRejectTimeout.current) {
        clearTimeout(autoRejectTimeout.current);
      }
    };
  }, [userRole, agentNumber, initializeTwilioDevice, isLoggedIn, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!loading && isLoggedIn && window.location.pathname === "/login") {
    return <Navigate to="/cases" replace />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ECF2FF' }}>
      {(isLoggedIn && user) && <Navbar />}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Only show incoming call modal if user is logged in */}
      {(isLoggedIn && user && showIncomingModal) && (
        <IncomingCallModal 
          callerNumber={callerNumber}
          callAccepted={callAccepted}
          callStatus={callStatus}
          acceptCall={acceptCall}
          rejectCall={rejectCall}
          onHangup={hangupCall}
        />
      )}
    </div>
  );
};

export default Layout;