import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { BookOpen, ChevronLeft, Ellipsis, History, UserRound } from 'lucide-react';
import './mini.css';

export default function MiniLayout() {
  const [largeText, setLargeText] = useState(false);
  const { pathname } = useLocation();
  const isHistoryPage = pathname === '/mini' || pathname.startsWith('/mini/cases/') || pathname === '/mini/chat';
  const isAccountPage = pathname === '/mini/settings' || pathname === '/mini/help';

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Eh?Bot — ตัวอย่าง Mini App';
    return () => { document.title = previousTitle; };
  }, []);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [pathname]);

  return (
    <div className={`mini-root${largeText ? ' mini-large-text' : ''}`}>
      <div className="mini-shell">
        <header className="mini-header">
          <Link to={pathname === '/mini/help' ? '/mini/settings' : '/mini'} className="mini-icon-button" aria-label="กลับหน้าหลัก"><ChevronLeft aria-hidden="true" /></Link>
          <Link to="/mini" className="mini-header-brand">Eh?Bot</Link>
          <Link to="/mini/help" className="mini-icon-button" aria-label="วิธีใช้งาน"><Ellipsis aria-hidden="true" /></Link>
        </header>
        <p className="mini-demo-notice">ตัวอย่าง · ข้อมูลสมมติ · ยังไม่เชื่อม LINE</p>
        <main className="mini-content" id="mini-main"><Outlet context={{ largeText, setLargeText }} /></main>
        <nav className="mini-navigation" aria-label="เมนูหลัก">
          <Link to="/mini" className={isHistoryPage ? 'active' : undefined} aria-current={isHistoryPage ? 'page' : undefined}><History aria-hidden="true" />ประวัติ</Link>
          <NavLink to="/mini/lessons"><BookOpen aria-hidden="true" />เรียนรู้</NavLink>
          <Link to="/mini/settings" className={isAccountPage ? 'active' : undefined} aria-current={isAccountPage ? 'page' : undefined}><UserRound aria-hidden="true" />บัญชี</Link>
        </nav>
      </div>
    </div>
  );
}
