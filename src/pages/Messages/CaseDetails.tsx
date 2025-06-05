import React from 'react';
import { Case } from '../../types/message.types';

interface CaseDetailsProps {
  caseDetails: Case | null;
  isLoading: boolean;
}

const CaseDetails: React.FC<CaseDetailsProps> = ({ caseDetails, isLoading }) => {
  if (isLoading) {
    return (
      <div className="p-4 h-full flex items-center justify-center">
        <p className="text-gray-500">Loading case details...</p>
      </div>
    );
  }

  if (!caseDetails) {
    return (
      <div className="p-4 h-full flex items-center justify-center">
        <p className="text-gray-500">Select a conversation to view case details</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto border-l border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-center text-gray-800">Owner Information</h2>
      </div>

      <div className="px-4 py-2">
        <div className="flex flex-col gap-4">
          <div className="border-b border-gray-200 pb-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">ID/Case</span>
              <span className="text-sm font-medium">{caseDetails.idNumber}</span>
            </div>
          </div>

          <div className="border-b border-gray-200 pb-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Address</span>
              <span className="text-sm font-medium">{caseDetails.address}</span>
            </div>
          </div>

          <div className="border-b border-gray-200 pb-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Filing Date</span>
              <span className="text-sm font-medium">{caseDetails.filingDate}</span>
            </div>
          </div>

          <div className="border-b border-gray-200 pb-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Assessed Value</span>
              <span className="text-sm font-medium">{caseDetails.assessedValue}</span>
            </div>
          </div>

          <div className="border-b border-gray-200 pb-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Amount Owed</span>
              <span className="text-sm font-medium">{caseDetails.amountOwed}</span>
            </div>
          </div>

          <div className="border-b border-gray-200 pb-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Property Type</span>
              <span className="text-sm font-medium">{caseDetails.propertyType}</span>
            </div>
          </div>

          <div className="pb-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Property Status</span>
              <span className={`text-sm font-medium ${
                caseDetails.propertyStatus === 'Active' ? 'text-green-600' : 'text-gray-600'
              }`}>
                {caseDetails.propertyStatus}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseDetails;