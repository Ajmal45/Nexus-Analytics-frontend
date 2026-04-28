import React, { useState } from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import ThemeToggle from './ThemeToggle';
import { Menu, UserCircle2, X } from 'lucide-react';

export default function Layout({ allowedRole }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'lead' ? '/lead/dashboard' : '/user/dashboard'} replace />;
  }

  const profilePath = user.role === 'lead' ? '/lead/profile' : '/user/profile';

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--app-bg)] text-[var(--text-primary)]">
      <Sidebar role={user.role} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <main className="flex-1 overflow-y-auto bg-[var(--app-bg)]">
        <div className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-[var(--border-soft)] bg-[color:var(--app-bg)]/90 px-4 py-4 backdrop-blur sm:px-6 xl:px-8">
          <button
            type="button"
            onClick={() => setMobileOpen((current) => !current)}
            className="inline-flex items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--panel)] p-2 text-[var(--text-primary)] shadow-sm md:hidden"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="ml-auto flex items-center gap-3">
          {user.role !== 'admin' && (
            <Link
              to={profilePath}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--panel)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] shadow-sm transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
            >
              <UserCircle2 size={16} />
              Profile
            </Link>
          )}
          <ThemeToggle />
          </div>
        </div>
        <div className="p-4 sm:p-6 xl:p-8">
        <Outlet />
        </div>
      </main>
    </div>
  );
}
