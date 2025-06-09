import React from 'react';
import { Building, Calendar, DollarSign, Home, FileText, Activity } from 'lucide-react';

interface User {
  id: string;
  name: string;
  phone: string;
}

interface OwnerInfo {
  idCase: string;
  address: string;
  filling_date: string;
  assessed_value: string;
  amount_owed: string;
  property_type: string;
  property_status: string;
}

interface OwnerInfoProps {
  selectedUser: User | null;
  ownerInfo: OwnerInfo | null;
  casesLoading : boolean | null;
}

const OwnerInfo: React.FC<OwnerInfoProps> = ({ selectedUser, ownerInfo , casesLoading}) => {
  if (!selectedUser) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No user selected</h3>
          <p className="text-gray-500 text-sm">Select a user to view their information</p>
        </div>
      </div>
    );
  }

  if (casesLoading) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading owner information...</p>
        </div>
      </div>
    );
  }

    if (!ownerInfo || Object.keys(ownerInfo).length === 0) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 flex items-center justify-center">
        <div className="text-center p-6">
          <p className="text-gray-500">Cases Not found For this number</p>
        </div>
      </div>
    );
  }

  const infoItems = [
    {
      label: 'ID/Case',
      value: ownerInfo?.idCase,
      icon: FileText,
    },
    {
      label: 'Address',
      value: ownerInfo?.address,
      icon: Home,
    },
    {
      label: 'Filing Date',
      value: ownerInfo?.filling_date,
      icon: Calendar,
    },
    {
      label: 'Assessed Value',
      value: ownerInfo?.assessed_value,
      icon: DollarSign,
    },
    {
      label: 'Amount Owed',
      value: ownerInfo?.amount_owed,
      icon: DollarSign,
    },
    {
      label: 'Property Type',
      value: ownerInfo?.property_type,
      icon: Building,
    },
    {
      label: 'Property Status',
      value: ownerInfo?.property_status,
      icon: Activity,
    },
  ];

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Owner Information</h2>
        <div className="w-full h-1 bg-blue-600 rounded-full"></div>
      </div>

      {/* Owner Information */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {infoItems.map((item, index) => (
            <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <item.icon className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    {item.label}
                  </label>
                  <p className="text-sm text-gray-900 break-words">
                    {item.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default OwnerInfo;