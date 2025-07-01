// PostCallForm.tsx
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/index';
import CommonDropdown from './CommonDropdown'; // Import the common dropdown

interface PostCallFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: PostCallFormData) => void;
  callerNumber?: string | null;
  caseId:string | null;
  selectedPhoneField:string |null;
  ownerName:string|null
}

export interface PostCallFormData {
  // Call Logs fields
  call_outcome: string;
  call_status: string;
  call_date: string;
  phone_validity_status: string;
  call_notes: string;
  gpt_call_summary: string;
  
  // Properties fields
  lead_stage: string;
  property_standing: string;
  disposition_interest: string;
  deal_urgency: string;
  red_flag: boolean;
  flag_reason: string;
  internal_comments: string;
}

type FocusedField = 'call_notes' | 'gpt_summary' | 'internal_comments' | null;

// Dropdown options configuration
const dropdownOptions = {
  // Call Logs dropdowns
  callOutcome: [
    { value: 'Connected – Interested', label: 'Connected – Interested' },
    { value: 'Connected – Not Interested', label: 'Connected – Not Interested' },
    { value: 'Connected – Call Back Later', label: 'Connected – Call Back Later' },
    { value: 'Connected – Wrong Person', label: 'Connected – Wrong Person' },
    { value: 'No Answer', label: 'No Answer' },
    { value: 'Voicemail Left', label: 'Voicemail Left' },
    { value: 'Number Disconnected', label: 'Number Disconnected' },
    { value: 'Do Not Call Requested', label: 'Do Not Call Requested' }
  ],
  callStatus: [
    { value: 'Completed', label: 'Completed' },
    { value: 'Follow-Up Needed', label: 'Follow-Up Needed' },
    { value: 'Escalate to Manager', label: 'Escalate to Manager' },
    { value: 'Escalate to Investigator', label: 'Escalate to Investigator' },
    { value: 'Closed – No Interest', label: 'Closed – No Interest' }
  ],
  phoneValidityStatus: [
    { value: 'Valid – Reached', label: 'Valid – Reached' },
    { value: 'Valid – Not Reached', label: 'Valid – Not Reached' },
    { value: 'Invalid – Disconnected', label: 'Invalid – Disconnected' },
    { value: 'Wrong Number', label: 'Wrong Number' },
    { value: 'Do Not Call', label: 'Do Not Call' }
  ],
  
  // Properties dropdowns
  leadStage: [
    { value: 'Ship Trace Complete – Awaiting Call', label: 'Ship Trace Complete – Awaiting Call' },
    { value: 'Call Attempted – No Response', label: 'Call Attempted – No Response' },
    { value: 'Rep Spoke – Interested', label: 'Rep Spoke – Interested' },
    { value: 'Rep Spoke – Not Interested', label: 'Rep Spoke – Not Interested' },
    { value: 'Needs Manager Review', label: 'Needs Manager Review' },
    { value: 'Needs Genealogist', label: 'Needs Genealogist' },
    { value: 'Needs Investigator', label: 'Needs Investigator' }
  ],
  propertyStanding: [
    { value: 'Not Contacted', label: 'Not Contacted' },
    { value: 'In Conversation', label: 'In Conversation' },
    { value: 'Under Contract', label: 'Under Contract' },
    { value: 'Dead Lead', label: 'Dead Lead' },
    { value: 'Partial Deal – More Heirs Needed', label: 'Partial Deal – More Heirs Needed' },
    { value: 'Needs Legal Review', label: 'Needs Legal Review' },
    { value: 'Genealogy In Progress', label: 'Genealogy In Progress' }
  ],
  dispositionInterest: [
    { value: 'Open to Sell', label: 'Open to Sell' },
    { value: 'Wants to Keep', label: 'Wants to Keep' },
    { value: 'Wants Legal Help', label: 'Wants Legal Help' },
    { value: 'Unclear', label: 'Unclear' },
    { value: 'N/A', label: 'N/A' }
  ],
  dealUrgency: [
    { value: 'High – Facing Auction', label: 'High – Facing Auction' },
    { value: 'Medium – Financial Pressure', label: 'Medium – Financial Pressure' },
    { value: 'Low – No Urgency', label: 'Low – No Urgency' },
    { value: 'N/A', label: 'N/A' }
  ],
  flagReason: [
    { value: 'Title Issue', label: 'Title Issue' },
    { value: 'Owner Dispute', label: 'Owner Dispute' },
    { value: 'Heir Conflict', label: 'Heir Conflict' },
    { value: 'Uncooperative Owner', label: 'Uncooperative Owner' },
    { value: 'Need Legal Help', label: 'Need Legal Help' }
  ]
};

