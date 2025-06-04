import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import StatusBadge from '../../components/ui/StatusBadge';
import { Case } from '../../types';
import {  Search } from 'lucide-react';
import { useSelector } from 'react-redux';
import {dispatch, RootState} from '../../store/index'
import { casesActions } from '../../store/actions/cases.actions';
import { callerActions } from '../../store/actions/caller.action.js';

const CasesTable = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const navigate = useNavigate();
  const {records , loading ,total} = useSelector((state:RootState)=>state.caseReducer)
  const pageSize = 10;
  useEffect(()=>{
    dispatch(casesActions.loadRecords({page:currentPage, pageSize:pageSize}))
  },[currentPage])



   useEffect(()=>{
   dispatch(callerActions.getCallerToken('vivid_agent_19844597890'))
  },[])

  const handleRowClick = (item: Case) => {
  navigate(`/cases/${item.case_id}`, {
    state: {
      ownerName: item.owner_name
    }
  });
};

  const columns = [
    {
      header: 'Case ID',
      accessor: 'case_id',
    },
    {
      header: 'Owner Name',
      accessor: 'owner_name',
    },
    {
      header: 'Mobile Number 1',
      accessor: 'mobile_number_1',
    },
    {
      header: 'Mobile Number 2',
      accessor: 'mobile_number_1',
    },
    {
      header: 'Mobile Number 3',
      accessor: 'mobile_number_1',
    },
    {
      header: 'Status',
      accessor: (row: Case) => <StatusBadge status={row.status} />,
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
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
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
          onRowClick={handleRowClick}
          isLoading={loading}
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