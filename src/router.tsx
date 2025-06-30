// router.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import CasesTable from './pages/cases/CasesTable';
import CaseDetail from './pages/cases/CaseDetail';
import SettingsPage from './pages/settings/SettingsTable.jsx';
import VoiceMails from './pages/VoiceMails/VoiceMails.tsx';
import ChatApp from './pages/Messages/ChatApp.tsx';
import VoiceTable from './pages/VoiceMessage/VoiceTable.js';
import AdminRoute from './AdminRoute';
import NonAdminRoute from './NonAdminRoutes';

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
    element: (
      <Layout>
        <NonAdminRoute>
          <CasesTable />
        </NonAdminRoute>
      </Layout>
    ),
  },
  {
    path: '/cases/:id',
    element: (
      <Layout>
        <NonAdminRoute>
          <CaseDetail />
        </NonAdminRoute>
      </Layout>
    ),
  },
  {
    path: '/messages',
    element: (
      <Layout>
        <NonAdminRoute>
          <ChatApp/>
        </NonAdminRoute>
      </Layout>
    ),
  },
  {
    path: '/callLogs',
    element: (
      <Layout>
        <NonAdminRoute>
          <VoiceTable />
        </NonAdminRoute>
      </Layout>
    ),
  },
  {
    path: '/voiceMails',
    element: (
      <Layout>
        <NonAdminRoute>
          <VoiceMails />
        </NonAdminRoute>
      </Layout>
    ),
  },
  {
    path: '/settings',
    element: (
      <Layout>
        <AdminRoute>
          <SettingsPage />
        </AdminRoute>
      </Layout>
    ),
  },

]);

export default router;