const PostCallForm: React.FC<PostCallFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  callerNumber,
  caseId,
  selectedPhoneField,
  ownerName
}) => {
  const { loading, record } = useSelector((state: RootState) => state.postCallReducer);

  const initialState: PostCallFormData = {
    // Call Logs fields
    call_outcome: '',
    call_status: '',
    call_date: '',
    phone_validity_status: '',
    call_notes: '',
    gpt_call_summary: '',
    
    // Properties fields
    lead_stage: '',
    property_standing: '',
    disposition_interest: '',
    deal_urgency: '',
    red_flag: false,
    flag_reason: '',
    internal_comments: ''
  };

  const [formData, setFormData] = useState<PostCallFormData>(initialState);


  useEffect(() => {
    if (record) {
      setFormData({
        // Call Logs fields
        call_outcome: record?.call_outcome || '',
        call_status: record?.call_status || '',
        call_date: record?.call_date || '',
        phone_validity_status: record?.phone_validity_status || '',
        call_notes: record?.call_notes || '',
        gpt_call_summary: record?.gpt_call_summary || '',
        
        // Properties fields
        lead_stage: record?.lead_stage || '',
        property_standing: record?.property_standing || '',
        disposition_interest: record?.disposition_interest || '',
        deal_urgency: record?.deal_urgency || '',
        red_flag: record?.red_flag || false,
        flag_reason: record?.flag_reason || '',
        internal_comments: record?.internal_comments || ''
      });
    }
  }, [record]);

  const [errors, setErrors] = useState<Partial<PostCallFormData>>({});
  const [focusedField, setFocusedField] = useState<FocusedField>(null);

  const handleInputChange = (field: keyof PostCallFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field as keyof PostCallFormData]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<PostCallFormData> = {};

    if (!formData.call_outcome) newErrors.call_outcome = 'Call outcome is required';
    if (!formData.call_status) newErrors.call_status = 'Call status is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const data = {
       case_no:caseId,
       owner_name:ownerName[0],
       lead_stage:formData?.lead_stage,
       [selectedPhoneField]:{
        phone_number:callerNumber,
        call_outcome:formData?.call_outcome,
        call_status:formData?.call_status,
        called_date:formData?.call_date,
        valid_status:formData?.phone_validity_status,
        call_notes:formData?.call_notes,
        gpt_call_summary:formData?.gpt_call_summary
       },
       "properties":{
        property_standing:formData?.property_standing,
        red_flag:formData?.red_flag,
        flag_reason:formData?.flag_reason,
        disposition_interest:formData?.disposition_interest,
        deal_urgency:formData?.deal_urgency,
        internal_comments:formData?.internal_comments
       }
      }
      onSubmit(data);
    }
  };

  const handleFieldFocus = (field: FocusedField) => {
    setFocusedField(field);
  };

  const handleSaveField = () => {
    setFocusedField(null);
  };

  const handleClearField = () => {
    if (focusedField === 'call_notes') {
      handleInputChange('call_notes', '');
    } else if (focusedField === 'gpt_summary') {
      handleInputChange('gpt_call_summary', '');
    } else if (focusedField === 'internal_comments') {
      handleInputChange('internal_comments', '');
    }
  };

  const getFieldTitle = () => {
    switch (focusedField) {
      case 'call_notes':
        return 'Call Notes';
      case 'gpt_summary':
        return 'GPT Call Summary';
      case 'internal_comments':
        return 'Internal Comments';
      default:
        return '';
    }
  };

  const getFieldValue = () => {
    switch (focusedField) {
      case 'call_notes':
        return formData.call_notes;
      case 'gpt_summary':
        return formData.gpt_call_summary;
      case 'internal_comments':
        return formData.internal_comments;
      default:
        return '';
    }
  };

  const getFieldPlaceholder = () => {
    switch (focusedField) {
      case 'call_notes':
        return 'Enter detailed call notes...';
      case 'gpt_summary':
        return 'Enter AI-generated call summary...';
      case 'internal_comments':
        return 'Enter internal comments or manager/legal notes...';
      default:
        return '';
    }
  };

  if (!isOpen) return null;

  // Render focused field view for expandable text areas
  if (focusedField) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">
              {getFieldTitle()}
            </h2>
            <button
              onClick={() => setFocusedField(null)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <textarea
              value={getFieldValue()}
              onChange={(e) => {
                const field = focusedField === 'call_notes' ? 'call_notes' : 
                            focusedField === 'gpt_summary' ? 'gpt_call_summary' : 'internal_comments';
                handleInputChange(field, e.target.value);
              }}
              rows={15}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={getFieldPlaceholder()}
            />

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={handleClearField}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleSaveField}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Normal form view
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Post Call Data Entry</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Call Logs Section */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-6 border-b pb-2">Call Logs</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  {/* Call Outcome */}
                  <CommonDropdown
                    label="Call Outcome"
                    value={formData.call_outcome}
                    onChange={(value) => handleInputChange('call_outcome', value)}
                    options={dropdownOptions.callOutcome}
                    error={errors.call_outcome}
                    required
                  />

                  {/* Call Status */}
                  <CommonDropdown
                    label="Call Status"
                    value={formData.call_status}
                    onChange={(value) => handleInputChange('call_status', value)}
                    options={dropdownOptions.callStatus}
                    error={errors.call_status}
                    required
                  />

                  {/* Call Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Call Date
                    </label>
                    <input
                      type="date"
                      value={formData.call_date}
                      onChange={(e) => handleInputChange('call_date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Phone Validity Status Fields */}
                  <CommonDropdown
                    label="Phone  - Validity Status"
                    value={formData.phone_validity_status}
                    onChange={(value) => handleInputChange('phone_validity_status', value)}
                    options={dropdownOptions.phoneValidityStatus}
                  />
                </div>

                <div className="space-y-6">

                  {/* Call Notes - Expandable */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Call Notes
                      </label>
                      <button
                        type="button"
                        onClick={() => handleFieldFocus('call_notes')}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Expand
                      </button>
                    </div>
                    <textarea
                      value={formData.call_notes}
                      onChange={(e) => handleInputChange('call_notes', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Rep notes from the call..."
                    />
                  </div>

                  {/* GPT Call Summary - Expandable */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        GPT Call Summary
                      </label>
                      <button
                        type="button"
                        onClick={() => handleFieldFocus('gpt_summary')}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Expand
                      </button>
                    </div>
                    <textarea
                      value={formData.gpt_call_summary}
                      onChange={(e) => handleInputChange('gpt_call_summary', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="AI-generated summary (optional)..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Properties Section */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-6 border-b pb-2">Properties</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  {/* Lead Stage */}
                  <CommonDropdown
                    label="Lead Stage"
                    value={formData.lead_stage}
                    onChange={(value) => handleInputChange('lead_stage', value)}
                    options={dropdownOptions.leadStage}
                  />

                  {/* Property Standing */}
                  <CommonDropdown
                    label="Property Standing"
                    value={formData.property_standing}
                    onChange={(value) => handleInputChange('property_standing', value)}
                    options={dropdownOptions.propertyStanding}
                  />

                  {/* Disposition Interest */}
                  <CommonDropdown
                    label="Disposition Interest"
                    value={formData.disposition_interest}
                    onChange={(value) => handleInputChange('disposition_interest', value)}
                    options={dropdownOptions.dispositionInterest}
                  />

                  {/* Deal Urgency */}
                  <CommonDropdown
                    label="Deal Urgency"
                    value={formData.deal_urgency}
                    onChange={(value) => handleInputChange('deal_urgency', value)}
                    options={dropdownOptions.dealUrgency}
                  />
                </div>

                <div className="space-y-6">
                  {/* Rep Flag */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rep Flag
                    </label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="red_flag"
                        checked={formData.red_flag}
                        onChange={(e) => handleInputChange('red_flag', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-200 rounded"
                      />
                      <label htmlFor="red_flag" className="ml-2 text-sm text-gray-700">
                        Yes if issue needs review
                      </label>
                    </div>
                  </div>

                  {/* Flag Reason */}
                  <CommonDropdown
                    label="Flag Reason"
                    value={formData.flag_reason}
                    onChange={(value) => handleInputChange('flag_reason', value)}
                    options={dropdownOptions.flagReason}
                  />

                  {/* Internal Comments - Expandable */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Internal Comments
                      </label>
                      <button
                        type="button"
                        onClick={() => handleFieldFocus('internal_comments')}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Expand
                      </button>
                    </div>
                    <textarea
                      value={formData.internal_comments}
                      onChange={(e) => handleInputChange('internal_comments', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Manager/legal notes..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                className="px-16 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-lg font-medium"
              >
                Save
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PostCallForm;