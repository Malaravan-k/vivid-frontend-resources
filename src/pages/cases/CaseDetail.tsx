import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLoaderData, useLocation } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { ArrowLeft, Calendar, Phone, Mic, User } from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge';
import Calling from '../../components/CaseDetails/Calling';
import { casesActions } from '../../store/actions/cases.actions';
import { dispatch,RootState} from '../../store';
import { useSelector } from 'react-redux';

const CaseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation()
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<any | null>(null);
  const {loading , record} = useSelector((state:RootState)=>state.caseReducer)
  const [isCalling, setIsCalling] = useState<Boolean | null>(false)

  useEffect(()=>{
    setCaseData(record)
  },[record])
  console.log("caseData::::::::",caseData)
  useEffect(()=>{
    dispatch(casesActions.loadRecord(id))
  },[])
  const navigation_state = location.state
  console.log("navigation_state",navigation_state)
  const phoneNumbers = [
    caseData?.phones[0],
    caseData?.phones[1],
    caseData?.phones[2],
  ].filter(Boolean);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!caseData) {
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
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Case Details</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">ID: {caseData.case_id}</p>
          </div>
        </div>
        
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg shadow-md space-y-6">
      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Owner Information</h4>

      <div className="space-y-2">
        <div>
          <p className="text-xs text-gray-500">Name: <span className="text-sm font-medium">{navigation_state?.ownerName || 'N/A'}</span></p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Address:</p>
          <p className="text-sm font-medium">{caseData.address || 'N/A'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Phone 1: <span className="text-sm font-medium">{phoneNumbers[0] || 'N/A'}</span></p>
          <p className="text-xs text-gray-500">Phone 1: <span className="text-sm font-medium">{phoneNumbers[0] || 'N/A'}</span></p>
          <p className="text-xs text-gray-500">Phone 1: <span className="text-sm font-medium">{phoneNumbers[0] || 'N/A'}</span></p>
        </div>
      

        {phoneNumbers.length > 0 && (
          <div className="flex gap-2 pt-2">
            {phoneNumbers.map((phone, index) => (
              <a
                key={index}
                href={`tel:${phone}`}
                className="bg-blue-100 text-blue-600 text-sm px-4 py-1 rounded-full hover:bg-blue-200 transition"
              >
                Phone {index + 1}
              </a>
            ))}
          </div>
        )}
      </div>

      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Property Information</h4>
      <div className="space-y-2">
        <div>
          <p className="text-xs text-gray-500">Assessed Value: 
            <span className="text-sm font-medium">${caseData.assessed_value?.toLocaleString() || 'N/A'}</span>
            </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Amount Owed:
            <span className="text-sm font-medium">${caseData.amount_owed?.toLocaleString() || 'N/A'}</span>
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Equity Status:
            <span className="text-sm font-medium">{caseData.equity_status || 'N/A'}</span>
          </p>
          
        </div>
        <div>
          <p className="text-xs text-gray-500">GPT Strategy Recommendation:</p>
          <p className="text-sm font-medium">{caseData.strategy || 'N/A'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Urgency Score (GPT):</p>
          <p className="text-sm font-medium">{caseData.urgencyScore || 'N/A'}</p>
        </div>
      </div>
    </div>
            {
              isCalling ? <Calling/> :
              <div className="flex flex-col">
              <div className="flex-1 flex flex-col items-center justify-center p-6 border border-gray-200 rounded-lg mb-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <User className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium">{caseData.ownerName}</h3>
                <p className="text-sm text-gray-500">{caseData.contactNumber}</p>
                
                <div className="flex mt-6 space-x-4">
                  <Button variant="outline" size="sm" onClick={()=>setIsCalling(true)}>
                    <Phone className="h-4 w-4 mr-2" /> Call
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mic className="h-4 w-4 mr-2" /> Record
                  </Button>
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" /> Schedule
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Call Status</h4>
                  <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                    <option>Contacted</option>
                    <option>Pending</option>
                    <option>Not Reachable</option>
                    <option>Follow Up</option>
                  </select>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Urgency Score</h4>
                  <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                    <option>1 - Low</option>
                    <option>2 - Medium</option>
                    <option selected>3 - High</option>
                    <option>4 - Critical</option>
                  </select>
                </div>
              </div>
            </div>
            }
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button variant="outline" className="mr-3">Cancel</Button>
            <Button>Save Changes</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseDetail;