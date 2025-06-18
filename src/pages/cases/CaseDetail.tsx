import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import { casesActions } from '../../store/actions/cases.actions';
import { dispatch, RootState } from '../../store';
import { useSelector } from 'react-redux';
import PhoneDashboard from './PhoneDashboard';

const CaseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<string | null>(null);
  const [caseData, setCaseData] = useState<any | null>(null);
  const { loading, record } = useSelector((state: RootState) => state.caseReducer)
  const { user } = useSelector((state: RootState) => state.sessionReducer)
  const agentNumber = localStorage.getItem('primary_mobile_number')
  const caseId = record?.case_id
  console.log("location:",location)

useEffect(() => {
  setCaseData(record);

  if (record?.phones && Array.isArray(record.phones)) {
    // Clean phone numbers
    const validPhones = record.phones.filter(phone => phone && phone.trim() !== '');
    console.log("validPhones",validPhones) 
    // If the URL id matches one of the phone numbers, select it
    const matchedPhone = validPhones.find(phone => phone === id);

    if (matchedPhone) {
      setSelectedPhoneNumber(matchedPhone);
    } else if (validPhones.length > 0) {
      // Otherwise select the first one by default
      setSelectedPhoneNumber(validPhones[0]);
    }
  }
}, [record, id]);


  useEffect(() => {
    dispatch(casesActions.loadRecord(id))
  }, [id])
  
  // Filter out empty/null phone numbers and get all valid ones
  const phoneNumbers = Array.isArray(caseData?.phones)
    ? caseData.phones.filter(phone => phone && phone.trim() !== '')
    : [];

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
    <>
      {caseData ? (
        <div>
          <div className="mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/cases')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cases
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-10 rounded-lg shadow-md space-y-6">
                  <h4 className="text-lg font-medium text-gray-800 uppercase tracking-wider">Owner Information</h4>

                  <div className="space-y-2">
                    <div>
                      <p className="text-md text-gray-900">Name: <span className="text-sm font-medium text-gray-500">{caseData?.owner_name || 'N/A'}</span></p>
                    </div>
                    <div>
                      <p className="text-md text-gray-900">Address: <span className="text-sm font-medium text-gray-500">{caseData.address || 'N/A'}</span></p>
                    </div>
                    
                    {/* Dynamic phone number display */}
                    <div>
                      {phoneNumbers.length > 0 ? (
                        phoneNumbers.map((phone, index) => (
                          <p key={index} className="text-md text-gray-900">
                            Phone {index + 1}: <span className="text-sm font-medium text-gray-500">{phone}</span>
                          </p>
                        ))
                      ) : (
                        <p className="text-md text-gray-900">Phone: <span className="text-sm font-medium text-gray-500">N/A</span></p>
                      )}
                    </div>

                    {/* Dynamic phone selection buttons */}
                    {phoneNumbers.length > 0 && (
                      <div className='flex gap-2 flex-wrap'>
                        {phoneNumbers.map((phone, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedPhoneNumber(phone)}
                            className={`text-sm px-4 py-1 rounded-full transition border ${
                              selectedPhoneNumber === phone
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-blue-100 text-blue-600 border-blue-200 hover:bg-blue-200'
                            }`}
                          >
                            Phone {index + 1}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <h4 className="text-lg font-medium text-gray-800 uppercase tracking-wider">Property Information</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-md text-gray-900">Assessed Value:
                        <span className="text-sm font-medium text-gray-500">{caseData.assessed_value?.toLocaleString() || 'N/A'}</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-md text-gray-900">Amount Owed:
                        <span className="text-sm font-medium text-gray-500">{caseData.amount_owed?.toLocaleString() || 'N/A'}</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-md text-gray-900">Equity Status:
                        <span className="text-sm font-medium text-gray-500">{caseData.equity_status || 'N/A'}</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-md text-gray-900">GPT Strategy Recommendation: <span className="text-sm font-medium text-gray-500">{caseData.gpt_recommendation || 'N/A'}</span></p>
                    </div>
                    <div>
                      <p className="text-md text-gray-900">Urgency Score (GPT): <span className="text-sm font-medium text-gray-500">{caseData.urgency_score || 'N/A'}</span></p>
                    </div>
                  </div>
                </div>
                <div>
                  <PhoneDashboard agentNumber={agentNumber} ownerNumber={selectedPhoneNumber} caseId={caseId}/>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
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
      )}
    </>
  );
};

export default CaseDetail;