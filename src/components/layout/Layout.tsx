import { ReactNode, useEffect, useCallback, useState, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'
import Navbar from './Navbar';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/index';
import { initializeDevice, acceptIncomingCall, rejectIncomingCall, disconnectDevice } from '../../utils/twilioDevice';
import IncomingCallModal from '../../components/CaseDetails/IncomingCallModal';
import { callerActions } from '../../store/actions/caller.action';
import { useCall } from '../../context/CallContext';
import { userActions } from '../../store/actions/user.actions';
import { casesActions } from '../../store/actions/cases.actions';
import VoicemailNotification from '../ui/VoicemailNotifications'

interface LayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
}

const Layout = ({ children }: LayoutProps) => {
  const { loading } = useAuth();
  const navigate = useNavigate()
  const { isLoggedIn, user } = useSelector((state: RootState) => state.sessionReducer);
  const { primaryMobileNumber } = useSelector((state: RootState) => state.userReducer);
  const {caseId} = useSelector((state: RootState) => state.caseReducer);
  // const [incomingCall, setIncomingCall] = useState<any>(null);
  const [callerNumber, setCallerNumber] = useState('');
  const [callAccepted, setCallAccepted] = useState(false);
  const [showIncomingModal, setShowIncomingModal] = useState(false);
  const [activeCall, setActiveCall] = useState<any>(null);
  const [activeVoicemailNotification, setActiveVoicemailNotification] = useState<string | null>(null);
  const callAcceptedRef = useRef(false);
  const autoRejectTimeout = useRef<NodeJS.Timeout | null>(null);
  const dispatch = useDispatch();
  const { connectSocket, callStatus, setCallStatus, startCall, incomingCall, setIncomingCall, voicemailNotifications, markVoicemailAsRead } = useCall()
  const userId = user?.['custom:userId']
  const userRole = user?.["custom:role"];
  console.log("incomingCall>>>>>>>>",incomingCall);
  
  useEffect(() => {
    if (userRole === 'User' && isLoggedIn) {
      connectSocket()
      dispatch(userActions.getUserDetails(userId))
    }
  }, [isLoggedIn, userRole])
  useEffect(() => {
    const latestVoicemail = voicemailNotifications.find(vm => !vm.isRead);
    if (latestVoicemail && !activeVoicemailNotification) {
      setActiveVoicemailNotification(latestVoicemail.id);
    }
  }, [voicemailNotifications, activeVoicemailNotification]);

  const handleVoicemailDismiss = () => {
    if (activeVoicemailNotification) {
      markVoicemailAsRead(activeVoicemailNotification);
      setActiveVoicemailNotification(null);
    }
  };

  const handleIncomingCall = useCallback((conn: any) => {
    if (!isLoggedIn || !user) {
      console.log("Ignoring call - user not logged in");
      conn.reject();
      return;
    }
    console.log("Incoming call with parameters:", conn.parameters);
    const from = conn.parameters.From || 'Unknown';
    dispatch(casesActions.getCaseId(from.replace(/\D/g, '')))
    setCallerNumber(from.replace(/\D/g, ''));
    setIncomingCall(conn);
    setTimeout(()=>{
      setShowIncomingModal(true);
    },1000)
   
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
      dispatch(callerActions.getCallerToken(primaryMobileNumber));
    }
  }, [primaryMobileNumber, dispatch, handleIncomingCall, isLoggedIn, user]);

const acceptCall = async () => {
  if (!isLoggedIn || !user) return;

  callAcceptedRef.current = true;
  setCallStatus('Connecting...');

  if (autoRejectTimeout.current) {
    clearTimeout(autoRejectTimeout.current);
    autoRejectTimeout.current = null;
  }
  const success = acceptIncomingCall();
  if (success && caseId) {
    setCallAccepted(true);
    setActiveCall(incomingCall);
    
    // Use the CallContext to start the call
    startCall(caseId, callerNumber, incomingCall); // Use actual case ID here
    
    navigate(`/cases/${callerNumber}`, { 
      state: { 
        incoming: true,
        callerNumber,
      } 
    });
    
    setShowIncomingModal(false);
    setCallStatus('in-progress');
  } else {
    setCallStatus('failed');
    setShowIncomingModal(false);
    setCallAccepted(false);
  }
};

  useEffect(() => {
    if (!activeCall) return;

    const handleDisconnect = () => {
      setActiveCall(null);
      setCallStatus('completed');
    };

    const handleMute = (isMuted: boolean) => {
      // Handle mute events if needed
    };

    activeCall.on('disconnect', handleDisconnect);
    activeCall.on('mute', handleMute);

    return () => {
      activeCall.off('disconnect', handleDisconnect);
      activeCall.off('mute', handleMute);
    };
  }, [activeCall]);

  const rejectCall = () => {
    console.log("Rejecting call");
    rejectIncomingCall();
    setShowIncomingModal(false);
    setCallAccepted(false);
    setCallStatus('rejected')
    if (autoRejectTimeout.current) {
      clearTimeout(autoRejectTimeout.current);
      autoRejectTimeout.current = null;
    }
  };

  useEffect(() => {
    // Only initialize if user is logged in, exists, and has the right role
    if (isLoggedIn && user && userRole === 'User' && primaryMobileNumber) {
      console.log("Initializing Twilio for user:", primaryMobileNumber);
      initializeTwilioDevice();
    }

    return () => {
      console.log("Cleaning up Twilio device");
      disconnectDevice();
      if (autoRejectTimeout.current) {
        clearTimeout(autoRejectTimeout.current);
      }
    };
  }, [userRole, primaryMobileNumber, initializeTwilioDevice, isLoggedIn, user]);

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
      <main className=" max-w-screen-2xl xl:min-w-full mx-auto px-4 sm:px-6 lg:px-8 py-20">
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
        />
      )}

      {/* Voicemail Notification */}
      {activeVoicemailNotification && (() => {
        const notification = voicemailNotifications.find(vm => vm.id === activeVoicemailNotification);
        return notification ? (
          <VoicemailNotification
            phoneNumber={notification.phoneNumber}
            onDismiss={handleVoicemailDismiss}
          />
        ) : null;
      })()}
    </div>
  );
};

export default Layout;