// =============================================
// Senior Guard — Main Layout
// =============================================

import { Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, Bell, Calendar, CheckCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const pageTitles: Record<string, string> = {
  '/': 'Overview',
  '/line-groups': 'Connected Line groups',
  '/threat-logs': 'Threat History',
  '/dataset': 'Dataset',
};

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Get page title — fallback for dynamic routes
  const pageTitle =
    pageTitles[location.pathname] ||
    (location.pathname.startsWith('/line-groups/') ? '' : '');

  return (
    <>
      {/* Green border frame */}
      <div className="app-frame">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="app-layout">
          {/* Sidebar */}
          <div className={`sidebar-container ${sidebarOpen ? 'sidebar-container--open' : ''}`}>
            <Sidebar />
          </div>

          {/* Main content */}
          <div className="main-content">
            {/* Mobile menu button */}
            <button
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
              style={{ padding: '16px', position: 'absolute', top: 0, left: 0, zIndex: 10 }}
            >
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Top Header Bar */}
            <header className="top-header">
              <div className="top-header-left">
                {pageTitle && <h1 className="top-header-title">{pageTitle}</h1>}
                <div className="system-status">
                  <span className="system-status-dot" />
                  <span>ระบบทำงานปกติ</span>
                </div>
              </div>
              <div className="top-header-right">
                <div className="date-range-picker">
                  <Calendar size={16} />
                  <span>14 ส.ค. – 20 ส.ค. 2569</span>
                  <CheckCircle size={16} className="date-range-check" />
                </div>
                <button className="header-icon-btn" aria-label="Notifications">
                  <Bell size={20} />
                </button>
                <div className="header-user">
                  <div className="header-user-avatar">AD</div>
                  <span className="header-user-name">Admin</span>
                </div>
              </div>
            </header>

            {/* Page content */}
            <main className="page-content">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
