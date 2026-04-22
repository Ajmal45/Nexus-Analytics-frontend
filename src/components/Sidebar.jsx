import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, UserSquare2, LogOut } from 'lucide-react';

export default function Sidebar({ role }) {
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
  ];

  const links = role === 'admin' ? adminLinks : userLinks;

  return (
    <div className="flex h-screen w-72 flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] shadow-2xl">
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
  );
}
