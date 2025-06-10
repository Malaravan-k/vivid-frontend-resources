import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneIncoming, PhoneOutgoing, Play, Pause, Volume2, Clock, User, Calendar, ChevronDown, ChevronRight } from 'lucide-react';
import CallDetailsModal from './CallDetailsModal'
// Sample data for call logs
const sampleCallLogs = [
  {
    id: '1',
    phone_number: '+1 (555) 123-4567',
    contact_name: 'John Smith',
    call_type: 'incoming',
    duration: '05:23',
    timestamp: '2025-06-10T10:30:00Z',
    status: 'answered',
    case_id: 'CASE-001',
    has_voicemail: false,
    from_number: '+1 (555) 123-4567',
    to_number: '+1 (555) 999-0001',
    voicemail_read: false
  },
  {
    id: '2',
    phone_number: '+1 (555) 123-4567',
    contact_name: 'John Smith',
    call_type: 'outgoing',
    duration: '03:15',
    timestamp: '2025-06-09T14:20:00Z',
    status: 'answered',
    case_id: 'CASE-001',
    has_voicemail: false,
    from_number: '+1 (555) 999-0001',
    to_number: '+1 (555) 123-4567',
    voicemail_read: false
  },
  {
    id: '3',
    phone_number: '+1 (555) 987-6543',
    contact_name: 'Sarah Johnson',
    call_type: 'outgoing',
    duration: '02:15',
    timestamp: '2025-06-10T09:45:00Z',
    status: 'answered',
    case_id: 'CASE-002',
    has_voicemail: false,
    from_number: '+1 (555) 999-0001',
    to_number: '+1 (555) 987-6543',
    voicemail_read: false
  },
  {
    id: '4',
    phone_number: '+1 (555) 456-7890',
    contact_name: 'Mike Wilson',
    call_type: 'incoming',
    duration: '00:00',
    timestamp: '2025-06-10T08:20:00Z',
    status: 'missed',
    case_id: 'CASE-003',
    has_voicemail: true,
    voicemail_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    from_number: '+1 (555) 456-7890',
    to_number: '+1 (555) 999-0001',
    voicemail_read: false
  },
  {
    id: '5',
    phone_number: '+1 (555) 456-7890',
    contact_name: 'Mike Wilson',
    call_type: 'incoming',
    duration: '07:30',
    timestamp: '2025-06-09T16:10:00Z',
    status: 'answered',
    case_id: 'CASE-003',
    has_voicemail: false,
    from_number: '+1 (555) 456-7890',
    to_number: '+1 (555) 999-0001',
    voicemail_read: false
  },
  {
    id: '6',
    phone_number: '+1 (555) 234-5678',
    contact_name: 'Emily Davis',
    call_type: 'outgoing',
    duration: '08:42',
    timestamp: '2025-06-09T16:30:00Z',
    status: 'answered',
    case_id: 'CASE-004',
    has_voicemail: false,
    from_number: '+1 (555) 999-0001',
    to_number: '+1 (555) 234-5678',
    voicemail_read: false
  },
  {
    id: '7',
    phone_number: '+1 (555) 345-6789',
    contact_name: 'Robert Brown',
    call_type: 'incoming',
    duration: '00:00',
    timestamp: '2025-06-09T14:15:00Z',
    status: 'missed',
    case_id: 'CASE-005',
    has_voicemail: true,
    voicemail_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    from_number: '+1 (555) 345-6789',
    to_number: '+1 (555) 999-0001',
    voicemail_read: true
  },
  {
    id: '8',
    phone_number: '+1 (555) 567-8901',
    contact_name: 'Lisa Anderson',
    call_type: 'incoming',
    duration: '12:05',
    timestamp: '2025-06-09T11:20:00Z',
    status: 'answered',
    case_id: 'CASE-006',
    has_voicemail: false,
    from_number: '+1 (555) 567-8901',
    to_number: '+1 (555) 999-0001',
    voicemail_read: false
  },
  {
    id: '9',
    phone_number: '+1 (555) 678-9012',
    contact_name: 'David Miller',
    call_type: 'incoming',
    duration: '00:00',
    timestamp: '2025-06-08T13:30:00Z',
    status: 'missed',
    case_id: 'CASE-007',
    has_voicemail: true,
    voicemail_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    from_number: '+1 (555) 678-9012',
    to_number: '+1 (555) 999-0001',
    voicemail_read: false
  }
];

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

