import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, MessageSquare, Loader2 } from 'lucide-react';

interface VoicemailPlayerProps {
  voicemailUrl: string | null;
  callId: string;
  isRead?: boolean;
  type?: 'recording' | 'voicemail';
  onMarkAsRead?: () => void;
}

const VoicemailPlayer: React.FC<VoicemailPlayerProps> = ({
  voicemailUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  callId,
  isRead = false,
  type = 'voicemail',
  onMarkAsRead
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  const [hasMarkedAsRead, setHasMarkedAsRead] = useState(false);
  const [playStartTime, setPlayStartTime] = useState<number | null>(null);
  const [totalPlayTime, setTotalPlayTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const playTimeRef = useRef(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

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

    const handleLoadStart = () => setIsLoading(true);

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
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [hasStartedPlaying, playStartTime]);

  // Check if user has listened for 10 seconds and mark as read
  useEffect(() => {
    if (type === 'voicemail' && !isRead && !hasMarkedAsRead && totalPlayTime >= 10000 && onMarkAsRead) {
      setHasMarkedAsRead(true);
      onMarkAsRead();
    }
  }, [totalPlayTime, isRead, hasMarkedAsRead, onMarkAsRead, type]);

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
  const effectiveIsRead = isRead || hasMarkedAsRead;
  
  const bgColor = isRecording 
    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200' 
    : (effectiveIsRead ? 'bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200' : 'bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200');
  
  const buttonColor = isRecording 
    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700' 
    : (effectiveIsRead ? 'bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700' : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700');
  
  const progressColor = isRecording 
    ? 'bg-gradient-to-r from-blue-600 to-indigo-600' 
    : (effectiveIsRead ? 'bg-gradient-to-r from-gray-600 to-slate-600' : 'bg-gradient-to-r from-emerald-600 to-teal-600');

  return (
    <div className={`rounded-xl p-3 shadow-sm ${bgColor}`}>
      <audio ref={audioRef} src={voicemailUrl} preload="metadata" />
      
      <div className="flex items-center space-x-4">
        <button
          onClick={togglePlayPause}
          disabled={isLoading}
          className={`flex items-center justify-center w-8 h-8 text-white rounded-full shadow-lg transition-all transform hover:scale-105 ${buttonColor}`}
        >
          { isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4 ml-0.5" />
          )}
        </button>

        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {isRecording ? (
                  <Volume2 className="w-4 h-4 text-blue-600" />
                ) : (
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                )}
                <span className="text-sm text-gray-800">
                  {isRecording ? 'Call Recording' : 'Voicemail'}
                </span>
              </div>
              
              {!isRecording && !effectiveIsRead && (
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

export default VoicemailPlayer;