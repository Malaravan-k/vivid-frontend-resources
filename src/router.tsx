import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import CasesTable from './pages/cases/CasesTable';
import CaseDetail from './pages/cases/CaseDetail';
import MobileTable from './pages/mobile/MobileTable';
import MobileDetail from './pages/mobile/MobileDetail';
import SettingsPage from './pages/settings/SettingsTable.jsx';
import MessagesTable from './pages/messages/MessagesTable';
import ChatScreen from './pages/messages/ChatScreen';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Layout requireAuth={false}><Login /></Layout>,
  },
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/cases',
    element: <Layout><CasesTable /></Layout>,
  },
  {
    path: '/cases/:id',
    element: <Layout><CaseDetail /></Layout>,
  },
  {
    path: '/mobile',
    element: <Layout><MobileTable /></Layout>,
  },
  {
    path: '/mobile/:id',
    element: <Layout><MobileDetail /></Layout>,
  },
  {
    path: '/messages',
    element: <Layout><MessagesTable /></Layout>,
  },
  {
    path: '/messages/:id',
    element: <Layout><ChatScreen /></Layout>,
  },
  {
    path: '/settings',
    element: <Layout><SettingsPage /></Layout>,
  },
]);

export default router;