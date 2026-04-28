import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Home from './pages/Home';
import Login from './pages/Login';
import Layout from './components/Layout';
import AdminDashboard from './pages/admin/AdminDashboard';
import LeadManagement from './pages/admin/LeadManagement';
import UserManagement from './pages/admin/UserManagement';
import ClientDashboard from './pages/user/ClientDashboard';
import Profile from './pages/user/Profile';
import LeadWorkspace from './pages/lead/LeadWorkspace';
import { ThemeProvider, useTheme } from './components/ThemeProvider';

function AppShell() {
  const { theme } = useTheme();

  return (
    <>
      <Toaster position="top-right" toastOptions={{ 
        style: {
          background: theme === 'dark' ? '#111827' : '#0f172a',
          color: '#fff',
          borderRadius: '16px'
        }
      }} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<Layout allowedRole="admin" />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="leads" element={<LeadManagement />} />
            <Route path="users" element={<UserManagement />} />
          </Route>

          {/* User Routes */}
          <Route path="/user" element={<Layout allowedRole="user" />}>
            <Route path="dashboard" element={<ClientDashboard />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Lead Routes */}
          <Route path="/lead" element={<Layout allowedRole="lead" />}>
            <Route path="dashboard" element={<LeadWorkspace />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  );
}

export default App;
