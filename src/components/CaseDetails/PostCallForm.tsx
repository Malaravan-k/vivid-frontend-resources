// PostCallForm.tsx
import React, { useState } from 'react';
import { X } from 'lucide-react';

interface PostCallFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: PostCallFormData) => void;
  callerNumber?: string;
}

export interface PostCallFormData {
  // Call Information
  callOutcome: string;
  callStatus: string;
  callDispositionTag: string;
  followUpDate: string;
  phoneStatus: string;
  validatedPhone: string;
  
  // GPT Information
  urgencyScore: string;
  bankruptcyFlag: boolean;
  litigationFlag: boolean;
  gptSummary: string;
  gptFollowUpPlan: string;
}

type FocusedField = 'summary' | 'followup' | null;

const PostCallForm: React.FC<PostCallFormProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  callerNumber 
}) => {
  const [formData, setFormData] = useState<PostCallFormData>({
    callOutcome: 'Contacted',
    callStatus: 'Open',
    callDispositionTag: 'Contacted -Open',
    followUpDate: '',
    phoneStatus: 'Valid',
    validatedPhone: callerNumber || 'Phone 1',
    urgencyScore: '3',
    bankruptcyFlag: false,
    litigationFlag: false,
    gptSummary: '',
    gptFollowUpPlan: ''
  });

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
    
    if (!formData.callOutcome) newErrors.callOutcome = 'Call outcome is required';
    if (!formData.callStatus) newErrors.callStatus = 'Call status is required';
    if (!formData.callDispositionTag) newErrors.callDispositionTag = 'Call disposition tag is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      console.log("formData", formData);
      onClose();
    }
  };

  const handleFieldFocus = (field: FocusedField) => {
    setFocusedField(field);
  };

  const handleSaveField = () => {
    setFocusedField(null);
  };

  const handleClearField = () => {
    if (focusedField === 'summary') {
      handleInputChange('gptSummary', '');
    } else if (focusedField === 'followup') {
      handleInputChange('gptFollowUpPlan', '');
    }
  };

  if (!isOpen) return null;

  // Render focused field view if either summary or followup is focused
  if (focusedField) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">
              {focusedField === 'summary' ? 'GPT Summary' : 'GPT Follow Up Plan'}
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
              value={focusedField === 'summary' ? formData.gptSummary : formData.gptFollowUpPlan}
              onChange={(e) => 
                handleInputChange(
                  focusedField === 'summary' ? 'gptSummary' : 'gptFollowUpPlan', 
                  e.target.value
                )
              }
              rows={15}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={
                focusedField === 'summary' 
                  ? 'Enter detailed GPT summary...' 
                  : 'Enter detailed GPT follow up plan...'
              }
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
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Left Column */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {/* Call Outcome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Call Outcome
                </label>
                <select
                  value={formData.callOutcome}
                  onChange={(e) => handleInputChange('callOutcome', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.callOutcome ? 'border-red-500' : 'border-gray-200'
                  }`}
                >
                  <option value="Contacted">Contacted</option>
                  <option value="No Answer">No Answer</option>
                  <option value="Voicemail">Voicemail</option>
                  <option value="Busy">Busy</option>
                  <option value="Disconnected">Disconnected</option>
                  <option value="Not Interested">Not Interested</option>
                </select>
                {errors.callOutcome && (
                  <p className="text-red-500 text-sm mt-1">{errors.callOutcome}</p>
                )}
              </div>

              {/* Call Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Call Status
                </label>
                <select
                  value={formData.callStatus}
                  onChange={(e) => handleInputChange('callStatus', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.callStatus ? 'border-red-500' : 'border-gray-200'
                  }`}
                >
                  <option value="Open">Open</option>
                  <option value="Closed">Closed</option>
                  <option value="Pending">Pending</option>
                  <option value="Follow Up">Follow Up</option>
                </select>
                {errors.callStatus && (
                  <p className="text-red-500 text-sm mt-1">{errors.callStatus}</p>
                )}
              </div>

              {/* Call Disposition Tag */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Call Disposition Tag
                </label>
                <select
                  value={formData.callDispositionTag}
                  onChange={(e) => handleInputChange('callDispositionTag', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.callDispositionTag ? 'border-red-500' : 'border-gray-200'
                  }`}
                >
                  <option value="Contacted -Open">Contacted -Open</option>
                  <option value="Contacted -Closed">Contacted -Closed</option>
                  <option value="No Answer -Open">No Answer -Open</option>
                  <option value="Voicemail -Open">Voicemail -Open</option>
                  <option value="Not Interested -Closed">Not Interested -Closed</option>
                </select>
                {errors.callDispositionTag && (
                  <p className="text-red-500 text-sm mt-1">{errors.callDispositionTag}</p>
                )}
              </div>

              {/* Follow up Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Follow up Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.followUpDate}
                    onChange={(e) => handleInputChange('followUpDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Phone Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Status
                </label>
                <select
                  value={formData.phoneStatus}
                  onChange={(e) => handleInputChange('phoneStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Valid">Valid</option>
                  <option value="Invalid">Invalid</option>
                  <option value="Disconnected">Disconnected</option>
                  <option value="Unverified">Unverified</option>
                </select>
              </div>

              {/* Validated Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Validated Phone
                </label>
                <input
                  type="text"
                  value={formData.validatedPhone}
                  onChange={(e) => handleInputChange('validatedPhone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Phone 1"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Urgency Score */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency Score (GPT) :
                </label>
                <select
                  value={formData.urgencyScore}
                  onChange={(e) => handleInputChange('urgencyScore', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>

              {/* Red Flags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Red Flags :
                </label>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="bankruptcy"
                      checked={formData.bankruptcyFlag}
                      onChange={(e) => handleInputChange('bankruptcyFlag', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-200 rounded"
                    />
                    <label htmlFor="bankruptcy" className="ml-2 text-sm text-gray-700">
                      Bankruptcy
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="litigation"
                      checked={formData.litigationFlag}
                      onChange={(e) => handleInputChange('litigationFlag', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-200 rounded"
                    />
                    <label htmlFor="litigation" className="ml-2 text-sm text-gray-700">
                      Litigation
                    </label>
                  </div>
                </div>
              </div>

              {/* Call Disposition Tag (Right Side) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Call Disposition Tag
                </label>
                <select
                  value={formData.callDispositionTag}
                  onChange={(e) => handleInputChange('callDispositionTag', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Contacted -Open">Contacted -Open</option>
                  <option value="Contacted -Closed">Contacted -Closed</option>
                  <option value="No Answer -Open">No Answer -Open</option>
                  <option value="Voicemail -Open">Voicemail -Open</option>
                  <option value="Not Interested -Closed">Not Interested -Closed</option>
                </select>
              </div>

              {/* GPT Summary */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    GPT Summary
                  </label>
                  <button
                    type="button"
                    onClick={() => handleFieldFocus('summary')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Expand
                  </button>
                </div>
                <textarea
                  value={formData.gptSummary}
                  onChange={(e) => handleInputChange('gptSummary', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter GPT summary..."
                />
              </div>

              {/* GPT Follow up plan */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    GPT Follow up plan
                  </label>
                  <button
                    type="button"
                    onClick={() => handleFieldFocus('followup')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Expand
                  </button>
                </div>
                <textarea
                  value={formData.gptFollowUpPlan}
                  onChange={(e) => handleInputChange('gptFollowUpPlan', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter GPT follow up plan..."
                />
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
      </div>
    </div>
  );
};

export default PostCallForm;