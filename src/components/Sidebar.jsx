import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, UserSquare2, LogOut, BriefcaseBusiness, ClipboardList } from 'lucide-react';

export default function Sidebar({ role, mobileOpen = false, onClose = () => {} }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/leads', icon: Users, label: 'Leads Management' },
    { to: '/admin/users', icon: UserSquare2, label: 'Users List' },
  ];

  const userLinks = [
    { to: '/user/dashboard', icon: LayoutDashboard, label: 'Client Section' },
    { to: '/user/tasks', icon: ClipboardList, label: 'My Tasks' },
  ];

  const leadLinks = [
    { to: '/lead/dashboard', icon: BriefcaseBusiness, label: 'Lead Workspace' },
    { to: '/lead/tasks', icon: ClipboardList, label: 'Task Page' },
  ];

  const links = role === 'admin' ? adminLinks : role === 'lead' ? leadLinks : userLinks;

  return (
    <>
    <div
      className={`fixed inset-0 z-30 bg-black/40 transition-opacity md:hidden ${mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      onClick={onClose}
    />
    <div className={`fixed inset-y-0 left-0 z-40 flex h-screen w-[84vw] max-w-72 flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] shadow-2xl transition-transform md:static md:w-72 md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="border-b border-[var(--sidebar-border)] px-6 pb-4 pt-7">
        <h1 className="bg-gradient-to-r from-[#7dd3fc] via-[#60a5fa] to-[#34d399] bg-clip-text text-2xl font-bold text-transparent">Nexus</h1>
        <p className="mt-1 text-sm uppercase tracking-[0.24em] text-[var(--sidebar-muted)]">Analytics</p>
      </div>

      <nav className="flex-1 space-y-2 px-4 py-6">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-300 ${
                  isActive
                    ? 'border border-[var(--sidebar-active-border)] bg-[var(--sidebar-active-bg)] text-white shadow-inner'
                    : 'text-[var(--sidebar-muted)] hover:bg-[var(--sidebar-hover)] hover:text-white'
                }`
              }
            >
              <Icon size={20} />
              <span className="font-medium">{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-[var(--sidebar-border)] p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-rose-300 transition-colors duration-200 hover:bg-rose-500/10 hover:text-rose-200"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
    </>
  );
}
