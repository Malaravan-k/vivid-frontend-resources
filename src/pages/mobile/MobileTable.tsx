import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import StatusBadge from '../../components/ui/StatusBadge';
import { fetchMobiles } from '../../utils/api';
import { Mobile } from '../../types';
import { Search } from 'lucide-react';

const MobileTable = () => {
  const [mobiles, setMobiles] = useState<Mobile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const pageSize = 10;

  useEffect(() => {
    const loadMobiles = async () => {
      setLoading(true);
      try {
        const result = await fetchMobiles(currentPage, pageSize);
        setMobiles(result.data);
        setTotalPages(Math.ceil(result.total / pageSize));
      } catch (error) {
        console.error('Failed to fetch mobiles:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMobiles();
  }, [currentPage]);

  const handleRowClick = (item: Mobile) => {
    navigate(`/mobile/${item.id}`);
  };

  const columns = [
    {
      header: 'Mobile ID',
      accessor: 'id',
    },
    {
      header: 'Owner Name',
      accessor: 'ownerName',
    },
    {
      header: 'Phone Number',
      accessor: 'phoneNumber',
    },
    {
      header: 'Device Type',
      accessor: 'deviceType',
    },
    {
      header: 'Status',
      accessor: (row: Mobile) => <StatusBadge status={row.status} />,
      className: 'text-center',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Mobile</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Track mobile device information and communication history
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
                placeholder="Search mobiles..."
              />
            </div>
          </div>
        </div>
      </div>
      <div>
        <Table
          columns={columns}
          data={mobiles}
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

export default MobileTable;