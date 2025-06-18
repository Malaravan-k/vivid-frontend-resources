import { AuthProvider } from './context/AuthContext';
import { RouterProvider } from 'react-router-dom';
import router from './router';
import config from './config';
import { Amplify } from 'aws-amplify';
import Snackbar from './components/ui/Snackbar';
import {SocketProvider} from './context/SocketContext'

Amplify.configure(config)

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
      <RouterProvider router={router} />
      <Snackbar/>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;