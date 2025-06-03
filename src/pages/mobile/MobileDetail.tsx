import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMobileById } from '../../utils/api';
import { Mobile } from '../../types';
import Button from '../../components/ui/Button';
import { ArrowLeft, Calendar, Phone, MessageCircle, Smartphone } from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge';

const MobileDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [mobileData, setMobileData] = useState<Mobile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMobile = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const result = await fetchMobileById(id);
        setMobileData(result);
      } catch (error) {
        console.error('Failed to fetch mobile details:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMobile();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!mobileData) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-10">
          <h3 className="text-lg font-medium text-gray-900">Mobile device not found</h3>
          <p className="mt-2 text-sm text-gray-500">The mobile device you're looking for doesn't exist or you don't have access.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate('/mobile')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Mobile
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
          onClick={() => navigate('/mobile')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Mobile
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Mobile Device Details</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">ID: {mobileData.id}</p>
          </div>
          <StatusBadge status={mobileData.status} />
        </div>
        
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Device Information</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Mobile ID:</p>
                  <p className="text-sm font-medium">{mobileData.id}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Owner ID:</p>
                  <p className="text-sm font-medium">{mobileData.ownerId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Device Type:</p>
                  <p className="text-sm font-medium">{mobileData.deviceType || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Last Contact:</p>
                  <p className="text-sm font-medium">
                    {mobileData.lastContact 
                      ? new Date(mobileData.lastContact).toLocaleString() 
                      : 'Never'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status:</p>
                  <p className="text-sm font-medium">{mobileData.status}</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col">
              <div className="flex-1 flex flex-col items-center justify-center p-6 border border-gray-200 rounded-lg mb-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <Smartphone className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium">{mobileData.ownerName}</h3>
                <p className="text-sm text-gray-500">{mobileData.phoneNumber}</p>
                
                <div className="flex mt-6 space-x-4">
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4 mr-2" /> Call
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageCircle className="h-4 w-4 mr-2" /> Message
                  </Button>
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" /> Schedule
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Connection Status</h4>
                  <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                    <option>Connected</option>
                    <option>Disconnected</option>
                    <option>Unstable</option>
                  </select>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Signal Strength</h4>
                  <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                    <option>Strong</option>
                    <option>Medium</option>
                    <option>Weak</option>
                    <option>None</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button variant="outline" className="mr-3">Reset Device</Button>
            <Button>Update Device</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileDetail;