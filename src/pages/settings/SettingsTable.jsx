import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import {userActions} from '../../store/actions/user.actions'
import Button from '../../components/ui/Button'


// Mock Table component - replace with your actual Table import
const Table = ({ columns, data, keyExtractor, isLoading }) => {
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-4 text-center">
                <div className="flex justify-center items-center space-x-2">
                  <div className="h-4 w-4 bg-blue-600 rounded-full animate-bounce" />
                  <div className="h-4 w-4 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="h-4 w-4 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </td>
            </tr>
          ):(
          data.map((item) => (
            <tr key={keyExtractor(item)} className="hover:bg-gray-50">
              {columns.map((column, colIndex) => (
                <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {typeof column.accessor === 'function' 
                    ? column.accessor(item) 
                    : item[column.accessor]}
                </td>
              ))}
            </tr>
          )))
        }
        </tbody>
      </table>
    </div>
  );
};

// Mock Pagination component - replace with your actual Pagination import
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-700">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

const Settings = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  // Modal states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const dispatch = useDispatch();
  const {userRecords ,loading , success, deleteSuccess} = useSelector((state)=>state.userReducer)
  const {inprogress} = useSelector((state)=>state.loaderReducer)


 const pageSize = 10;


useEffect(() => {
  if (currentPage !== 0) {
    dispatch(userActions.loadRecords({ page: currentPage, pageSize }));
  }
}, [currentPage]);
  const [formData, setFormData] = useState({
    userName: '',
    mobileNumber: '',
    password: ''
  });

  useEffect(() => {
    const initialUsers = Array.from({ length: 23 }, (_, index) => ({
      id: index + 1,
      userName: 'Alexa Rawles',
      mobileNumber: '976-9645-9987',
      password: '25%*&gh89*&',
    }));
    setUsers(initialUsers);
  }, []);
   useEffect(() => {
  if ((success && showAddDialog) || (success && showEditDialog) || (deleteSuccess && showDeleteDialog)) {
    dispatch(userActions.loadRecords({ page: currentPage, pageSize }));
    closeDialogs();
  }
}, [success ,deleteSuccess]);
  useEffect(() => {
    const filtered = users.filter((user) =>
      user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.mobileNumber.includes(searchTerm)
    );
    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchTerm, users]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Modal functions
  const resetForm = () => {
    setFormData({
      userName: '',
      mobileNumber: '',
      password: ''
    });
  };

  const handleAddUser = () => {
    resetForm();
    setShowAddDialog(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      userName: user.user_name,
      mobileNumber: user.mobile_number,
      password: user.password
    });
    setShowEditDialog(true);
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

 const saveUser = (e) => {
  if (e) e.preventDefault();
  if (showEditDialog && selectedUser) {
    const user_id = selectedUser?.user_id
   const updatedUser = {
    user_id:user_id,
      ...formData,
    };
    dispatch(userActions.updateRecord(updatedUser));
  } else {
    // Add new user
    const newUser = {
      ...formData,
    };
    setUsers((prevUsers) => [...prevUsers, newUser]);
    dispatch(userActions.AddUser(newUser))
  }
};


  const confirmDelete = () => {
    const user_id = selectedUser?.user_id
    dispatch(userActions.deleteRecord(user_id))
  };

  const closeDialogs = () => {
    setShowAddDialog(false);
    setShowEditDialog(false);
    setShowDeleteDialog(false);
    setSelectedUser(null);
    resetForm();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'user_name',
    },
    {
      header: 'Mobile',
      accessor: 'mobile_number',
    },
    {
      header: 'Password',
      accessor: 'password',
    },
    {
      header: 'Actions',
      accessor: (user) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(user);
            }}
            className="text-blue-600 hover:bg-blue-50 p-1 rounded"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(user);
            }}
            className="text-red-600 hover:bg-red-50 p-1 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Add Users</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Only admins are allowed to manage user accounts.
            </p>
          </div>
          <div className="mt-3 sm:mt-0 w-full sm:w-64 flex items-center space-x-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={handleAddUser}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>

      <div>
        <Table
          columns={columns}
          data={userRecords}
          keyExtractor={(item) => (item?.user_id ?? item?.id ?? Math.random()).toString()}
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

      {/* Add/Edit Dialog */}
      {(showAddDialog || showEditDialog) && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-blue-600 text-center mb-6">
          {showEditDialog ? 'Edit User' : 'Add User'}
        </h3>

        <form onSubmit={saveUser}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-blue-600 mb-2">Name</label>
              <input
                type="text"
                value={formData.userName}
                onChange={(e) => handleInputChange('userName', e.target.value)}
                className="w-full px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Alex"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-600 mb-2">Mobile Number</label>
              <input
                type="tel"
                value={formData.mobileNumber}
                onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                className="w-full px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="234-767-8776"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-600 mb-2">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="*#6huy77U80%"
                required
              />
            </div>
          </div>

          <div className="flex space-x-4 mt-8">
            <Button type="submit" className="w-full" isLoading={inprogress}>
                  Sign in
                </Button>
            <button
              type="button" // Explicitly set as button type
              onClick={closeDialogs}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
)}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4">
            <div className="p-6 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete User</h3>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete this user? This action cannot be undone.
              </p>
              <div className="flex space-x-4">
                <Button type="submit" className="w-full" isLoading={inprogress} onClick={confirmDelete}>
                  Delete
                </Button>
                <button
                  onClick={closeDialogs}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;