// PhoneDashboard.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import io from 'socket.io-client';
import IncomingCallModal from '../../components/CaseDetails/IncomingCallModal';
import { initializeDevice, getDevice, connectCall, disconnectDevice } from '../../components/CallerDevice/twilioDevice';
import { callerActions } from '../../store/actions/caller.action';
import { RootState } from '../../store/index'
import { MdMic, MdMicOff } from 'react-icons/md';
import { FiPhone } from 'react-icons/fi';
import { MdPhoneInTalk } from 'react-icons/md'; // Looks like ringing
import { motion } from 'framer-motion';

type PhoneDashboardProps = {
  agentNumber: string | null;
  ownerNumber: string | null;
};

const tokenurl = 'http://100.24.49.133:5000';
const socket = io(tokenurl);

const PhoneDashboard: React.FC = () => {
  const [status, setStatus] = useState('Disconnected');
  const [call, setCall] = useState<any | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [incomingConn, setIncomingConn] = useState<any | null>(null);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [callerNumber, setCallerNumber] = useState('');
  const [callAccepted, setCallAccepted] = useState(false);
  const autoRejectTimeout = useRef<NodeJS.Timeout | null>(null);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);


  const ownerNumber = '+918300606225';
  const agentNumber = '+19844597890';
  const agentId = `vivid_agent_${agentNumber.replace('+', '')}`;
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.sessionReducer);
  const userRole = user?.["custom:role"];

  const handleIncoming = useCallback((conn: any) => {
    const from = conn.parameters.From || 'Unknown';
    setCallerNumber(from);
    setIncomingConn(conn);
    setIsIncomingCall(true);
    setStatus('Incoming call...');

    autoRejectTimeout.current = setTimeout(() => {
      if (!callAccepted) {
        conn.reject();
        setIsIncomingCall(false);
        setStatus('Missed Call');
      }
    }, 30000);
  }, [callAccepted]);

  const fetchAndSetup = useCallback(() => {
    const storedToken = localStorage.getItem('twilioToken');
    if (storedToken) {
      initializeDevice(storedToken, handleIncoming, setStatus, callAcceptedRef);
    } else {
      dispatch(callerActions.getCallerToken(agentId));
    }
  }, [agentId, dispatch]);

  useEffect(() => {
    if (userRole === 'User') {
      const deviceCreated = sessionStorage.getItem('twilio_device');
      if (!deviceCreated) {
        fetchAndSetup();
        sessionStorage.setItem('twilio_device', JSON.stringify(true));
      }
    }
  }, []);

  useEffect(() => {
    if (status.toLowerCase() === 'in-progress') {
      setCallStartTime(new Date());

      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setElapsedTime(0);
      setCallStartTime(null);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [status]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };



  useEffect(() => {
    const handleStatusUpdate = (data: { CallStatus: string }) => {
      setStatus(data.CallStatus);
      console.log("Socket status update:", data.CallStatus);
    };
    socket.on('call_status_update', handleStatusUpdate);

    return () => {
      socket.off('call_status_update', handleStatusUpdate);
    };
  }, []);

  // Add event listeners to outgoing calls
  const setupCallEventListeners = (callObj: any) => {
    console.log('Setting up call event listeners for:', callObj);

    callObj.on('accept', () => {
      console.log('Call accepted by remote party');
      setStatus('in-progress');
      // Ensure call object is still set after accept
      setCall(callObj);
    });

    callObj.on('disconnect', () => {
      console.log('Call disconnected');
      setStatus('disconnected');
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
      // Ensure call object is maintained during ringing
      setCall(callObj);
    });

    callObj.on('connecting', () => {
      console.log('Call is connecting');
      setStatus('connecting');
      // Ensure call object is maintained during connecting
      setCall(callObj);
    });

    // Add mute state change listener if available
    if (typeof callObj.on === 'function') {
      callObj.on('mute', (muteState: boolean) => {
        console.log('Mute state changed via event:', muteState);
        setIsMuted(muteState);
      });
    }
  };

  const callOwner = () => {
    const storedToken = localStorage.getItem('twilioToken');
    const dev = getDevice(storedToken);
    if (dev) {
      const newCall = connectCall({ To: ownerNumber, agent: agentNumber });
      console.log("newCall", newCall);
      if (newCall) {
        setStatus('calling');
        setCall(newCall);
        setIsMuted(false); // Reset mute state for new call
        setupCallEventListeners(newCall);
      }
    }
  };

  const hangup = () => {
    if (call) {
      disconnectDevice();
    }
    setStatus('disconnected');
    setCall(null);
    setIsMuted(false);
  };

  const callAcceptedRef = useRef(false);

  const acceptCall = () => {
    if (incomingConn) {
      console.log('Accepting incoming call, setting up call object');
      incomingConn.accept();
      setStatus('in-progress');
      setIsIncomingCall(false);
      setCallAccepted(true);
      callAcceptedRef.current = true;

      // Important: Set the call object to incomingConn for muting to work
      setCall(incomingConn);
      setIsMuted(false);

      // Set up event listeners for incoming call
      setupCallEventListeners(incomingConn);

      if (autoRejectTimeout.current) clearTimeout(autoRejectTimeout.current);

      console.log('Call object set to:', incomingConn);
    }
  };

  const rejectCall = () => {
    if (incomingConn) {
      incomingConn.reject();
      setStatus('Call rejected');
      setCallAccepted(false);
      callAcceptedRef.current = false;
      setIsIncomingCall(false);
      setIncomingConn(null);
      if (autoRejectTimeout.current) clearTimeout(autoRejectTimeout.current);
    }
  };
  const getPhoneIcon = () => {
    const ringingStatuses = ['in-progress', 'ringing', 'calling', 'connecting', 'initiated'];

    if (ringingStatuses.includes(status.toLowerCase())) {
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


  const handleToggleMute = () => {
    console.log('=== MUTE DEBUG INFO ===');
    console.log('Current isMuted state:', isMuted);
    console.log('Call object:', call);
    console.log('Call object type:', typeof call);
    console.log('Status:', status);

    if (call) {
      console.log('Call object methods:', Object.getOwnPropertyNames(call));
      console.log('Call mute method type:', typeof call.mute);
      console.log('Call isMuted method type:', typeof call.isMuted);

      // Try different approaches to mute
      if (typeof call.mute === 'function') {
        try {
          const newMuteState = !isMuted;
          console.log('Attempting to set mute to:', newMuteState);
          call.mute(newMuteState);
          setIsMuted(newMuteState);
          console.log('Mute operation completed successfully');
        } catch (error) {
          console.error('Error calling mute function:', error);
        }
      } else if (typeof call.isMuted === 'function') {
        // Some versions use isMuted() method
        try {
          const currentMute = call.isMuted();
          const newMuteState = !currentMute;
          console.log('Current mute from call.isMuted():', currentMute);
          console.log('Setting new mute state to:', newMuteState);
          call.mute(newMuteState);
          setIsMuted(newMuteState);
        } catch (error) {
          console.error('Error with isMuted approach:', error);
        }
      } else {
        console.error('Neither mute nor isMuted methods are available');
        console.log('Available call properties:', Object.keys(call));
      }
    } else {
      console.error('Call object is null or undefined');
      console.log('Current status:', status);
      console.log('IncomingConn:', incomingConn);

      // Try to use incomingConn if call is null but we have an active incoming call
      if (incomingConn && status.toLowerCase() === 'in-progress') {
        console.log('Trying to use incomingConn for muting');
        console.log('IncomingConn type:', typeof incomingConn);
        console.log('IncomingConn mute method:', typeof incomingConn.mute);

        if (typeof incomingConn.mute === 'function') {
          try {
            const newMuteState = !isMuted;
            incomingConn.mute(newMuteState);
            setIsMuted(newMuteState);
            console.log('Muted using incomingConn');
          } catch (error) {
            console.error('Error muting with incomingConn:', error);
          }
        }
      }
    }
    console.log('=== END MUTE DEBUG ===');
  };

  // Check if call is active (for showing mute button)
  const isCallActive = call && ['in-progress', 'ringing', 'connecting'].includes(status.toLowerCase());

  return (
    <div className="w-full h-[40vh] mx-auto rounded-2xl bg-gray-100 p-5 relative shadow-xl flex flex-col justify-between font-sans">
      {isIncomingCall && (
        <IncomingCallModal
          callerNumber={callerNumber}
          callAccepted={callAccepted}
          acceptCall={acceptCall}
          rejectCall={rejectCall}
        />
      )}
      <div className='flex '>
        <div className='w-1/2'>
          <div className="font-bold text-xl text-gray-800">Dialer</div>
          <div className="text-gray-700 text-base mt-1">{ownerNumber}</div>
        </div>
        {status.toLowerCase() === 'in-progress' && (
          <div className="w-1/2 flex justify-center items-center h-full">
            <div className="bg-red-500 text-white inline-flex items-center px-3 py-2 rounded-full text-xs space-x-2">
              <span>Recording</span>
              <span>{formatTime(elapsedTime)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center justify-center py-4 mb-8">
        <div className="p-4 rounded-full bg-white shadow-md flex items-center justify-center">
          {getPhoneIcon()}
        </div>
        <p className="text-gray-700 text-sm mt-3">{status}</p>
      </div>


      {isCallActive && (
        <div
          className={`absolute bottom-[50px] left-5 text-gray-600 text-base cursor-pointer flex items-center space-x-2 p-2 rounded-lg transition-colors ${isMuted ? 'bg-red-100 text-red-600' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          onClick={handleToggleMute}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <MdMicOff size={24} /> : <MdMic size={24} />}
          <span className="text-xs">{isMuted ? 'Muted' : 'Mic On'}</span>
        </div>
      )}

      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2">
        <button
          className={`${['in-progress', 'ringing', 'initiated', 'calling', 'connecting'].includes(status.toLowerCase())
            ? 'bg-red-600 hover:bg-red-700'
            : 'bg-blue-600 hover:bg-blue-700'
            } text-white font-bold py-2 px-6 rounded-xl text-sm min-w-[100px]`}
          onClick={
            ['in-progress', 'ringing', 'initiated', 'calling', 'connecting'].includes(status.toLowerCase())
              ? hangup
              : callOwner
          }
        >
          {['in-progress', 'ringing', 'initiated', 'calling', 'connecting'].includes(status.toLowerCase())
            ? 'Hangup'
            : 'Call'}
        </button>
      </div>
    </div>
  );
};

export default PhoneDashboard;