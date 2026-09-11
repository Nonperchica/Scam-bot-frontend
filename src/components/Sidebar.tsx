// =============================================
// Senior Guard — Sidebar Component
// =============================================

import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShieldAlert, MessagesSquare } from 'lucide-react';

const menuItems = [
  { label: 'ภาพรวม', path: '/', icon: LayoutDashboard },
  { label: 'กลุ่มไลน์ที่เชื่อมต่อ', path: '/line-groups', icon: MessagesSquare },
  { label: 'ประวัติภัยคุกคาม', path: '/threat-logs', icon: ShieldAlert },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <img
          src="/logo.png"
          alt="Senior Guard Logo"
          className="sidebar-logo-img"
        />
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-title">Senior Guard</span>
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
