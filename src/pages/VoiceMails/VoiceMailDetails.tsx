import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  Clock,
  ChevronLeft,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/index';
import { voiceMailsActions } from '../../store/actions/voicemail.actions';

type CallStatus = 'completed' | 'failed' | 'no-answer';

type Call = {
  id: string;
  call_sid: string;
  call_type: 'incoming' | 'outgoing';
  call_status: CallStatus;
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

type VoicemailPlayerProps = {
  voicemailUrl: string | null;
  callId: string;
  isRead: boolean;
  onMarkAsRead: () => void;
};

type CallStatusBadgeProps = {
  status: CallStatus;
};

const CallStatusBadge: React.FC<CallStatusBadgeProps> = ({ status }) => {
  const statusConfig = {
    completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
    failed: { color: 'bg-red-100 text-red-800', label: 'Failed' },
    'no-answer': { color: 'bg-yellow-100 text-yellow-800', label: 'No Answer' },
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
  onMarkAsRead,
}) => {
  const dispatch = useDispatch();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  const [hasMarkedAsRead, setHasMarkedAsRead] = useState(false);
  const [playStartTime, setPlayStartTime] = useState<number | null>(null);
  const [totalPlayTime, setTotalPlayTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const playTimeRef = useRef(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !voicemailUrl) return;

    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      if (playStartTime) {
        const sessionPlayTime = Date.now() - playStartTime;
        playTimeRef.current += sessionPlayTime;
        setTotalPlayTime(playTimeRef.current);
        setPlayStartTime(null);
      }
    };
    const handlePlay = () => {
      if (!hasStartedPlaying) {
        setHasStartedPlaying(true);
      }
      setPlayStartTime(Date.now());
    };
    const handlePause = () => {
      if (playStartTime) {
        const sessionPlayTime = Date.now() - playStartTime;
        playTimeRef.current += sessionPlayTime;
        setTotalPlayTime(playTimeRef.current);
        setPlayStartTime(null);
      }
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [hasStartedPlaying, voicemailUrl, playStartTime]);

  // Check if user has listened for 10 seconds and mark as read
  useEffect(() => {
    if (!isRead && !hasMarkedAsRead && totalPlayTime >= 10000) { // 10000ms = 10 seconds
      setHasMarkedAsRead(true);
      onMarkAsRead();
      // Dispatch the action to update voicemail status
      dispatch(voiceMailsActions.updateVoicemailRead(callId));
    }
  }, [totalPlayTime, isRead, hasMarkedAsRead, onMarkAsRead, callId, dispatch]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio || !voicemailUrl) return;

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

  return (
    <div
      className={`flex items-center space-x-3 p-3 rounded-lg ${
        isRead || hasMarkedAsRead ? 'bg-gray-50' : 'bg-blue-50'
      }`}
    >
      <audio ref={audioRef} src={voicemailUrl} preload="metadata" />
      <button
        onClick={togglePlayPause}
        className={`flex items-center justify-center w-8 h-8 text-white rounded-full hover:opacity-80 transition-colors ${
          isRead || hasMarkedAsRead ? 'bg-gray-600' : 'bg-blue-600'
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
          <span>Voicemail</span>
          {!isRead && !hasMarkedAsRead && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              New
            </span>
          )}
          <span className="text-gray-400">•</span>
          <span>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          {/* Debug info - remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <>
              <span className="text-gray-400">•</span>
              <span className="text-xs text-gray-500">
                Listened: {Math.floor(totalPlayTime / 1000)}s
              </span>
            </>
          )}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
          <div
            className={`h-2 rounded-full transition-all ${
              isRead || hasMarkedAsRead ? 'bg-gray-600' : 'bg-blue-600'
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

const formatTimeFromSeconds = (seconds: string) => {
  const totalSeconds = parseInt(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleString();
};

const VoiceMailDetails: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, record } = useSelector((state: RootState) => state.voiceMailReducer);
  const [call, setCall] = useState<Call | null>(null);
  
  console.log("record in here>>>>>>", record);
  
  useEffect(() => {
    if (record) {
      setCall(record);
    }
  }, [record]);

  const handleMarkAsRead = () => {
    if (call) {
      setCall({
        ...call,
        voicemail_read: true,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!call) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-gray-500">No call data available</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate('/voiceMails')}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back to Voicemails
            </button>
            <div className="flex items-center space-x-2">
              <CallStatusBadge status={call.call_status} />
              {call.voicemail_url && !call.voicemail_read && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  Unread Voicemail
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">
              Call Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Call Type</p>
                <p className="text-sm text-gray-900 capitalize">
                  {call.call_type}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Case Number</p>
                <p className="text-sm text-gray-900">{call.case_number}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Call Duration</p>
                <p className="text-sm text-gray-900">
                  <Clock className="w-4 h-4 inline mr-1" />
                  {formatTimeFromSeconds(call.call_duration)}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">
              Call Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">From:</p>
                <p className="text-lg text-gray-900">{call.from_number}</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">To:</p>
                <p className="text-lg text-gray-900">{call.to_number}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">
              Timeline
            </h4>
            <div className="space-y-2">
              <div className="flex items-start">
                <div className="flex flex-col items-center mr-4">
                  <div className="w-4 h-4 bg-blue-500 rounded-full mt-1"></div>
                  <div className="w-px h-12 bg-gray-300"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Call Started</p>
                  <p className="text-sm text-gray-500">
                    {formatDateTime(call.call_started_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex flex-col items-center mr-4">
                  <div className="w-px h-12 bg-gray-300"></div>
                  <div className="w-4 h-4 bg-red-500 rounded-full mt-1"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Call Ended</p>
                  <p className="text-sm text-gray-500">
                    {formatDateTime(call.call_ended_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {call.voicemail_url && (
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">
                Voicemail
              </h4>
              <VoicemailPlayer
                voicemailUrl={call.voicemail_url}
                callId={call.id}
                isRead={call.voicemail_read}
                onMarkAsRead={handleMarkAsRead}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceMailDetails;