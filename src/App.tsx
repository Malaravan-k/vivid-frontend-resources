import { AuthProvider } from './context/AuthContext';
import { RouterProvider } from 'react-router-dom';
import router from './router';
import config from './config';
import { Amplify } from 'aws-amplify';
import Snackbar from './components/ui/Snackbar';

Amplify.configure(config)

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Snackbar/>
    </AuthProvider>
  );
}

export default App;