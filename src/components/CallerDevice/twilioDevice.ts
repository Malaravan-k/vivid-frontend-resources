import { Device } from '@twilio/voice-sdk';

let device: Device | null = null;

export const initializeDevice = (
  token: string,
  onIncomingCall: (conn: any) => void,
  onStatusChange: (status: string) => void,
  callAcceptedRef: React.MutableRefObject<boolean>
): Device | null => {
  try {
    if (device) {
      console.log("Destroying existing device before re-initializing");
      device.destroy();
      device = null;
    }
    
    device = new Device(token, {
      codecPreferences: ['opus', 'pcmu'],
    });
    device.register();
    
    device.on('registered', () => {
      onStatusChange('Device ready');
    });

    device.on('registering', () => {
      onStatusChange('Connecting device...');
    });

    device.on('unregistered', () => {
      console.log('Twilio device unregistered');
      onStatusChange('Device offline');
    });

    device.on('error', (error: any) => {
      console.error('Twilio device error:', error);
      onStatusChange(`Error: ${error.message}`);
    });

    device.on('incoming', (conn: any) => {
      console.log('Incoming call detected .............', conn);
      callAcceptedRef.current = false;
      onIncomingCall(conn);
    });
    
    
    
    return device;
  } catch (error) {
    console.error("Error initializing Twilio device:", error);
    onStatusChange(`Device initialization error: ${(error as Error).message}`);
    return null;
  }
};

export const getDevice = (token?: string): Device | null => {
  if (!device && token) {
    console.log("Creating new device in getDevice");
    device = new Device(token);
    device.register();
  }
  return device;
};

export const disconnectDevice = () => {
  if (device) {
    console.log("Disconnecting all calls");
    try {
      device.disconnectAll();
    } catch (error) {
      console.error("Error disconnecting device:", error);
    }
  }
};

export const connectCall = (params: any) => {
  if (!device) {
    console.error("Cannot connect call: Device not initialized");
    return null;
  }
  
  try {
    console.log("Connecting call with params:", params);
    return device.connect({ params });
  } catch (error) {
    console.error("Error connecting call:", error);
    return null;
  }
};