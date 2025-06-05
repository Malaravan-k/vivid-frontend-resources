import React from 'react';
import { MdCallEnd, MdPhone } from 'react-icons/md';

interface IncomingCallModalProps {
  callerNumber: string;
  callAccepted: boolean;
  callStatus: string;
  acceptCall: () => void;
  rejectCall: () => void;
  onHangup: () => void;
}

const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  callerNumber,
  callAccepted = true,
  callStatus,
  acceptCall,
  rejectCall,
  onHangup
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-1">
            {callAccepted ? 'Ongoing Call' : 'Incoming Call'}
          </h3>
          <p className="text-gray-600 mb-6">{callerNumber}</p>
          
          <div className="mb-6">
            <p className="text-lg font-medium text-blue-600">{callStatus}</p>
          </div>

          <div className="flex justify-center space-x-8">
            {!callAccepted ? (
              <>
                <button
                  onClick={acceptCall}
                  className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4"
                  aria-label="Accept call"
                >
                  <MdPhone size={24} />
                </button>
                <button
                  onClick={rejectCall}
                  className="bg-red-500 hover:bg-red-600 text-white rounded-full p-4"
                  aria-label="Reject call"
                >
                  <MdCallEnd size={24} />
                </button>
              </>
            ) : (
              <button
                onClick={onHangup}
                className="bg-red-500 hover:bg-red-600 text-white rounded-full p-4 mx-auto"
                aria-label="Hang up"
              >
                <MdCallEnd size={24} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;