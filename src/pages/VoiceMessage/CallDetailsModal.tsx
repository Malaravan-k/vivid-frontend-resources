import React, { useState, useRef, useEffect } from 'react';
import {
  PhoneIncoming,
  PhoneOutgoing,
  Play,
  Pause,
  Volume2,
  Clock,
  Phone,
  User,
  Calendar,
  Loader2,
  X,
  MessageSquare,
  Download,
  ExternalLink
} from 'lucide-react';

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
};

interface CallLogSummary {
  last_activity: string;
  latest_call_status: 'completed' | 'failed' | 'no-answer' | 'missed' | 'busy';
  phone_number: string;
  total_calls: number;
  voicemails: number;
}

type CallDetailsModalProps = {
  callSummary: CallLogSummary | null;
  callDetails: CallLog[];
  isLoading: boolean;
  onClose: () => void;
};

type VoicemailPlayerProps = {
  voicemailUrl: string | null;
  callId: string;
  isRead?: boolean;
  type?: 'recording' | 'voicemail';
};

type CallStatusBadgeProps = {
  status: CallLog['call_status'] | CallLogSummary['latest_call_status'];
};

// Components
const CallStatusBadge: React.FC<CallStatusBadgeProps> = ({ status }) => {
  const statusConfig = {
    completed: { 
      color: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200', 
      label: '✓ Completed',
      icon: '✓'
    },
    failed: { 
      color: 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200', 
      label: '✗ Failed',
      icon: '✗'
    },
    'no-answer': { 
      color: 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-200', 
      label: '○ No Answer',
      icon: '○'
    },
    missed: { 
      color: 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border border-orange-200', 
      label: '⊘ Missed',
      icon: '⊘'
    },
    busy: { 
      color: 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 border border-purple-200', 
      label: '⊗ Busy',
      icon: '⊗'
    }
  };

  const config = statusConfig[status] || statusConfig['no-answer'];

  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${config.color}`}>
      {config.label}
    </span>
  );
};

const VoicemailPlayer: React.FC<VoicemailPlayerProps> = ({
  voicemailUrl ='https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  callId,
  isRead = false,
  type = 'voicemail'
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime]= useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => setIsPlaying(false);
    const handleLoadStart = () => setIsLoading(true);

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
    };
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!voicemailUrl) return null;

  const isRecording = type === 'recording';
  const bgColor = isRecording 
    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200' 
    : (isRead ? 'bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200' : 'bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200');
  
  const buttonColor = isRecording 
    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700' 
    : (isRead ? 'bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700' : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700');
  
  const progressColor = isRecording 
    ? 'bg-gradient-to-r from-blue-600 to-indigo-600' 
    : (isRead ? 'bg-gradient-to-r from-gray-600 to-slate-600' : 'bg-gradient-to-r from-emerald-600 to-teal-600');

  return (
    <div className={`rounded-xl p-4 shadow-sm ${bgColor}`}>
      <audio ref={audioRef} src={voicemailUrl} preload="metadata" />
      
      <div className="flex items-center space-x-4">
        <button
          onClick={togglePlayPause}
          disabled={isLoading}
          className={`flex items-center justify-center w-12 h-12 text-white rounded-full shadow-lg transition-all transform hover:scale-105 ${buttonColor}`}
        >
          { isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </button>

        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {isRecording ? (
                  <Volume2 className="w-5 h-5 text-blue-600" />
                ) : (
                  <MessageSquare className="w-5 h-5 text-emerald-600" />
                )}
                <span className="font-medium text-gray-800">
                  {isRecording ? 'Call Recording' : 'Voicemail'}
                </span>
              </div>
              
              {!isRecording && !isRead && (
                <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2.5 py-1 rounded-full font-semibold shadow-sm">
                  NEW
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <span className="font-medium">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span> 
            </div>
          </div>

          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-2.5 shadow-inner">
              <div
                className={`h-2.5 rounded-full transition-all duration-300 shadow-sm ${progressColor}`}
                style={{
                  width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CallDetailsModal: React.FC<CallDetailsModalProps> = ({
  callSummary,
  callDetails,
  isLoading,
  onClose,
}) => {
  if (!callSummary) return null;

  const formatTime = (seconds: string) => {
    const totalSeconds = parseInt(seconds);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

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
  const sortedCalls = [...callDetails].sort(
    (a, b) => new Date(b.call_started_at).getTime() - new Date(a.call_started_at).getTime()
  );

  const voicemailCount = callDetails.filter(call => call.voicemail_url).length;
  const hasUnreadVoicemail = callDetails.some(call => call.voicemail_url && !call.voicemail_read);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6 text-white">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">
                    {callSummary.phone_number}
                  </h3>
                  <p className="text-blue-100 text-sm">
                    Call History & Details
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{callSummary.total_calls} total calls</span>
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
                <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Loading call details...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedCalls.length > 0 ? (
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-blue-600" />
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
                                  ? 'bg-blue-100 text-blue-600' 
                                  : 'bg-green-100 text-green-600'
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
                              <div className="flex items-center text-sm font-medium text-gray-600">
                                <Clock className="w-4 h-4 mr-1" />
                                {formatTime(call.call_duration)}
                              </div>
                            </div>
                          </div>

                          {/* Call Details Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">From</p>
                              <p className="font-mono text-sm font-medium text-gray-900">{call.from_number}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">To</p>
                              <p className="font-mono text-sm font-medium text-gray-900">{call.to_number}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Call SID</p>
                              <p className="font-mono text-xs text-gray-600 truncate">{call.call_sid}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Case #</p>
                              <p className="font-mono text-sm font-medium text-gray-900">{call.case_number}</p>
                            </div>
                          </div>
                        </div>

                        {/* Recording/Voicemail Section */}
                        {(call.recording_url ) && (
                          <div className="p-6 bg-gray-50">
                            <div className="space-y-4">
                              {call.recording_url && (
                                <VoicemailPlayer
                                  // voicemailUrl={call.recording_url}
                                  callId={call.id}
                                  type="recording"
                                />
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
                    <Phone className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                    <h3 className="text-xl font-bold text-gray-600 mb-2">No Call History</h3>
                    <p className="text-gray-500">No detailed call history available for this number</p>
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

// Demo data for showcase
const demoCallSummary: CallLogSummary = {
  last_activity: "2024-06-18T10:30:00Z",
  latest_call_status: "completed",
  phone_number: "+1 (555) 123-4567",
  total_calls: 5,
  voicemails: 2
};

const demoCallDetails: CallLog[] = [
  {
    id: "1",
    call_sid: "CA1234567890abcdef1234567890abcdef",
    call_type: "incoming",
    call_status: "completed",
    call_duration: "145",
    call_started_at: "2024-06-18T10:30:00Z",
    call_ended_at: "2024-06-18T10:32:25Z",
    from_number: "+1 (555) 123-4567",
    to_number: "+1 (555) 987-6543",
    case_number: "CASE001",
    recording_url: "https://example.com/recording1.mp3",
    voicemail_url: null,
    voicemail_read: true,
    created_at: "2024-06-18T10:30:00Z"
  },
  {
    id: "2",
    call_sid: "CA1234567890abcdef1234567890abcde2",
    call_type: "outgoing",
    call_status: "no-answer",
    call_duration: "0",
    call_started_at: "2024-06-17T15:45:00Z",
    call_ended_at: "2024-06-17T15:45:30Z",
    from_number: "+1 (555) 987-6543",
    to_number: "+1 (555) 123-4567",
    case_number: "CASE002",
    recording_url: null,
    voicemail_url: "https://example.com/voicemail1.mp3",
    voicemail_read: false,
    created_at: "2024-06-17T15:45:00Z"
  }
];

export default CallDetailsModal;