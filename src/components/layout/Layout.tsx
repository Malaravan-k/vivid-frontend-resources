import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';
import { useSelector } from 'react-redux';
import {RootState} from '../../store/index'
interface LayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
}

const Layout = ({ children }: LayoutProps) => {
  const { loading } = useAuth();
  const { isLoggedIn ,user} = useSelector((state: RootState) => state.sessionReducer);
   
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!loading && isLoggedIn && window.location.pathname === "/login") {
  return <Navigate to="/cases" replace />;
}


  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ECF2FF' }}>
      {isLoggedIn && <Navbar />}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
  
};

export default Layout;