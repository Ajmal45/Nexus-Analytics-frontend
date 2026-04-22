import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import ThemeToggle from './ThemeToggle';

export default function Layout({ allowedRole }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'} replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--app-bg)] text-[var(--text-primary)]">
      <Sidebar role={user.role} />
      <main className="flex-1 overflow-y-auto bg-[var(--app-bg)]">
        <div className="sticky top-0 z-20 flex justify-end border-b border-[var(--border-soft)] bg-[color:var(--app-bg)]/90 px-6 py-4 backdrop-blur xl:px-8">
          <ThemeToggle />
        </div>
        <div className="p-6 xl:p-8">
        <Outlet />
        </div>
      </main>
    </div>
  );
}
