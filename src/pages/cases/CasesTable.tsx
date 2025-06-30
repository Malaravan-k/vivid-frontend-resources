import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import StatusBadge from '../../components/ui/StatusBadge';
import { Case } from '../../types';
import { Search } from 'lucide-react';
import { useSelector } from 'react-redux';
import { dispatch, RootState } from '../../store/index'
import { casesActions } from '../../store/actions/cases.actions';
import CopyableText from '../../components/ui/CopyableText';

 
const CasesTable = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();
  const { records, loading, total } = useSelector((state: RootState) => state.caseReducer);
  const pageSize = 10;
 
  useEffect(() => {
    dispatch(casesActions.loadRecords({
      page: currentPage,
      pageSize: pageSize,
      filter: searchText.trim()
    },navigate));
  }, [currentPage, searchText]);
 
  const handleSearch = () => {
    // Reset to first page when searching
    setCurrentPage(0);
    dispatch(casesActions.loadRecords({
      filter: searchText.trim()
    }));
  };
   
  const handleRowClick = (item: Case) => {
    navigate(`/cases/${item.case_number}`, {
      state: item
    });
    // setCallStatus('in-progress')
  };

 
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
 
  const handleSearchIconClick = () => {
    handleSearch();
  };
 
const columns = [
  {
    header: 'Case ID',
    accessor: (row: Case) => <CopyableText text={row.case_number || '-'} />,
  },
  {
    header: 'Owner Name', 
    accessor: (row: Case) => row.Full_Name || '-',
  },
  {
    header: 'Mobile Number 1',
    accessor: (row: Case) => <CopyableText text={row.Phone_1 || '-'} />,
  },
  {
    header: 'Mobile Number 2',
    accessor: (row: Case) => <CopyableText text={row.Phone_2 || '-'} />,
  },
  {
    header: 'Mobile Number 3',
    accessor: (row: Case) => <CopyableText text={row.Phone_3 || '-'} />,
  },
  {
    header: 'Lead Stage',
    accessor: (row: Case) => <StatusBadge status={row.Lead_Stage || '-'} />,
    className: 'text-center',
  },
];

 
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Cases</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              A user-friendly tool for acquisition managers to handle foreclosure calls, track leads, and manage tasks seamlessly
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
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyPress={handleKeyPress}
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md h-10"
                placeholder="Search cases..."
              />
            </div>
          </div>
        </div>
      </div>
      <div>
        <Table
          columns={columns}
          data={records}
          keyExtractor={(item) => item.case_number}
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
    </div>
  );
};
 
export default CasesTable;
 