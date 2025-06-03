import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import { fetchMessages } from '../../utils/api';
import { Message } from '../../types';
import { Search, Circle } from 'lucide-react';

const MessagesTable = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const pageSize = 10;

  useEffect(() => {
    const loadMessages = async () => {
      setLoading(true);
      try {
        const result = await fetchMessages(currentPage, pageSize);
        setMessages(result.data);
        setTotalPages(Math.ceil(result.total / pageSize));
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [currentPage]);

  const handleRowClick = (item: Message) => {
    navigate(`/messages/${item.id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const truncateContent = (content: string, maxLength: number = 50) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + '...';
  };

  const columns = [
    {
      header: 'Sender',
      accessor: 'senderName',
    },
    {
      header: 'Message',
      accessor: (row: Message) => (
        <div className="flex items-center">
          {!row.read && (
            <Circle className="h-2 w-2 text-blue-500 mr-2 fill-current" />
          )}
          <span>{truncateContent(row.content)}</span>
        </div>
      ),
    },
    {
      header: 'Time',
      accessor: (row: Message) => formatDate(row.timestamp),
    },
    {
      header: 'Status',
      accessor: (row: Message) => (
        <span className={`px-2 py-1 rounded-full text-xs ${row.read ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'}`}>
          {row.read ? 'Read' : 'Unread'}
        </span>
      ),
      className: 'text-center',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Messages</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              All conversations and communication history
            </p>
          </div>
          <div className="mt-3 sm:mt-0 w-full sm:w-64">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Search messages..."
              />
            </div>
          </div>
        </div>
      </div>
      <div>
        <Table
          columns={columns}
          data={messages}
          keyExtractor={(item) => item.id}
          onRowClick={handleRowClick}
          isLoading={loading}
        />
        <div className="px-4 py-3 border-t border-gray-200">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
};

export default MessagesTable;