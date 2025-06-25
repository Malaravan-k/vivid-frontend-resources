import { AuthProvider } from './context/AuthContext';
import { RouterProvider } from 'react-router-dom';
import router from './router';
import config from './config';
import { Amplify } from 'aws-amplify';
import Snackbar from './components/ui/Snackbar';
import { CallProvider } from './context/CallContext';

Amplify.configure(config)

function App() {
  return (
    <AuthProvider>
      <CallProvider>
      <RouterProvider router={router} />
      <Snackbar/>
      </CallProvider>
    </AuthProvider>
  );
}

export default App;