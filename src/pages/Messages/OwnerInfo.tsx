import React from 'react';
import { useSelector } from 'react-redux';
import { 
  Building, 
  Calendar, 
  DollarSign, 
  Home, 
  FileText, 
  Activity, 
  MapPin,
  Phone,
  User,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { RootState } from '../../store/index';

interface User {
  id: string;
  name: string;
  phone: string;
}

interface OwnerInfo {
  case_id: string;
  address: string;
  filling_date: string;
  assessed_value: string;
  amount_owed: string;
  property_type: string;
  property_status: string;
}

const OwnerInfo: React.FC = () => {
  const { selectedUser, ownerInfo, ownerInfoLoading } = useSelector((state: RootState) => state.chatReducer);
  const { loading:infoLoading, record } = useSelector((state: RootState) => state.caseReducer)

  if (!selectedUser) {
    return (
      <div className="w-80 bg-gradient-to-b from-white to-gray-50/50 border-l border-gray-200/50 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Building className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No user selected</h3>
          <p className="text-gray-500 text-sm leading-relaxed">Select a contact to view their property information and case details</p>
        </div>
      </div>
    );
  }

  if (infoLoading) {
    return (
      <div className="w-80 bg-gradient-to-b from-white to-gray-50/50 border-l border-gray-200/50 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Building className="w-8 h-8 text-white" />
            </div>
            <Loader2 className="absolute -top-1 -right-1 w-6 h-6 text-blue-600 animate-spin" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Information</h3>
          <p className="text-gray-600">Fetching property details...</p>
        </div>
      </div>
    );
  }

  if (!record || Object.keys(record).length === 0) {
    return (
      <div className="w-80 bg-gradient-to-b from-white to-gray-50/50 border-l border-gray-200/50 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-gradient-to-r from-amber-100 to-orange-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <AlertCircle className="w-8 h-8 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Case Found</h3>
          <p className="text-gray-500 text-sm leading-relaxed">No property case information available for this contact</p>
        </div>
      </div>
    );
  }

  const infoItems = [
    {
      label: 'Case ID',
      value: record?.case_id,
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Property Address',
      value: record?.address,
      icon: MapPin,
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      label: 'Filing Date',
      value: record?.filling_date,
      icon: Calendar,
      color: 'from-purple-500 to-purple-600',
    },
    {
      label: 'Assessed Value',
      value: record?.assessed_value,
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
    },
    {
      label: 'Amount Owed',
      value: record?.amount_owed,
      icon: DollarSign,
      color: 'from-red-500 to-red-600',
    },
    {
      label: 'Property Type',
      value: record?.property_type,
      icon: Home,
      color: 'from-indigo-500 to-indigo-600',
    },
    {
      label: 'Property Status',
      value: record?.property_status,
      icon: Activity,
      color: 'from-amber-500 to-amber-600',
    },
  ];

  return (
    <div className="w-80 lg:w-96 bg-gradient-to-b from-white to-gray-50/50 border-l border-gray-200/50 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200/50 bg-white/90 backdrop-blur-sm">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{selectedUser.name}</h2>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {selectedUser.owner_no}
            </p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-200/50">
          <h3 className="text-sm font-semibold text-blue-900 mb-1">Property Information</h3>
          <p className="text-xs text-blue-700">Case details and property status</p>
        </div>
      </div>

      {/* Owner Information */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {infoItems.map((item, index) => (
            <div key={index} className="group">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-sm hover:shadow-lg transition-all duration-200 hover:border-gray-300/50">
                <div className="flex items-start space-x-3">
                  <div className={`p-2.5 bg-gradient-to-r ${item.color} rounded-xl shadow-sm group-hover:shadow-md transition-all duration-200`}>
                    <item.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                      {item.label}
                    </label>
                    <p className="text-sm text-gray-900 font-medium break-words leading-relaxed">
                      {item.value || 'Not available'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Card */}
        <div className="mt-6 bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-4 text-white shadow-xl">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Case Summary
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-300">Status:</span>
              <span className="font-medium">{record?.property_status || 'Unknown'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Type:</span>
              <span className="font-medium">{record?.property_type || 'Unknown'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Outstanding:</span>
              <span className="font-medium text-red-300">{record?.amount_owed || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerInfo;