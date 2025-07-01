import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { ArrowLeft, Phone, Home, User, DollarSign, AlertCircle, BarChart2, Clock, Lock } from 'lucide-react';
import { casesActions } from '../../store/actions/cases.actions';
import { dispatch, RootState } from '../../store';
import { useSelector } from 'react-redux';
import { useCall } from '../../context/CallContext';
import PhoneDashboard from './PhoneDashboard';

const CaseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeCall, setCallStatus } = useCall()
  const location = useLocation();
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<string | null>(null);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [caseData, setCaseData] = useState<any | null>(null);
  const { loading, record } = useSelector((state: RootState) => state.caseReducer)
  
  const agentNumber = localStorage.getItem('primary_mobile_number')
  const caseId = record?.case_number

  useEffect(() => {
    if (activeCall) {
      setSelectedPhoneNumber(activeCall?.ownerNumber)
      // Also update selectedPhone when activeCall changes
      const phoneField = getPhoneFieldForNumber(activeCall?.ownerNumber);
      setSelectedPhone(phoneField);
    }
  }, [activeCall])

  // Function to get which phone field contains a specific phone number
  const getPhoneFieldForNumber = (phoneNumber: string | null) => {
    if (!phoneNumber || !caseData) return null;
    
    const phoneFields = ['Phone_1', 'Phone_2', 'Phone_3'];
    
    for (const field of phoneFields) {
      const fieldValue = caseData[field];
      let storedNumber = null;
      
      if (Array.isArray(fieldValue) && fieldValue.length > 0) {
        storedNumber = fieldValue[0].toString().trim();
      } else if (typeof fieldValue === 'string') {
        storedNumber = fieldValue.trim();
      }
      
      if (storedNumber === phoneNumber) {
        return field;
      }
    }
    
    return null;
  };

  // Updated function to extract phone numbers from Phone_1, Phone_2, Phone_3 format
  const extractPhoneNumbers = (caseRecord: any) => {
    if (!caseRecord) return [];
    
    const phoneNumbers = [];
    
    // Check Phone_1, Phone_2, Phone_3 fields
    const phoneFields = ['Phone_1', 'Phone_2', 'Phone_3'];
    
    phoneFields.forEach(field => {
      const phoneValue = caseRecord[field];
      
      // Handle both array format and direct string format
      let phoneNumber = null;
      if (Array.isArray(phoneValue) && phoneValue.length > 0 && phoneValue[0]) {
        phoneNumber = phoneValue[0].toString().trim();
      } else if (typeof phoneValue === 'string' && phoneValue.trim()) {
        phoneNumber = phoneValue.trim();
      }
      
      // Add phone number if it exists and is not empty
      if (phoneNumber && phoneNumber !== '') {
        phoneNumbers.push(phoneNumber);
      }
    });
    
    return phoneNumbers;
  };

  useEffect(() => {
    if (record) {
      setCaseData(record);
    }

    const phoneNumbers = extractPhoneNumbers(record);

    if (phoneNumbers.length > 0) {
      // If there's an active call, prioritize the active call's owner number
      if (activeCall?.ownerNumber) {
        const matchedPhone = phoneNumbers.find((phone: any) => phone === activeCall.ownerNumber);
        if (matchedPhone) {
          setSelectedPhoneNumber(matchedPhone);
          setSelectedPhone(getPhoneFieldForNumber(matchedPhone));
        } else if (phoneNumbers.length > 0) {
          // If active call number not in list, still select first available
          setSelectedPhoneNumber(phoneNumbers[0]);
          setSelectedPhone(getPhoneFieldForNumber(phoneNumbers[0]));
        }
      } else {
        // No active call - check if URL param matches a phone number
        const matchedPhone = phoneNumbers.find((phone: any) => phone === id);
        if (matchedPhone) {
          setSelectedPhoneNumber(matchedPhone);
          setSelectedPhone(getPhoneFieldForNumber(matchedPhone));
        } else if (phoneNumbers.length > 0) {
          // Default to first number if no match
          // setSelectedPhoneNumber(phoneNumbers[0]);
          // setSelectedPhone(getPhoneFieldForNumber(phoneNumbers[0]));
        }
      }
    }
  }, [record, id, activeCall]);

  useEffect(() => {
    dispatch(casesActions.loadRecord(id, navigate))
  }, [id])

  const phoneNumbers = extractPhoneNumbers(caseData);

  useEffect(() => {
    if (location.state?.incoming) {
      const incomingCallNumber = location.state.callerNumber;
      if (incomingCallNumber && phoneNumbers.includes(incomingCallNumber)) {
        setSelectedPhoneNumber(incomingCallNumber);
        setSelectedPhone(getPhoneFieldForNumber(incomingCallNumber));
      }
    }
  }, [location.state, phoneNumbers]);

  const getUrgencyColor = (score: any) => {
    if (!score) return 'bg-gray-200';
    if (score >= 8) return 'bg-red-500';
    if (score >= 5) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Check if phone number selection should be disabled
  const isPhoneSelectionDisabled = (phone: any) => {
    return activeCall && activeCall.ownerNumber !== phone;
  };

  const handlePhoneNumberClick = (phone: any) => {
    // Only allow selection if there's no active call or if it's the active call's number
    if (!activeCall || activeCall.ownerNumber === phone) {
      setSelectedPhoneNumber(phone);
      setSelectedPhone(getPhoneFieldForNumber(phone)); // Update selectedPhone when clicking
      setCallStatus('Device ready')
    }
  };

  const getPhoneLabel = (phone: string, index: number) => {
    const phoneFields = ['Phone_1', 'Phone_2', 'Phone_3'];
    const labels = ['Phone 1', 'Phone 2', 'Phone 3'];
    
    // Find which field this phone number came from
    for (let i = 0; i < phoneFields.length; i++) {
      const fieldValue = caseData?.[phoneFields[i]];
      let phoneNumber = null;
      
      if (Array.isArray(fieldValue) && fieldValue.length > 0) {
        phoneNumber = fieldValue[0].toString().trim();
      } else if (typeof fieldValue === 'string') {
        phoneNumber = fieldValue.trim();
      }
      
      if (phoneNumber === phone) {
        return labels[i] || `Phone ${i + 1}`;
      }
    }
    
    return `Phone ${index + 1}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!caseData || Object.keys(caseData).length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-10">
          <h3 className="text-lg font-medium text-gray-900">Case not found</h3>
          <p className="mt-2 text-sm text-gray-500">The case you're looking for doesn't exist or you don't have access.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate('/cases')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cases
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button
          className='py-2 '
          variant="outline"
          size="md"
          onClick={() => navigate('/cases')}
        >
          <ArrowLeft className="mr-2 h-4 w-4 font-bold" /> Back to Cases
        </Button>

        {caseData?.case_id && (
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-md font-medium">
            Case ID: {caseData.case_id}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Owner Information Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <User className="h-5 w-5" /> Owner Information
              </h2>
            </div>

            <div className="p-6 space-y-3">
              {/* Phone Numbers Section */}
              <div className="px-6 py-2 space-y-2 ">
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="h-6 w-6" />
                  <span className="font-medium">Contact Numbers ({phoneNumbers.length})</span>
                  {activeCall && (
                    <div className="flex items-center gap-1 text-orange-600 text-sm">
                      <Lock className="h-4 w-4" />
                      <span>Call Active</span>
                    </div>
                  )}
                </div>

                {phoneNumbers.length > 0 ? (
                  <div className="space-x-5 space-y-4">
                    {phoneNumbers.map((phone: any, index: any) => {
                      const isDisabled = isPhoneSelectionDisabled(phone);
                      const isSelected = selectedPhoneNumber === phone;
                      const isActiveCallNumber = activeCall?.ownerNumber === phone;
                      const phoneLabel = getPhoneLabel(phone, index);

                      return (
                        <button
                          key={index}
                          onClick={() => handlePhoneNumberClick(phone)}
                          disabled={isDisabled}
                          className={`text-left px-4 py-2 rounded-lg transition-all duration-200 ${isSelected
                              ? 'bg-blue-600 text-white shadow-md'
                              : isDisabled
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-slate-100 hover:bg-gray-100 cursor-pointer'
                            }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="text-sm font-medium flex items-center gap-2">
                                {isSelected ? 'Active' : phoneLabel}
                                {isActiveCallNumber && (
                                  <Lock className="h-3 w-3" />
                                )}
                              </div>
                              <div className={`text-sm font-semibold ${isSelected
                                  ? 'text-white'
                                  : isDisabled
                                    ? 'text-gray-400'
                                    : 'text-gray-800'
                                }`}>
                                {phone}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-gray-50 p-3 rounded-lg text-center text-gray-500">
                    No phone numbers available
                  </div>
                )}
              </div>
              {/*Owner Informations */}
              <div className="px-6 py-4 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Owner Name</h3>
                    <p className="text-md font-semibold text-gray-900">
                      {caseData?.Full_Name || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Home className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Property Address</h3>
                    <p className="text-md font-semibold text-gray-900">
                      {caseData.Property_Address || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Assessed Value</h3>
                    <p className="text-md font-semibold text-gray-900">
                      {caseData.Assessed_Value?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Amount Owed</h3>
                    <p className="text-md font-semibold text-gray-900">
                      {caseData.Amount_Owed?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <BarChart2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Equity Status</h3>
                    <p className="text-md font-semibold text-gray-900">
                      {caseData.Equity_Status || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-6 py-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-100 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" /> GPT Strategy
                    </h3>
                    <p className="mt-2 text-gray-800 font-medium">
                      {caseData.gpt_recommendation || 'No recommendation available'}
                    </p>
                  </div>

                  <div className="bg-slate-100 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                        <Clock className="h-4 w-4" /> Urgency Score
                      </h3>
                      {caseData.Urgency_Score && (
                        <div className={`h-3 w-3 rounded-full ${getUrgencyColor(caseData.urgency_score)}`}></div>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      {caseData.Urgency_Score ? (
                        <>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full ${getUrgencyColor(caseData.urgency_score)}`}
                              style={{ width: `${(caseData.urgency_score / 10) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-gray-800 font-bold">{caseData.urgency_score}/10</span>
                        </>
                      ) : (
                        <span className="text-gray-500">N/A</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className=" space-y-6">
          {/* Phone Dashboard */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Phone className="h-5 w-5" /> Communication Dashboard
              </h2>
            </div>
            <div className="p-6">
              <PhoneDashboard
                agentNumber={agentNumber}
                ownerNumber={selectedPhoneNumber}
                caseId={caseId}
                selectedPhoneField={selectedPhone} 
                ownerName = {caseData?.Full_Name}// Pass the phone field to PhoneDashboard if needed
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseDetail;