import React from 'react';
import {
  PhoneIncoming,
  PhoneOutgoing,
  Clock,
  Phone,
  Calendar,
  Loader2,
  X,
  MessageSquare,
  CheckCircle,
  XCircle,
  PhoneMissed,
  AlertCircle,
} from 'lucide-react';
import VoicemailPlayer from '../ui/Voicemailplayer';

// Types
type CallLog = {
  id: string;
  call_sid: string;
  call_type: 'incoming' | 'outgoing';
  call_status: 'completed' | 'failed' | 'no-answer' | 'missed' | 'busy';
  call_duration: string;
  call_started_at: string;
  call_ended_at: string;
  from_number: string;
  to_number: string;
  case_number: string;
  recording_url: string | null;
  voicemail_url: string | null;
  voicemail_read: boolean;
  created_at: string;
  owner_number: string;
};

interface VoiceMailSummary {
  last_activity: string;
  latest_call_status: 'completed' | 'failed' | 'no-answer' | 'missed' | 'busy';
  owner_number: string;
  total_calls: number;
  voicemails: number;
}

type VoiceMailDetailsModalProps = {
  voiceMailSummary: VoiceMailSummary | null;
  voiceMailDetails: CallLog[];
  isLoading: boolean;
  onClose: () => void;
  onMarkAsRead?: (callId: string) => void;
};

type CallStatusBadgeProps = {
  status: CallLog['call_status'] | VoiceMailSummary['latest_call_status'];
};

// Components
const CallStatusBadge: React.FC<CallStatusBadgeProps> = ({ status }) => {
  const statusConfig = {
    completed: { 
      color: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200', 
      label: '✓ Completed',
      icon: CheckCircle
    },
    failed: { 
      color: 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200', 
      label: '✗ Failed',
      icon: XCircle
    },
    'no-answer': { 
      color: 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-200', 
      label: '○ No Answer',
      icon: PhoneMissed
    },
    missed: { 
      color: 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border border-orange-200', 
      label: '⊘ Missed',
      icon: PhoneMissed
    },
    busy: { 
      color: 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 border border-purple-200', 
      label: '⊗ Busy',
      icon: AlertCircle
    }
  };

  const config = statusConfig[status] || statusConfig['no-answer'];

  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${config.color}`}>
      {config.label}
    </span>
  );
};

const VoiceMailDetailsModal: React.FC<VoiceMailDetailsModalProps> = ({
  voiceMailSummary,
  voiceMailDetails,
  isLoading,
  onClose,
  onMarkAsRead
}) => {
  if (!voiceMailSummary) return null;

  const formatDate = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  // Sort call details by most recent first
  const sortedCalls = [...voiceMailDetails].sort(
    (a, b) => new Date(b.call_started_at).getTime() - new Date(a.call_started_at).getTime()
  );

  const voicemailCount = voiceMailDetails.filter(call => call.voicemail_url).length;
  const hasUnreadVoicemail = voiceMailDetails.some(call => call.voicemail_url && !call.voicemail_read);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r  from-blue-600 to-indigo-700 px-8 py-6 text-white">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">
                    {voiceMailSummary.owner_number}
                  </h3>
                  <p className="text-emerald-100 text-sm">
                    Voicemail History & Details
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{voiceMailSummary.total_calls} total calls</span>
                </div>
                {voicemailCount > 0 && (
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>{voicemailCount} voicemails</span>
                  </div>
                )}
                {hasUnreadVoicemail && (
                  <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                    Unread Messages
                  </span>
                )}
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-140px)] bg-gray-50">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Loading voicemail details...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedCalls.length > 0 ? (
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-emerald-600" />
                    <span>Recent Activity ({sortedCalls.length} calls)</span>
                  </h4>
                  
                  <div className="space-y-4">
                    {sortedCalls.map((call, index) => (
                      <div key={call.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
                        {/* Call Header */}
                        <div className="p-6 border-b border-gray-100">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-4">
                              <div className={`p-3 rounded-xl ${
                                call.call_type === 'incoming' 
                                  ? 'bg-emerald-100 text-emerald-600' 
                                  : 'bg-teal-100 text-teal-600'
                              }`}>
                                {call.call_type === 'incoming' ? (
                                  <PhoneIncoming className="w-6 h-6" />
                                ) : (
                                  <PhoneOutgoing className="w-6 h-6" />
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 text-lg capitalize">
                                  {call.call_type} Call
                                </p>
                                <p className="text-gray-500 font-medium">
                                  {formatDate(call.call_started_at)}
                                </p>
                              </div>
                            </div>
                            
                            <div className="text-right space-y-2">
                              <CallStatusBadge status={call.call_status} />
                            </div>
                          </div>

                          {/* Call Details Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">From</p>
                              <p className="font-mono text-sm font-medium text-gray-900">{call.owner_number}</p>
                            </div>
                            <div className='col-span-3'>
                              {(call.recording_url || call.voicemail_url) && (
                                <div className="space-y-4">
                                  {call.recording_url && (
                                    <VoicemailPlayer
                                      voicemailUrl={call.recording_url}
                                      callId={call.id}
                                      type="recording"
                                    />
                                  )}
                                  {call.voicemail_url && (
                                    <VoicemailPlayer
                                      voicemailUrl={call.voicemail_url}
                                      callId={call.id}
                                      isRead={call.voicemail_read}
                                      type="voicemail"
                                      onMarkAsRead={() => onMarkAsRead?.(call.id)}
                                    />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                    <h3 className="text-xl font-bold text-gray-600 mb-2">No Voicemail History</h3>
                    <p className="text-gray-500">No detailed voicemail history available for this number</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceMailDetailsModal;