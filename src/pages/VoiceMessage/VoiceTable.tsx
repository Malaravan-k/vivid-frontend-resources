import React, { useState, useEffect } from 'react';
import { Phone, Volume2, User, Calendar } from 'lucide-react';
import CallDetailsModal from './CallDetailsModal';
import { callLogsActions } from '../../store/actions/callLogs.actions';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/index';

// Updated Type definitions to match new API response
interface CallLogSummary {
  last_activity: string;
  latest_call_status: 'completed' | 'failed' | 'no-answer' | 'missed' | 'busy';
  phone_number: string;
  total_calls: number;
  voicemails: number;
}

interface CallStatusBadgeProps {
  status: CallLogSummary['latest_call_status'];
}

interface CallDetailsModalProps {
  callSummary: CallLogSummary;
  callDetails: any[];
  isLoading: boolean;
  onClose: () => void;
}

// Pagination parameters interface
interface PaginationParams {
  page: number;
  pageSize: number;
  filter?: string;
}

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
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};

const CallLogsPage: React.FC = () => {
  const dispatch = useDispatch();
  const [selectedCallSummary, setSelectedCallSummary] = useState<CallLogSummary | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const { records, loading, modalLoading, record, total } = useSelector((state: RootState) => state.callLogsReducer);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Backend pagination configuration
  const pageSize = 10; // Changed to 5 as requested
  const agentId = localStorage.getItem('primary_mobile_number')

  // Calculate pagination info without totalPages
  const hasNextPage = records.length === pageSize; // If we got full page size, likely more pages exist
  const hasPreviousPage = currentPage > 0;
  const startRecord = currentPage * pageSize + 1;
  const endRecord = currentPage * pageSize + records.length;

  // Load call logs with pagination parameters
  const loadCallLogs = (paginationParams: PaginationParams) => {
    dispatch(callLogsActions.loadCallLogs(agentId, paginationParams));
  };

  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      loadCallLogs({
        page: currentPage,
        pageSize: pageSize,
        filter: searchTerm || undefined
      });
    }, searchTerm ? 500 : 0);

    return () => clearTimeout(searchTimeout);
  }, [currentPage, searchTerm]); // Dependencies: currentPage and searchTerm

  const handleRowClick = (callSummary: CallLogSummary): void => {
    setSelectedCallSummary(callSummary);
    console.log(callSummary);
    const user_number = agentId
    const ownerNumber = callSummary?.phone_number;
    dispatch(callLogsActions.loadCallLogsDetails(user_number, ownerNumber));
  };

  // Handle page navigation
  const handlePreviousPage = (): void => {
    if (hasPreviousPage) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = (): void => {
    if (hasNextPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Handle search with page reset
  const handleSearchChange = (value: string): void => {
    setSearchTerm(value);
    if (currentPage !== 0) {
      setCurrentPage(0); // Reset to first page when searching
    }
  };

  const formatDate = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Call Logs</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Detailed call history and recordings
            </p>
          </div>
          <div className="mt-3 sm:mt-0 w-full sm:w-64">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md h-10"
                placeholder="Search phone number..."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Latest Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Calls
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Activity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Call Logs
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center">
                  <div className="flex justify-center items-center space-x-2">
                    <div className="h-4 w-4 bg-blue-600 rounded-full animate-bounce" />
                    <div className="h-4 w-4 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="h-4 w-4 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No call logs found
                </td>
              </tr>
            ) : (
              records.map((callSummary: CallLogSummary) => (
                <tr
                  key={callSummary.phone_number}
                  onClick={() => handleRowClick(callSummary)}
                  className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                    callSummary.voicemails > 0 ? 'bg-white' : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Phone className="w-5 h-5 text-gray-400 mr-3" />
                      <div className="text-sm font-medium text-gray-900">
                        {callSummary.phone_number}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <CallStatusBadge status={callSummary.latest_call_status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-400 mr-1" />
                      {callSummary.total_calls}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                      {formatDate(callSummary.last_activity)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {callSummary.voicemails > 0 ? (
                      <div className="flex items-center">
                        <span className="text-sm text-gray-900">{callSummary.voicemails}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          {total ? (
            <>
              Showing {startRecord} to {Math.min(endRecord, total)} of {total} contacts
            </>
          ) : records.length > 0 ? (
            <>
              Showing {startRecord} to {endRecord} contacts
            </>
          ) : (
            'No contacts found'
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handlePreviousPage}
            disabled={!hasPreviousPage || loading}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-sm text-gray-700">
            Page {currentPage + 1}
          </span>
          <button
            onClick={handleNextPage}
            disabled={!hasNextPage || loading}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {/* Call Details Modal */}
      {selectedCallSummary && (
        <CallDetailsModal 
          callSummary={selectedCallSummary}
          callDetails={record || []} // Use actual call details from reducer
          isLoading={modalLoading} // Use actual modal loading state
          onClose={() => setSelectedCallSummary(null)}
        />
      )}
    </div>
  );
};

export default CallLogsPage;