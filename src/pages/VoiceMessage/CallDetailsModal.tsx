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
  Loader2
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
};

type CallStatusBadgeProps = {
  status: CallLog['call_status'] | CallLogSummary['latest_call_status'];
};

// Components
const CallStatusBadge: React.FC<CallStatusBadgeProps> = ({ status }) => {
  const statusConfig = {
    completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
    failed: { color: 'bg-red-100 text-red-800', label: 'Failed' },
    'no-answer': { color: 'bg-yellow-100 text-yellow-800', label: 'No Answer' },
    missed: { color: 'bg-orange-100 text-orange-800', label: 'Missed' },
    busy: { color: 'bg-purple-100 text-purple-800', label: 'Busy' }
  };

  const config = statusConfig[status] || statusConfig['no-answer'];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
    >
      {config.label}
    </span>
  );
};

const VoicemailPlayer: React.FC<VoicemailPlayerProps> = ({
  voicemailUrl,
  callId,
  isRead = false,
}) => {
  console.log("voicemailUrl",voicemailUrl)
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
      if (!isRead) {
      }
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!voicemailUrl) return null;

  return (
    <div
      className={`flex items-center space-x-3 p-3 rounded-lg ${
        isRead ? 'bg-gray-50' : 'bg-blue-50'
      }`}
    >
      <audio ref={audioRef} src={voicemailUrl} preload="metadata" />
      <button
        onClick={togglePlayPause}
        className={`flex items-center justify-center w-8 h-8 text-white rounded-full hover:opacity-80 transition-colors ${
          isRead ? 'bg-gray-600' : 'bg-blue-600'
        }`}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" />
        )}
      </button>
      <div className="flex-1">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Volume2 className="w-4 h-4" />
          <span>Recording</span>
          {!isRead && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              New
            </span>
          )}
          <span className="text-gray-400">•</span>
          <span>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
          <div
            className={`h-2 rounded-full transition-all ${
              isRead ? 'bg-gray-600' : 'bg-blue-600'
            }`}
            style={{
              width: `${duration ? (currentTime / duration) * 100 : 0}%`,
            }}
          />
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
    return new Date(timestamp).toLocaleString();
  };

  // Sort call details by most recent first
  const sortedCalls = [...callDetails].sort(
    (a, b) => new Date(b.call_started_at).getTime() - new Date(a.call_started_at).getTime()
  );

  const voicemailCount = callDetails.filter(call => call.voicemail_url).length;
  const hasUnreadVoicemail = callDetails.some(call => call.voicemail_url && !call.voicemail_read);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-medium text-gray-900">
                  Call History - {callSummary.phone_number}
                </h3>
                {hasUnreadVoicemail && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    Unread Voicemails
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">
                {callSummary.total_calls} total calls
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-gray-500">Loading call details...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">
                  Current Status
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Latest Call</p>
                    <p className="text-sm text-gray-900">
                      {formatDate(callSummary.last_activity)}
                    </p>
                    <CallStatusBadge status={callSummary.latest_call_status} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Phone Number</p>
                    <p className="text-sm text-gray-900">{callSummary.phone_number}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Total Calls</p>
                    <p className="text-sm text-gray-900">{callSummary.total_calls}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Voicemails</p>
                    <p className="text-sm text-gray-900">
                      {voicemailCount}
                      {hasUnreadVoicemail && (
                        <span className="text-red-600"> (Unread)</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Call Details Section */}
              {sortedCalls.length > 0 ? (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">
                    Call History ({sortedCalls.length} calls)
                  </h4>
                  <div className="space-y-4">
                    {sortedCalls.map((call) => (
                      <div key={call.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            {call.call_type === 'incoming' ? (
                              <PhoneIncoming className="w-6 h-6 text-blue-600" />
                            ) : (
                              <PhoneOutgoing className="w-6 h-6 text-green-600" />
                            )}
                            <div>
                              <p className="font-medium text-gray-900 capitalize">
                                {call.call_type} Call
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatDate(call.call_started_at)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <CallStatusBadge status={call.call_status} />
                            <p className="text-sm text-gray-500 mt-1">
                              <Clock className="w-4 h-4 inline mr-1" />
                              {formatTime(call.call_duration)}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700">From:</p>
                            <p className="text-sm text-gray-900">{call.from_number}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">To:</p>
                            <p className="text-sm text-gray-900">{call.to_number}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Call SID:</p>
                            <p className="text-sm text-gray-900 truncate">{call.call_sid}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Case Number:</p>
                            <p className="text-sm text-gray-900">{call.case_number}</p>
                          </div>
                        </div>

                        {call.recording_url && (
                          <div className="mb-4">
                            <div className='flex gap-3'>
                            <p className="text-md font-medium text-green-700 mb-2">
                              Recording:
                            </p>
                            </div>
                            <VoicemailPlayer
                              voicemailUrl={call.recording_url}
                              callId={call.id}
                              // isRead={call.voicemail_read}
                            />
                          </div>
                        )}

                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Phone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No detailed call history available</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main CallLogsPage Component


export default CallDetailsModal;