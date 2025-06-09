import { Device } from '@twilio/voice-sdk';

let device: Device | null = null;
let activeConnection: any = null;

export const initializeDevice = (
  token: string,
  onIncomingCall: (conn: any) => void,
  onStatusChange: (status: string) => void,
): Device | null => {
  try {
    if (device) {
      device.destroy();
      device = null;
    }
    
    device = new Device(token, {
      codecPreferences: ['opus', 'pcmu'],
      closeProtection: true,
    });

    device.on('registered', () => {
      console.log("registered")
      onStatusChange('Device ready');
    });

    device.on('unregistered', () => {
      console.log("unregistered")
      onStatusChange('Device offline');
    });

    device.on('error', (error) => {
      console.log("error")
      console.error('Device error:', error);
      onStatusChange(`Error: ${error.message}`);
    });

    device.on('incoming', (conn) => {
      console.log('Incoming connection:', conn);
      activeConnection = conn; // Store the active connection
      onIncomingCall(conn);
      
      // Setup connection listeners
      conn.on('accept', () => {
        console.log('Call accepted successfully');
        onStatusChange('Call in progress');
      });
      
      conn.on('disconnect', () => {
        console.log('Call disconnected');
        activeConnection = null;
      });
    });

    device.register();
    return device;
  } catch (error) {
    console.error("Device initialization error:", error);
    return null;
  }
};

export const acceptIncomingCall = () => {
  if (!activeConnection) {
    console.error('No active connection to accept');
    return false;
  }
  
  try {
    activeConnection.accept();
    return true;
  } catch (error) {
    console.error('Error accepting call:', error);
    return false;
  }
};

export const rejectIncomingCall = () => {
  if (activeConnection) {
    activeConnection.reject();
    activeConnection = null;
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
    try {
      console.log("Disconnecting all calls");
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