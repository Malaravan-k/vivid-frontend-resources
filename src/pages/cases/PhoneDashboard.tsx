import React, {useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { MdMic, MdMicOff } from 'react-icons/md';
import { FiPhone } from 'react-icons/fi';
import { MdPhoneInTalk } from 'react-icons/md';
import { BiMessageRounded } from 'react-icons/bi';
import { motion } from 'framer-motion';

import { dispatch, RootState } from '../../store/index';
import {
  getDevice,
  connectCall,
  disconnectDevice,
} from '../../utils/twilioDevice';
import PostCallForm from '../../components/CaseDetails/PostCallForm';
import { formatCallDuration } from '../../utils/formatters';
import { chatActions } from '../../store/actions/chat.actions';
import { useNavigate } from 'react-router-dom';
import { postCallActions } from '../../store/actions/postcall.actions';
import { useSocket } from '../../context/SocketContext';
import { useSelector } from 'react-redux';

type PhoneDashboardProps = {
  agentNumber: string | null;
  ownerNumber: string | null;
  caseId:string | null;
};
type TwilioCall = {
  mute: (shouldMute: boolean) => void;
  isMuted?: boolean;
  sendDigits?: (digits: string) => void;
};

const tokenurl = import.meta.env.VITE_APP_CALLING_SYSTEM_URL;
const socket = io(tokenurl);

const PhoneDashboard: React.FC<PhoneDashboardProps> = ({ agentNumber, ownerNumber , caseId}) => {
  const navigate = useNavigate()
  const [status, setStatus] = useState('Disconnected');
  const [call, setCall] = useState<TwilioCall | null>(null);
  const {success} = useSelector((state:RootState)=>state.postCallReducer)
  const [isMuted, setIsMuted] = useState(false);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [lastCallerNumber, setLastCallerNumber] = useState('');
  const [isPostCallFormOpen, setIsPostCallFormOpen] = useState(false);
  const [isPostCallAvailable, setIsPostCallAvailable] = useState(true);
  const {callStatus} = useSocket()
  console.log("success",success)
  useEffect(()=>{
   setStatus(callStatus)
  },[callStatus])
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

   console.log("call::::::",call)
  // Handle socket status updates
  useEffect(() => {
    const handleStatusUpdate = (data: { CallStatus: string }) => {
      console.log("Socket status update:::::", data.CallStatus);
      setStatus(data.CallStatus);
    };

    socket.on('call_status_update', handleStatusUpdate);

    return () => {
      socket.off('call_status_update', handleStatusUpdate);
    };
  }, []);

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
    const completedStatuses = ['completed'];
    if (completedStatuses.some(s => status.toLowerCase().includes(s.toLowerCase()))) {
      setIsPostCallAvailable(true);
    } else if (status.toLowerCase() === 'in-progress' || status.toLowerCase() === 'ringing') {
      setIsPostCallAvailable(false);
    }
  }, [status]);

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
   console.log("newCall",newCall)
    if (newCall) {
      setStatus('calling');
      setCall(newCall);
      setIsMuted(false);
    } else {
      console.error("Failed to initiate call");
      setStatus("Call failed to initiate");
    }
  };

  // Handle message action
  const handleMessage = () => {
    dispatch(chatActions.createNewUser(agentNumber, ownerNumber , navigate))
  };

  // Hang up call
  const hangup = () => {
      disconnectDevice();
    console.log("Hanging UPPPPPPP")
    setStatus('disconnected');
    setCall(null);
    setIsMuted(false);
  };

const handleToggleMute = () => {
  if (!call) {
    console.error('No active call to mute');
    return;
  }

  try {
    const newMuteState = !isMuted;
    console.log('Setting mute state to:', newMuteState);
    
    // Call the mute method on the call object
    call.mute(newMuteState);
    console.log("newMuteState",newMuteState)
    
    // Update the local state
    setIsMuted(newMuteState);
    
    console.log('Mute operation completed');
  } catch (error) {
    console.error('Error toggling mute:', error);
  }
};

  const handlePostCallClick = () => {
    setIsPostCallFormOpen(true);
    dispatch(postCallActions.getPostCallDetails(caseId))
  };

  const handlePostCallFormClose = () => {
    setIsPostCallFormOpen(false);
  };

  const handlePostCallFormSubmit = (formData: any) => {
    console.log('Post Call Form Data:', formData);
    dispatch(postCallActions.updateRecord(caseId,formData))
    // setIsPostCallAvailable(false);
    if(success){
    setIsPostCallFormOpen(false);
    dispatch(postCallActions.resetSuccess())
    }
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
        {/* Call/Hangup and Message buttons */}
        <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2">
          {isCallActionable ? (
            // Show only Hangup button when call is active
            <button
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-xl text-sm min-w-[100px] transition-colors duration-200"
              onClick={hangup}
            >
              Hangup
            </button>
          ) : (
            // Show both Message and Call buttons when no active call
            <div className="flex space-x-3">
              {/* Message Button */}
              <button
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-xl text-sm min-w-[100px] transition-colors duration-200 flex items-center justify-center space-x-2"
                onClick={handleMessage}
                disabled={!ownerNumber}
                title="Send Message"
              >
                <BiMessageRounded size={18} />
                <span>Message</span>
              </button>

              {/* Call Button */}
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl text-sm min-w-[100px] transition-colors duration-200"
                onClick={callOwner}
                disabled={!ownerNumber}
              >
                Call
              </button>
            </div>
          )}
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