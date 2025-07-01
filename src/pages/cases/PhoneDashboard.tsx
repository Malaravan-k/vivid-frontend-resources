import React, { useEffect, useState ,useMemo} from 'react';
import { MdMic, MdMicOff, MdCallEnd } from 'react-icons/md';
import { BiMessageRounded } from 'react-icons/bi';
import { motion } from 'framer-motion';
import { FaPhoneAlt } from 'react-icons/fa';
import { BsPersonFill, BsFilePost } from 'react-icons/bs';
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
import { useCall } from '../../context/CallContext';
import { useSelector } from 'react-redux';

type PhoneDashboardProps = {
  agentNumber: string | null;
  ownerNumber: string | null;
  caseId: string | null;
  selectedPhoneField:string | null;
  ownerName:string | null;
};

const PhoneDashboard: React.FC<PhoneDashboardProps> = ({ agentNumber, ownerNumber, caseId,selectedPhoneField ,ownerName}) => {
  const navigate = useNavigate();
  const { success } = useSelector((state: RootState) => state.postCallReducer);
  
  const {
    callStatus,
    activeCall,
    startCall,
    endCall,
    toggleMute,
    isCurrentCaseInCall,
    connectSocket,
    setActiveCall
  } = useCall();

  const [isPostCallFormOpen, setIsPostCallFormOpen] = useState(false);
  const [lastCallerNumber, setLastCallerNumber] = useState('');
  const [showPostCallButton, setShowPostCallButton] = useState(true);
  const [isInitiatingCall, setIsInitiatingCall] = useState(false); // Add this state
  
  // Check if this case has an active call
const hasActiveCall = useMemo(() => {
  return caseId ? isCurrentCaseInCall(caseId) : false;
}, [caseId, activeCall?.caseId, callStatus]);
  // Get call state - only show if this case has the active call
  const currentCallState = hasActiveCall && activeCall ? activeCall : null;
  const isMuted = currentCallState?.isMuted || false;
  const elapsedTime = currentCallState?.elapsedTime || 0;
  const isPostCallAvailable = currentCallState?.isPostCallAvailable || false;

  useEffect(() => {
    connectSocket();
  }, []);

  // Update last caller number when active call changes
  useEffect(() => {
    if (currentCallState?.ownerNumber) {
      setLastCallerNumber(currentCallState.ownerNumber);
    }
  }, [currentCallState?.ownerNumber]);
  // Handle call status changes to show post-call button
  // useEffect(() => {
  //   if (callStatus.toLowerCase() === 'completed') {
  //     // Show post-call button after a short delay
  //     const timer = setTimeout(() => {
  //       setShowPostCallButton(true);
  //       // setIsPostCallFormOpen(true)
  //     }, 1000);
      
  //     return () => clearTimeout(timer);
  //   } else if (callStatus.toLowerCase() !== 'completed') {
  //     setShowPostCallButton(false);
  //   }
  // }, [callStatus]);

  // Reset isInitiatingCall when call status changes
  useEffect(() => {
    if (callStatus.toLowerCase() !== 'disconnected' && isInitiatingCall) {
      setIsInitiatingCall(false);
    }
  }, [callStatus, isInitiatingCall]);

const callOwner = async () => {
    const storedToken = localStorage.getItem('twilioToken');
    const dev = getDevice(storedToken);
    if (!dev) {
        console.error("Device error - not initialized");
        return;
    }

    if (!ownerNumber || !caseId) {
        console.error("Cannot call: No number or case ID provided");
        return;
    }

    if (activeCall && !isCurrentCaseInCall(caseId)) {
        console.error("Cannot start new call: Another call is already active");
        return;
    }

    setLastCallerNumber(ownerNumber);
    setIsInitiatingCall(true); // Set this before starting the call
    
    try {
        const newCall = await connectCall({ To: ownerNumber, agent: agentNumber });
        
        if (newCall) {
            // The Call2 object from your PromiseResult should now be in newCall
            startCall(caseId, ownerNumber, newCall);
        } else {
            console.error("Failed to initiate call");
            setIsInitiatingCall(false); // Reset on failure
        }
    } catch (error) {
        console.error("Error making call:", error);
        setIsInitiatingCall(false); // Reset on error
    }
};

  const handleMessage = () => {
    dispatch(chatActions.createUser(agentNumber, ownerNumber, navigate));
  };

  const hangup = () => {
    disconnectDevice();
    endCall();
    setActiveCall(null);
    setIsInitiatingCall(false); // Reset when hanging up
  };

  const handleToggleMute = () => {
    toggleMute();
  };

  const handlePostCallClick = () => {
    setIsPostCallFormOpen(true);
    dispatch(postCallActions.getPostCallDetails(caseId,ownerNumber,ownerName));
  };

  const handlePostCallFormClose = () => {
    setIsPostCallFormOpen(false);
  };

  const handlePostCallFormSubmit = (data: any) => {
    console.log("formData",data)
    dispatch(postCallActions.updateRecord( data));
    if (success) {
      setIsPostCallFormOpen(false);
      dispatch(postCallActions.resetSuccess());
    }
  };

  const getStatusColor = () => {
    switch (callStatus.toLowerCase()) {
      case 'in-progress':
        return 'text-green-500';
      case 'ringing':
      case 'calling':
      case 'connecting':
        return 'text-yellow-500';
      case 'completed':
        return 'text-blue-500';
      case 'disconnected':
        return 'text-gray-500';
      default:
        return 'text-blue-500';
    }
  };

// In PhoneDashboard component
const getPhoneIcon = () => {
  const activeCallStatuses = ['in-progress', 'ringing', 'calling', 'connecting', 'initiating'];

  if (hasActiveCall && activeCallStatuses.includes(callStatus.toLowerCase())) {
    return (
      <motion.div
        className="text-green-500 text-5xl"
        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <FaPhoneAlt />
      </motion.div>
    );
  }

  return (
    <div className="text-blue-500 text-5xl">
      <BsPersonFill />
    </div>
  );
};

  const isCallActive = hasActiveCall && callStatus.toLowerCase() === 'in-progress';
  const isCallActionable = hasActiveCall && ['in-progress', 'ringing', 'initiated', 'calling', 'connecting'].includes(callStatus.toLowerCase());
  console.log("activeCall ",activeCall);
  console.log("hasActiveCall",hasActiveCall);
  
  
  
  const getDisplayStatus = () => {
    // If we're initiating a call for this case, show "Calling..."
    if (isInitiatingCall && caseId) {
      return 'Calling...';
    }
    
    // If there's an active call but not for this case, show the other call status
    if (activeCall && !hasActiveCall) {
      return `Another call active (${activeCall.ownerNumber})`;
    }
    return callStatus;
  };

  const getDisplayStatusColor = () => {
    // If we're initiating a call, show yellow
    if (isInitiatingCall) {
      return 'text-yellow-500';
    }
    
    if (activeCall && !hasActiveCall) {
      return 'text-orange-500';
    }
    return getStatusColor();
  };

  return (
    <>
      <div className="w-full max-w-2xl mx-auto rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-6 relative shadow-lg flex flex-col justify-between font-sans border border-blue-100">
        <PostCallForm
          isOpen={isPostCallFormOpen}
          onClose={handlePostCallFormClose}
          onSubmit={handlePostCallFormSubmit}
          callerNumber={ownerNumber}
          caseId = {caseId}
          selectedPhoneField = {selectedPhoneField}
          ownerName = {ownerName}
        />

        <div className='flex items-center justify-between mb-6'>
          <div>
            {/* <h2 className="font-bold text-2xl text-gray-800 mb-1">Call Dashboard</h2> */}
            <div className="text-gray-600 text-md">Agent: {agentNumber}</div>
          </div>

          {isCallActive && (
            <div className="flex flex-col items-end">
              <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow">
                <span>Recording • {formatCallDuration(elapsedTime)}</span>
              </div>
            </div>
          )}
        </div>

        <div className='mx-auto'>
          <div className="bg-white rounded-2xl py-4 px-20 mb-2 shadow-sm border border-gray-100">
            <div className="text-center">
              <motion.div
                key={ownerNumber}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.6 }}
                className="text-2xl font-bold text-blue-700"
              >
                {ownerNumber || 'Select a number'}
              </motion.div>
              <motion.div
                key={getDisplayStatus()}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className={`mt-1 text-md font-medium ${getDisplayStatusColor()}`}
              >
                {getDisplayStatus()}
              </motion.div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-4 mb-16">
          <div className="p-4 rounded-full bg-white shadow-lg flex items-center justify-center border-2 border-blue-100">
            {getPhoneIcon()}
          </div>
        </div>

        {isCallActive && (
          <motion.div
            className={`absolute bottom-24 left-6 ${isMuted ? 'bg-red-100 text-red-600' : 'bg-white text-blue-600'} 
              cursor-pointer flex items-center space-x-2 p-3 rounded-full shadow-md transition-all duration-200 border border-gray-200`}
            onClick={handleToggleMute}
            title={isMuted ? 'Unmute' : 'Mute'}
            whileTap={{ scale: 0.9 }}
          >
            {isMuted ? <MdMicOff size={20} /> : <MdMic size={20} />}
          </motion.div>
        )}

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 w-full px-6">
          {isCallActionable ? (
            <motion.button
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-full text-sm mx-auto shadow-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              onClick={hangup}
              whileTap={{ scale: 0.95 }}
            >
              <MdCallEnd size={18} />
              <span>End Call</span>
            </motion.button>
          ) : (
            <div className="flex space-x-4 justify-center">
              <motion.button
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-4 rounded-full text-sm min-w-[100px] transition-colors duration-200 flex items-center justify-center space-x-2 shadow-lg"
                onClick={handleMessage}
                disabled={!ownerNumber}
                title="Send Message"
                whileTap={{ scale: 0.95 }}
              >
                <BiMessageRounded size={18} />
                <span>Message</span>
              </motion.button>

              <motion.button
                className={`${
                  (activeCall && !hasActiveCall && !isInitiatingCall) || isInitiatingCall
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-500 hover:bg-green-600'
                } text-white font-bold py-3 px-6 rounded-full text-sm min-w-[100px] transition-colors duration-200 flex items-center justify-center space-x-2 shadow-lg`}
                onClick={callOwner}
                disabled={!ownerNumber || (activeCall && !hasActiveCall && !isInitiatingCall) || isInitiatingCall}
                whileTap={{ scale: 0.95 }}
                title={
                  isInitiatingCall 
                    ? 'Initiating call...' 
                    : (activeCall && !hasActiveCall) 
                      ? 'Another call is active' 
                      : 'Start call'
                }
              >
                <FaPhoneAlt size={16} />
                <span>{isInitiatingCall ? 'Calling...' : 'Call'}</span>
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* Show post-call button when call is completed and for the current case */}
      {(showPostCallButton || (hasActiveCall && isPostCallAvailable)) && (
        <motion.div
          className="flex justify-center items-center mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col items-center justify-center text-center space-y-2 max-w-md w-full">
            <div className='flex flex-col gap-2 mb-4'>
              <p className="text-lg font-semibold text-gray-700">Post-Call Actions</p>
              <p className='text-sm text-gray-500 px-4'>Complete the post-call form to document case information from your recent conversation.</p>
            </div>
            <motion.button
              onClick={handlePostCallClick}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-full text-sm transition-colors flex items-center space-x-2 shadow-lg"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <BsFilePost size={16} />
              <span>Complete Post-Call Form</span>
            </motion.button>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default PhoneDashboard;