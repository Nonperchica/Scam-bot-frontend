// =============================================
// Senior Guard — Main Layout
// =============================================

import { Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const pageTitles: Record<string, string> = {
  '/': 'ภาพรวม',
  '/line-groups': 'กลุ่มไลน์ที่เชื่อมต่อ',
  '/threat-logs': 'ประวัติภัยคุกคาม',
};

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const breadcrumb = pageTitles[location.pathname] || '';

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
