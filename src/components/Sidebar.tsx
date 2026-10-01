// =============================================
// Senior Guard — Sidebar Component
// =============================================

import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShieldAlert, MessagesSquare, Database } from 'lucide-react';

const menuItems = [
  { label: 'Overview', path: '/', icon: LayoutDashboard },
  { label: 'Connected LINE groups', path: '/line-groups', icon: MessagesSquare },
  { label: 'Threat History', path: '/threat-logs', icon: ShieldAlert },
  { label: 'dataset', path: '/dataset', icon: Database },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-shield">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-title">Dashboard</span>
          <span className="sidebar-logo-subtitle">Scam Detection</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
