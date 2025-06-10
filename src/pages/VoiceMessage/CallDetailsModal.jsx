import React, { useState, useRef, useEffect } from 'react';
import { PhoneIncoming, PhoneOutgoing, Play, Pause, Volume2, Clock } from 'lucide-react';

const CallStatusBadge = ({ status }) => {
    const statusConfig = {
      answered: { color: 'bg-green-100 text-green-800', label: 'Answered' },
      missed: { color: 'bg-red-100 text-red-800', label: 'Missed' },
      busy: { color: 'bg-yellow-100 text-yellow-800', label: 'Busy' },
      no_answer: { color: 'bg-gray-100 text-gray-800', label: 'No Answer' }
    };
  
    const config = statusConfig[status] || statusConfig.no_answer;
  
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
};

const VoicemailPlayer = ({ voicemailUrl, callId, isRead, onMarkAsRead }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
    const audioRef = useRef(null);
  
    useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;
  
      const handleLoadedMetadata = () => setDuration(audio.duration);
      const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
      const handleEnded = () => setIsPlaying(false);
      const handlePlay = () => {
        if (!hasStartedPlaying && !isRead) {
          setHasStartedPlaying(true);
          onMarkAsRead();
        }
      };
  
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('play', handlePlay);
  
      return () => {
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('play', handlePlay);
      };
    }, [hasStartedPlaying, isRead, onMarkAsRead]);
  
    const togglePlayPause = () => {
      const audio = audioRef.current;
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    };
  
    const formatTime = (time) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };
  
    return (
      <div className={`flex items-center space-x-3 p-3 rounded-lg ${isRead ? 'bg-gray-50' : 'bg-blue-50'}`}>
        <audio ref={audioRef} src={voicemailUrl} preload="metadata" />
        <button
          onClick={togglePlayPause}
          className={`flex items-center justify-center w-8 h-8 text-white rounded-full hover:opacity-80 transition-colors ${
            isRead ? 'bg-gray-600' : 'bg-blue-600'
          }`}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>
        <div className="flex-1">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Volume2 className="w-4 h-4" />
            <span>Voicemail</span>
            {!isRead && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">New</span>}
            <span className="text-gray-400">•</span>
            <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className={`h-2 rounded-full transition-all ${isRead ? 'bg-gray-600' : 'bg-blue-600'}`}
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>
    );
};

const CallDetailsModal = ({ callGroup, onClose, onMarkAsRead }) => {
    if (!callGroup) return null;
  
    const calls = callGroup.calls.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const latestCall = calls[0];
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-medium text-gray-900">Call History - {callGroup.contact_name}</h3>
                  {callGroup.hasUnreadVoicemail && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">Unread Voicemails</span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{callGroup.phone_number} • {calls.length} calls</p>
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
            <div className="space-y-6">
              {/* Current Status Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Current Status</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Latest Call</p>
                    <p className="text-sm text-gray-900">
                      {new Date(latestCall.timestamp).toLocaleString()}
                    </p>
                    <CallStatusBadge status={latestCall.status} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Case ID</p>
                    <p className="text-sm text-gray-900">{calls[0].case_id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Total Calls</p>
                    <p className="text-sm text-gray-900">{calls.length}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Voicemails</p>
                    <p className="text-sm text-gray-900">
                      {callGroup.voicemailCount} 
                      {callGroup.hasUnreadVoicemail && <span className="text-red-600"> (Unread)</span>}
                    </p>
                  </div>
                </div>
              </div>
  
              {/* Call History */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Call History</h4>
                <div className="space-y-4">
                  {calls.map((call) => (
                    <div key={call.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {call.call_type === 'incoming' ? (
                            <PhoneIncoming className="w-6 h-6 text-blue-600" />
                          ) : (
                            <PhoneOutgoing className="w-6 h-6 text-green-600" />
                          )}
                          <div>
                            <p className="font-medium text-gray-900 capitalize">{call.call_type} Call</p>
                            <p className="text-sm text-gray-500">
                              {new Date(call.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <CallStatusBadge status={call.status} />
                          <p className="text-sm text-gray-500 mt-1">
                            <Clock className="w-4 h-4 inline mr-1" />
                            {call.duration}
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
                      </div>
  
                      {call.has_voicemail && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Voicemail:</p>
                          <VoicemailPlayer 
                            voicemailUrl={call.voicemail_url} 
                            callId={call.id} 
                            isRead={call.voicemail_read}
                            onMarkAsRead={() => onMarkAsRead(call.id)}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default CallDetailsModal;