const CallLogsPage = () => {
  const [callLogs, setCallLogs] = useState(sampleCallLogs);
  const [loading, setLoading] = useState(false);
  const [selectedCallGroup, setSelectedCallGroup] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  const pageSize = 10;

  // Group calls by contact
  const groupCallsByContact = (logs) => {
    const groups = {};
    
    logs.forEach(log => {
      const key = `${log.contact_name}-${log.phone_number}`;
      if (!groups[key]) {
        groups[key] = {
          contact_name: log.contact_name,
          phone_number: log.phone_number,
          calls: [],
          latestCall: null,
          totalCalls: 0,
          voicemailCount: 0,
          hasUnreadVoicemail: false
        };
      }
      
      groups[key].calls.push(log);
      groups[key].totalCalls++;
      
      if (log.has_voicemail) {
        groups[key].voicemailCount++;
        if (!log.voicemail_read) {
          groups[key].hasUnreadVoicemail = true;
        }
      }
    });

    // Sort calls within each group and set latest call
    Object.values(groups).forEach(group => {
      group.calls.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      group.latestCall = group.calls[0];
    });

    return Object.values(groups);
  };

  // Filter and group call logs
  const filteredLogs = callLogs.filter(log => 
    log.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.phone_number.includes(searchTerm) ||
    log.case_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedLogs = groupCallsByContact(filteredLogs);
  
  // Sort groups by latest call timestamp
  const sortedGroups = groupedLogs.sort((a, b) => 
    new Date(b.latestCall.timestamp) - new Date(a.latestCall.timestamp)
  );

  const paginatedGroups = sortedGroups.slice(
    currentPage * pageSize, 
    (currentPage + 1) * pageSize
  );

  const totalPages = Math.ceil(sortedGroups.length / pageSize);

  const handleRowClick = (group) => {
    setSelectedCallGroup(group);
  };

  const toggleGroupExpansion = (groupKey, e) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
  };

  const markVoicemailAsRead = (callId) => {
    setCallLogs(prevLogs => 
      prevLogs.map(log => 
        log.id === callId 
          ? { ...log, voicemail_read: true }
          : log
      )
    );
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getGroupKey = (group) => `${group.contact_name}-${group.phone_number}`;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Call Logs</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Grouped call history with voicemail management
            </p>
          </div>
          <div className="mt-3 sm:mt-0 w-full sm:w-64">
            <div className="relative rounded-md shadow-lg">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md h-10"
                placeholder="Search calls..."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Latest Call
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Calls
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Activity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Voicemails
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">
                  <div className="flex justify-center items-center space-x-2">
                    <div className="h-4 w-4 bg-blue-600 rounded-full animate-bounce" />
                    <div className="h-4 w-4 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="h-4 w-4 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </td>
              </tr>
            ) : paginatedGroups.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No call logs found
                </td>
              </tr>
            ) : (
              paginatedGroups.map((group) => {
                const groupKey = getGroupKey(group);
                const isExpanded = expandedGroups.has(groupKey);
                
                return (
                  <React.Fragment key={groupKey}>
                    <tr
                      onClick={() => handleRowClick(group)}
                      className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                        group.hasUnreadVoicemail ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <button
                            onClick={(e) => toggleGroupExpansion(groupKey, e)}
                            className="mr-3 p-1 hover:bg-gray-200 rounded"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-500" />
                            )}
                          </button>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{group.contact_name}</div>
                            <div className="text-sm text-gray-500">{group.phone_number}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {group.latestCall.call_type === 'incoming' ? (
                            <PhoneIncoming className="w-5 h-5 text-blue-600 mr-2" />
                          ) : (
                            <PhoneOutgoing className="w-5 h-5 text-green-600 mr-2" />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900 capitalize">
                              {group.latestCall.call_type}
                            </div>
                            <div className="text-sm text-gray-500">
                              <Clock className="w-4 h-4 inline mr-1" />
                              {group.latestCall.duration}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <CallStatusBadge status={group.latestCall.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 text-gray-400 mr-1" />
                          {group.totalCalls}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                          {formatDate(group.latestCall.timestamp)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {group.voicemailCount > 0 ? (
                          <div className="flex items-center">
                            <Volume2 className="w-4 h-4 text-gray-400 mr-1" />
                            <span className="text-sm text-gray-900">{group.voicemailCount}</span>
                            {group.hasUnreadVoicemail && (
                              <span className="ml-2 w-2 h-2 bg-red-500 rounded-full"></span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={6} className="px-6 py-2 bg-gray-50">
                          <div className="pl-8 space-y-2">
                            <h4 className="text-sm font-medium text-gray-700">Recent Calls:</h4>
                            {group.calls.slice(0, 3).map((call) => (
                              <div key={call.id} className="flex items-center justify-between text-sm text-gray-600 py-1 border-l-2 border-gray-300 pl-3">
                                <div className="flex items-center space-x-2">
                                  {call.call_type === 'incoming' ? (
                                    <PhoneIncoming className="w-4 h-4 text-blue-500" />
                                  ) : (
                                    <PhoneOutgoing className="w-4 h-4 text-green-500" />
                                  )}
                                  <span className="capitalize">{call.call_type}</span>
                                  <span>•</span>
                                  <span>{formatDate(call.timestamp)}</span>
                                  <span>•</span>
                                  <span>{call.duration}</span>
                                  <CallStatusBadge status={call.status} />
                                </div>
                                {call.has_voicemail && (
                                  <div className="flex items-center text-blue-600">
                                    <Volume2 className="w-4 h-4 mr-1" />
                                    <span className="text-xs">
                                      {call.voicemail_read ? 'Played' : 'New'}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))}
                            {group.calls.length > 3 && (
                              <div className="text-xs text-gray-500 pl-3">
                                And {group.calls.length - 3} more calls...
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, sortedGroups.length)} of {sortedGroups.length} contacts
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-sm text-gray-700">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
            disabled={currentPage >= totalPages - 1}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {/* Call Details Modal */}
      {selectedCallGroup && (
        <CallDetailsModal 
          callGroup={selectedCallGroup} 
          onClose={() => setSelectedCallGroup(null)}
          onMarkAsRead={markVoicemailAsRead}
        />
      )}
    </div>
  );
};

export default CallLogsPage;