// twilioDevice.ts
import { Device } from '@twilio/voice-sdk';

let device: Device | null = null;

export const initializeDevice = (
  token: string,
  onIncomingCall: Function,
  onStatusChange: Function,
  callAcceptedRef: React.MutableRefObject<boolean>
): Device => {
  if (device) {
    device.destroy();
  }
  
  device = new Device(token);
  
  device.on('registered', () => {
    console.log('Twilio.Device registered');
    onStatusChange('Device registered');
  });

  device.on('incoming', (conn: any) => {
    onIncomingCall(conn);
    onStatusChange('incoming');

    setTimeout(() => {
      if (!callAcceptedRef.current) {
        conn.reject();
        onStatusChange('Missed Call');
      }
    }, 30000);
  });

  device.on('ready', () => onStatusChange('Device ready'));
  device.on('disconnect', () => onStatusChange('Call disconnected'));
  device.on('error', (error: any) => onStatusChange(`Error: ${error.message}`));

  device.register();
  return device;
};

export const getDevice = (token?: string): Device | null => {
  if (!device && token) {
    device = new Device(token);
    device.register();
    device.on('registered', () => console.log('Twilio.Device registered'));
  }
  return device;
};

export const disconnectDevice = () => {
  if (device) {
    device.disconnectAll();
  }
};

export const connectCall = (params: any) => {
  if (device) {
    return device.connect({ params });
  }
  return null;
};