import React, { useEffect, useState } from 'react';
import { X, Voicemail, Phone } from 'lucide-react';

interface VoicemailNotificationProps {
  phoneNumber: string;
  onDismiss: () => void;
  autoHide?: boolean;
  duration?: number;
}

const VoicemailNotification: React.FC<VoicemailNotificationProps> = ({
  phoneNumber,
  onDismiss,
  autoHide = true,
  duration = 10000
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Show notification with slight delay for smooth animation
    const showTimer = setTimeout(() => setIsVisible(true), 100);

    // Auto-hide after duration
    let hideTimer: NodeJS.Timeout;
    if (autoHide) {
      hideTimer = setTimeout(() => {
        handleDismiss();
      }, duration);
    }

    return () => {
      clearTimeout(showTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [autoHide, duration]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss();
    }, 300); // Match exit animation duration
  };

  const formatPhoneNumber = (number: string) => {
    const cleaned = number.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return number;
  };

  return (
    <div
      className={`fixed top-20 right-4 z-50 transform transition-all duration-300 ease-out ${
        isVisible && !isExiting
          ? 'translate-x-0 opacity-100 scale-100'
          : 'translate-x-full opacity-0 scale-95'
      }`}
    >
      <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-4 min-w-80 max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
              <Voicemail className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 text-sm">New Voicemail</h3>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-150 p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center border border-green-200">
            <Phone className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="text-gray-600 text-sm">
              You received a voicemail from
            </p>
            <p className="font-semibold text-gray-900 text-base">
              {formatPhoneNumber(phoneNumber)}
            </p>
          </div>
        </div>


        {/* Action hint */}
        <div className="mt-2 text-xs text-gray-500 text-center">
          Check your voicemails tab for details
        </div>
      </div>

      <style jsx>{`
        @keyframes shrink {
          from {
            transform: scaleX(1);
          }
          to {
            transform: scaleX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default VoicemailNotification;