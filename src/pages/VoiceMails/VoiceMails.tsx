import React, { useState, useEffect } from 'react';
import { Search, Clock, Mail } from 'lucide-react';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import VoiceMailDetailsModal from '../../components/VoiceModals/VoicemailDetailsModal'
import { useDispatch, useSelector } from 'react-redux';
import { voiceMailsActions } from '../../store/actions/voicemail.actions';
import { RootState } from '../../store';

// Types
type VoicemailRecord = {
  last_activity: string;
  latest_call_status: string;
  owner_number: string;
  total_calls: number;
  voicemails: number;
  call_status: string;
  call_started_at: string;
  phone_number: string;
};

type Column<T> = {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
};

const VoiceMails = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedVoiceMailSummary, setSelectedVoiceMailSummary] = useState<VoicemailRecord | null>(null);
  const dispatch = useDispatch();
  
  const agentId = localStorage.getItem('primary_mobile_number')?.replace(/\D/g, '');
  const { records, loading, total, record, modalLoading } = useSelector((state: RootState) => state.voiceMailReducer);

  useEffect(() => {
    dispatch(voiceMailsActions.loadVoiceMails());
  }, [currentPage, searchTerm, agentId, dispatch]);

  const handleSearch = () => {
    // Reset to first page when searching
    setCurrentPage(0);
    dispatch(voiceMailsActions.loadVoiceMails());
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSearchIconClick = () => {
    handleSearch();
  };

  const handleRowClick = (item: VoicemailRecord) => {
    setSelectedVoiceMailSummary(item);
    dispatch(voiceMailsActions.loadVoiceMaildetails(item?.owner_number));
  };

  const handleMarkAsRead = (callId: string) => {
    // Handle marking voicemail as read
    dispatch(voiceMailsActions.updateVoicemailRead(callId));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'answered': 'bg-green-100 text-green-800',
      'missed': 'bg-red-100 text-red-800',
      'failed': 'bg-yellow-100 text-yellow-800',
      'busy': 'bg-orange-100 text-orange-800',
      'default': 'bg-gray-100 text-gray-800'
    };
    
    const colorClass = statusColors[status] || statusColors.default;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        {status}
      </span>
    );
  };

  const columns: Column<VoicemailRecord>[] = [
    {
      header: 'Phone Number',
      accessor: (row) => (
        <div className="font-mono text-sm">
          {row.owner_number}
        </div>
      )
    },
    {
      header: 'Last Activity',
      accessor: (row) => (
        <div className="flex items-center space-x-1">
          <Clock className="h-4 w-4 text-gray-400" />
          <span className="text-sm">{formatDate(row.call_started_at)}</span>
        </div>
      )
    },
    {
      header: 'Call Status',
      accessor: (row) => getStatusBadge(row.call_status)
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h2 className="text-lg leading-6 font-medium text-gray-900">Voice Mails</h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Manage voicemail messages by phone number
            </p>
          </div>
          <div className="mt-3 sm:mt-0 w-full sm:w-64">
            <div className="relative rounded-md border-2 border-gray-300">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search
                  className="h-5 w-5 text-gray-400 cursor-pointer pointer-events-auto hover:text-gray-600"
                  onClick={handleSearchIconClick}
                />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md h-10"
                placeholder="Search phone numbers..."
              />
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <Table
          columns={columns}
          data={records}
          keyExtractor={(item) => item.phone_number}
          isLoading={loading}
          onRowClick={handleRowClick}
        />
        <div className="px-4 py-3 border-t border-gray-200">
          <Pagination
            currentPage={currentPage}
            totalRecords={total}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Voice Mail Details Modal */}
      {selectedVoiceMailSummary && (
        <VoiceMailDetailsModal 
          voiceMailSummary={selectedVoiceMailSummary}
          voiceMailDetails={record || []}
          isLoading={modalLoading}
          onClose={() => setSelectedVoiceMailSummary(null)}
          onMarkAsRead={handleMarkAsRead}
        />
      )}
    </div>
  );
};

export default VoiceMails;