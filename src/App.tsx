import { AuthProvider } from './context/AuthContext';
import { RouterProvider } from 'react-router-dom';
import router from './router';
import config from './config';
import { Amplify } from 'aws-amplify';

Amplify.configure(config)
console.log("config",config)

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;