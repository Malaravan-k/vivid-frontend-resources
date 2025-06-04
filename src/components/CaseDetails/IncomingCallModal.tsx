import React from 'react';

interface IncomingCallModalProps {
  callerNumber: string;
  callAccepted: boolean;
  acceptCall: () => void;
  rejectCall: () => void;
}

const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  callerNumber,
  callAccepted,
  acceptCall,
  rejectCall,
}) => {
  return (
    <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-xl px-6 py-4 z-[1000] min-w-[280px] text-center animate-slideDown">
      {!callAccepted ? (
        <>
          <p className="my-2 text-lg text-gray-800">📞 Incoming call from: {callerNumber}</p>
          <button
            className="bg-green-600 hover:bg-green-700 text-white font-semibold text-sm rounded-md px-4 py-2 mx-2 mt-2"
            onClick={acceptCall}
          >
            Accept
          </button>
          <button
            className="bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-md px-4 py-2 mx-2 mt-2"
            onClick={rejectCall}
          >
            Reject
          </button>
        </>
      ) : (
        <p className="text-gray-800 text-base">👤 Speaking with: {callerNumber}</p>
      )}
    </div>
  );
};

export default IncomingCallModal;
