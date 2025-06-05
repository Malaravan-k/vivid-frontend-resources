import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import io from 'socket.io-client';
import { MdMic, MdMicOff } from 'react-icons/md';
import { FiPhone } from 'react-icons/fi';
import { MdPhoneInTalk } from 'react-icons/md';
import { motion } from 'framer-motion';

import { RootState } from '../../store/index';
import { callerActions } from '../../store/actions/caller.action';
import {
  initializeDevice,
  getDevice,
  connectCall,
  disconnectDevice,
} from '../../components/CallerDevice/twilioDevice';
import IncomingCallModal from '../../components/CaseDetails/IncomingCallModal';
import PostCallForm from '../../components/CaseDetails/PostCallForm';
import { formatCallDuration } from '../../utils/formatters';

type PhoneDashboardProps = {
  agentNumber: string | null;
  ownerNumber: string | null;
};

const tokenurl = 'http://100.24.49.133:5000';
const socket = io(tokenurl);

const PhoneDashboard: React.FC<PhoneDashboardProps> = ({ agentNumber, ownerNumber }) => {
  const [status, setStatus] = useState('Disconnected');
  const [call, setCall] = useState<any | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [incomingConn, setIncomingConn] = useState<any | null>(null);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [callerNumber, setCallerNumber] = useState('');
  const [callAccepted, setCallAccepted] = useState(false);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [lastCallerNumber, setLastCallerNumber] = useState('');
  const [isPostCallFormOpen, setIsPostCallFormOpen] = useState(false);
  const [isPostCallAvailable, setIsPostCallAvailable] = useState(false);
  console.log("isIncomingCall", isIncomingCall)
  console.log("incomingConn", incomingConn)
  console.log("status", status)
  // Refs
  const callAcceptedRef = useRef(false);
  const autoRejectTimeout = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const deviceInitializedRef = useRef(false);

  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.sessionReducer);
  const userRole = user?.["custom:role"];
  const agentId = `vivid_agent_${agentNumber?.replace('+', '')}`;

  // Handle incoming call
  const handleIncoming = useCallback((conn: any) => {
    console.log("Incoming call detected:", conn);
    const from = conn.parameters.From || 'Unknown';
    if (autoRejectTimeout.current) {
      clearTimeout(autoRejectTimeout.current);
      autoRejectTimeout.current = null;
    }
    setCallerNumber(from);
    setLastCallerNumber(from);
    setIncomingConn(conn);
    setIsIncomingCall(true);
    setStatus('Incoming call...');
    callAcceptedRef.current = false;

    // Auto-reject after 30 seconds if call not answered
    autoRejectTimeout.current = setTimeout(() => {
      if (!callAcceptedRef.current && incomingConn) {
        console.log("Auto-rejecting call after timeout");
        incomingConn.reject();
        setIsIncomingCall(false);
        setStatus('Missed Call');
        setIncomingConn(null);
      }
    }, 30000);
  }, [incomingConn]);

  // Initialize Twilio device
  const initializeTwilioDevice = useCallback(() => {
    if (deviceInitializedRef.current) return;

    const storedToken = localStorage.getItem('twilioToken');
    if (storedToken) {
      initializeDevice(storedToken, handleIncoming, setStatus, callAcceptedRef);
      deviceInitializedRef.current = true;
    } else {
      console.log("Getting new token from server");
      dispatch(callerActions.getCallerToken(agentId));
    }
  }, [agentId, dispatch, handleIncoming]);

  useEffect(() => {
    if (userRole === 'User' && agentNumber && !deviceInitializedRef.current) {
      initializeTwilioDevice();
    }
    return () => {
      if (autoRejectTimeout.current) {
        clearTimeout(autoRejectTimeout.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [userRole, agentNumber, initializeTwilioDevice]);

  // Handle call timer
  useEffect(() => {
    if (status.toLowerCase() === 'in-progress') {
      if (!callStartTime) {
        setCallStartTime(new Date());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (!['in-progress', 'hold'].includes(status.toLowerCase())) {
        setElapsedTime(0);
        setCallStartTime(null);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [status, callStartTime]);

  // Check if call is completed and enable post call button
  useEffect(() => {
    const completedStatuses = ['completed', 'disconnected', 'call rejected', 'missed call'];
    if (completedStatuses.some(s => status.toLowerCase().includes(s.toLowerCase())) && callAcceptedRef.current) {
      setIsPostCallAvailable(true);
      callAcceptedRef.current = false; // Reset for next call
    } else if (status.toLowerCase() === 'in-progress' || status.toLowerCase() === 'ringing') {
      setIsPostCallAvailable(false);
    }
  }, [status]);

  // Handle socket status updates
  useEffect(() => {
    const handleStatusUpdate = (data: { CallStatus: string }) => {
      console.log("Socket status update:::::", data.CallStatus);
      if (!isIncomingCall || data.CallStatus === 'completed') {
        setStatus(data.CallStatus);
      }
    };

    socket.on('call_status_update', handleStatusUpdate);

    return () => {
      socket.off('call_status_update', handleStatusUpdate);
    };
  }, [isIncomingCall]);

  // Set up call event listeners
  const setupCallEventListeners = (callObj: any) => {
    if (!callObj) return;

    console.log('Setting up call event listeners');

    callObj.on('accept', () => {
      console.log('Call accepted by remote party');
      setStatus('in-progress');
      setCall(callObj);
      callAcceptedRef.current = true;
    });

    callObj.on('disconnect', () => {
      console.log('Call disconnected');
      setStatus('completed');
      setCall(null);
      setIsMuted(false);
    });

    callObj.on('cancel', () => {
      console.log('Call cancelled');
      setStatus('Call cancelled');
      setCall(null);
      setIsMuted(false);
    });

    callObj.on('reject', () => {
      console.log('Call rejected');
      setStatus('Call rejected');
      setCall(null);
      setIsMuted(false);
    });

    callObj.on('error', (error: any) => {
      console.log('Call error:', error);
      setStatus(`Call error: ${error.message}`);
      setCall(null);
      setIsMuted(false);
    });

    callObj.on('ringing', () => {
      console.log('Call is ringing');
      setStatus('ringing');
      setCall(callObj);
    });

    callObj.on('connecting', () => {
      console.log('Call is connecting');
      setStatus('connecting');
      setCall(callObj);
    });
  };

  // Call owner
  const callOwner = () => {
    const storedToken = localStorage.getItem('twilioToken');
    const dev = getDevice(storedToken);

    if (!dev) {
      setStatus("Device error - not initialized");
      return;
    }

    if (!ownerNumber) {
      setStatus("Cannot call: No number provided");
      return;
    }

    setLastCallerNumber(ownerNumber);
    const newCall = connectCall({ To: ownerNumber, agent: agentNumber });

    if (newCall) {
      setStatus('calling');
      setCall(newCall);
      setIsMuted(false);
      // setupCallEventListeners(newCall);
    } else {
      console.error("Failed to initiate call");
      setStatus("Call failed to initiate");
    }
  };
  useEffect(()=>{
    if(status === 'completed'){
     setIsIncomingCall(false)
    }
  },[status])
  // Hang up call
  const hangup = () => {
    if (call) {
      disconnectDevice()
    }
    setStatus('completed')
    setCall(null);
    setIsMuted(false);
    setCallAccepted(false)
  };

  // Accept incoming call
  const acceptCall = () => {
    if (!incomingConn) {
      console.error("No incoming connection to accept");
      return;
    }
    incomingConn.accept();
    setStatus('in-progress');
    setIsIncomingCall(false);
    setCallAccepted(true);
    callAcceptedRef.current = true;
    setCall(incomingConn);
    setIsMuted(false);

    // setupCallEventListeners(incomingConn);

    if (autoRejectTimeout.current) {
      clearTimeout(autoRejectTimeout.current);
      autoRejectTimeout.current = null;
    }
  };

  // Reject incoming call
  const rejectCall = () => {
    if (!incomingConn) {
      console.error("No incoming connection to reject");
      return;
    }

    console.log('Rejecting incoming call');
    incomingConn.reject();
    setStatus('Call rejected');
    setCallAccepted(false);
    callAcceptedRef.current = false;
    setIsIncomingCall(false);
    setIncomingConn(null);
    if (autoRejectTimeout.current) {
      clearTimeout(autoRejectTimeout.current);
      autoRejectTimeout.current = null;
    }
  };

  // Toggle mute
  const handleToggleMute = () => {
    if (!call) {
      console.error('No active call to mute');
      return;
    }

    try {
      const newMuteState = !isMuted;
      console.log('Setting mute state to:', newMuteState);

      if (typeof call.mute === 'function') {
        call.mute(newMuteState);
        setIsMuted(newMuteState);
        console.log('Mute operation completed');
      } else {
        console.error('Mute function not available on call object');
      }
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  };

  // Post Call handlers
  const handlePostCallClick = () => {
    setIsPostCallFormOpen(true);
  };

  const handlePostCallFormClose = () => {
    setIsPostCallFormOpen(false);
  };

  const handlePostCallFormSubmit = (formData: any) => {
    console.log('Post Call Form Data:', formData);
    setIsPostCallAvailable(false);
    setIsPostCallFormOpen(false);
    alert('Post call data saved successfully!');
  };

  const getPhoneIcon = () => {
    const activeCallStatuses = ['in-progress', 'ringing', 'calling', 'connecting', 'initiating'];

    if (activeCallStatuses.includes(status.toLowerCase())) {
      return (
        <motion.div
          className="text-green-600 text-5xl"
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.6, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        >
          <MdPhoneInTalk />
        </motion.div>
      );
    }

    return (
      <div className="text-blue-600 text-5xl">
        <FiPhone />
      </div>
    );
  };

  // Check if call is active (for showing mute button)
  const isCallActive = status.toLowerCase() === 'in-progress';
  const isCallActionable = ['in-progress', 'ringing', 'initiated', 'calling', 'connecting'].includes(status.toLowerCase());

  return (
    <>
      <div className="w-full h-[40vh] mx-auto rounded-2xl bg-slate-50 p-10 relative shadow flex flex-col justify-between font-sans">
        {/* Show incoming call modal */}
        {isIncomingCall && (
          <IncomingCallModal
            callerNumber={callerNumber}
            callAccepted={callAccepted}
            acceptCall={acceptCall}
            rejectCall={rejectCall}
          />
        )}

        {/* Post Call Form Modal */}
        <PostCallForm
          isOpen={isPostCallFormOpen}
          onClose={handlePostCallFormClose}
          onSubmit={handlePostCallFormSubmit}
          callerNumber={lastCallerNumber}
        />

        {/* Header section */}
        <div className='flex items-center'>
          <div className='w-1/2'>
            <div className="font-bold text-xl text-gray-800">Dialer</div>
            <div className="text-gray-700 text-base mt-1">{ownerNumber || 'No number available'}</div>
          </div>

          {/* Call timer */}
          {status.toLowerCase() === 'in-progress' && (
            <div className="w-1/2 flex justify-center items-center">
              <div className="bg-red-500 text-white inline-flex items-center px-3 py-2 rounded-full text-xs space-x-2">
                <span>Recording</span>
                <span>{formatCallDuration(elapsedTime)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Phone icon and status */}
        <div className="flex flex-col items-center justify-center py-4 mb-16">
          <div className="p-4 rounded-full bg-white shadow-md flex items-center justify-center">
            {getPhoneIcon()}
          </div>
          <p className="text-gray-700 text-sm mt-3 font-medium">{status}</p>
        </div>

        {/* Mute button */}
        {isCallActive && (
          <div
            className={`absolute bottom-[100px] left-5 ${isMuted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} 
              cursor-pointer flex items-center space-x-2 p-2 rounded-lg transition-all duration-200`}
            onClick={handleToggleMute}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MdMicOff size={24} /> : <MdMic size={24} />}
            <span className="text-xs font-medium">{isMuted ? 'Muted' : 'Mic On'}</span>
          </div>
        )}

        {/* Call/Hangup button */}
        <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2">
          <button
            className={`${isCallActionable
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-blue-600 hover:bg-blue-700'
              } text-white font-bold py-2 px-6 rounded-xl text-sm min-w-[100px] transition-colors duration-200`}
            onClick={isCallActionable ? hangup : callOwner}
            disabled={!ownerNumber && !isCallActionable}
          >
            {isCallActionable ? 'Hangup' : 'Call'}
          </button>
        </div>
      </div>

      {/* Post Call Button */}
      {isPostCallAvailable && (
        <div className="flex justify-center items-center my-10">
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            <div className='flex flex-col gap-3 mb-5'>
              <p className="text-lg font-semibold text-gray-500">Post-Call Case Entry</p>
              <p className='text-[12px] text-gray-500'>Click here to open the form and enter case information from your recent call.</p>
            </div>
            <button
              onClick={handlePostCallClick}
              className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-full text-sm transition-colors flex items-center space-x-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>Post Call</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PhoneDashboard;