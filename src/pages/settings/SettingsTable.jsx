import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, RotateCw, Eye, EyeOff } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { userActions } from '../../store/actions/user.actions'
import Button from '../../components/ui/Button'
import MobileNumberDropdown from '../../components/ui/MobileNumberDropdown'; // Import the new component

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
          ) : (
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
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  // Modal states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);
  
  const dispatch = useDispatch();
  const { userRecords, loading, success, deleteSuccess, total, mobileNumbers } = useSelector((state) => state.userReducer)
  const { inprogress } = useSelector((state) => state.loaderReducer)

  // Available mobile numbers state - in future, fetch from API
  const [availableMobileNumbers, setAvailableMobileNumbers] = useState([]);
  console.log("availableMobileNumbers;;;;", availableMobileNumbers)
  const pageSize = 10;
  useEffect(() => {
    dispatch(userActions.fetchTwilioNumbers())
  }, [])
  useEffect(() => {
    dispatch(userActions.loadRecords({ page: currentPage, pageSize }));
  }, [currentPage]);

  const [formData, setFormData] = useState({
    userName: '',
    mobileNumbers: [], // Changed from mobileNumber to mobileNumbers array
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
    setAvailableMobileNumbers(mobileNumbers);
  }, []);

  useEffect(() => {
    if ((success && showAddDialog) || (success && showEditDialog) || (deleteSuccess && showDeleteDialog)) {
      dispatch(userActions.loadRecords({ page: currentPage, pageSize }));
      closeDialogs();
    }
  }, [success, deleteSuccess]);



  const totalPages = Math.ceil(total / pageSize);
  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Modal functions
  const resetForm = () => {
    setFormData({
      userName: '',
      mobileNumbers: [],
      password: ''
    });
    setShowPassword(false); // Reset password visibility when resetting form
  };

  const handleAddUser = () => {
    resetForm();
    setShowAddDialog(true);
  };

  // In the handleEdit function
  const handleEdit = (user) => {
    setSelectedUser(user);
    console.log("user:::", user.mobile_numbers);

    // Extract mobile numbers from the mobile_numbers array
    const userMobileNumbers = user.mobile_numbers
      ? user.mobile_numbers.map(m => m.mobile_number)
      : [];

    console.log("userMobileNumbers", userMobileNumbers);

    setFormData({
      userName: user.user_name,
      mobileNumbers: userMobileNumbers,
      password: user.password
    });
    setShowPassword(false); // Reset password visibility when editing
    setShowEditDialog(true);
  };

  // Also update the useEffect for availableMobileNumbers
  useEffect(() => {
    if (mobileNumbers && mobileNumbers.length > 0) {
      setAvailableMobileNumbers(mobileNumbers);
    }
  }, [mobileNumbers]);

  const handleDelete = (user) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const saveUser = (e) => {
    if (e) e.preventDefault();
    if (showEditDialog && selectedUser) {
      const user_id = selectedUser?.user_id
      const updatedUser = {
        user_id: user_id,
        userName: formData.userName,
        mobileNumbers: formData.mobileNumbers, // Send as array
        password: formData.password,
      };
      console.log("updatedUser",updatedUser)
      dispatch(userActions.updateRecord(updatedUser));
    } else {
      // Add new user
      const newUser = {
        userName: formData.userName,
        mobileNumbers: formData.mobileNumbers, // Send as array
        password: formData.password,
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

  // Handle mobile numbers change from the dropdown component
  const handleMobileNumbersChange = (selectedNumbers) => {
    setFormData(prev => ({
      ...prev,
      mobileNumbers: selectedNumbers
    }));
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'user_name',
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
          <div className='flex gap-5'>
            <button
              onClick={handleAddUser}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center space-x-2"
            >
              <RotateCw className="w-4 h-4" />
              <span>Sync Twilio</span>
            </button>
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
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
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
                      disabled={showEditDialog}
                      onChange={(e) => handleInputChange('userName', e.target.value)}
                      className="w-full px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Alex"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-600 mb-2">
                      Mobile Numbers
                    </label>
                    <MobileNumberDropdown
                      key={`mobile-dropdown-${showEditDialog ? selectedUser?.user_id : 'new'}-${formData.mobileNumbers?.join(',')}`}
                      selectedNumbers={formData.mobileNumbers || []}
                      onNumbersChange={handleMobileNumbersChange}
                      availableNumbers={availableMobileNumbers}
                      placeholder="Select mobile number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-600 mb-2">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        disabled={showEditDialog}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="w-full px-3 py-2 pr-10 bg-blue-50 border border-blue-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="*#6huy77U80%"
                        required
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                        disabled={showEditDialog}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4 mt-8">
                  <Button type="submit" className="w-full" isLoading={inprogress}>
                    {showEditDialog ? 'Edit' : 'Add '}
                  </Button>
                  <button
                    type="button"
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