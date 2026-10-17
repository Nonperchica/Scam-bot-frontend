import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { BookOpen, ChevronLeft, Ellipsis, History, UserRound } from 'lucide-react';
import './mini.css';
import { useMiniSession } from './services/useMiniSession';

export default function MiniLayout() {
  const [largeText, setLargeText] = useState(false);
  const { pathname, search } = useLocation();
  const live = pathname === '/mini/result' || pathname.startsWith('/mini/result/');
  const caseId = new URLSearchParams(search).get('case') || '';
  const session = useMiniSession(live, caseId);
  const { miniHref } = session;
  const isHistoryPage = live ? pathname === '/mini/result' || pathname.endsWith('/history') : pathname === '/mini' || pathname.startsWith('/mini/cases/') || pathname === '/mini/chat';
  const isAccountPage = pathname.endsWith('/settings') || pathname.endsWith('/help');
  const isLessonsPage = pathname.endsWith('/lessons');

  useEffect(() => {
    const previousTitle = document.title;
    document.title = live ? 'Eh?Bot — เพื่อนรู้ทันมิจฉาชีพ' : 'Eh?Bot — ตัวอย่าง Mini App';
    return () => { document.title = previousTitle; };
  }, [live]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [pathname]);

  return (
    <div className={`mini-root${largeText ? ' mini-large-text' : ''}`}>
      <div className="mini-shell">
        <header className="mini-header">
          <Link to={miniHref(pathname.endsWith('/help') ? 'settings' : 'history')} className="mini-icon-button" aria-label="กลับหน้าหลัก"><ChevronLeft aria-hidden="true" /></Link>
          <Link to={miniHref('history')} className="mini-header-brand">Eh?Bot</Link>
          <Link to={miniHref('help')} className="mini-icon-button" aria-label="วิธีใช้งาน"><Ellipsis aria-hidden="true" /></Link>
        </header>
        {!live && <p className="mini-demo-notice">ตัวอย่าง · ข้อมูลสมมติ · ยังไม่เชื่อม LINE</p>}
        <main className="mini-content" id="mini-main"><Outlet context={{ largeText, setLargeText, ...session }} /></main>
        <nav className="mini-navigation" aria-label="เมนูหลัก">
          <Link to={miniHref('history')} className={isHistoryPage ? 'active' : undefined} aria-current={isHistoryPage ? 'page' : undefined}><History aria-hidden="true" />ประวัติ</Link>
          <Link to={miniHref('lessons')} className={isLessonsPage ? 'active' : undefined} aria-current={isLessonsPage ? 'page' : undefined}><BookOpen aria-hidden="true" />เรียนรู้</Link>
          <Link to={miniHref('settings')} className={isAccountPage ? 'active' : undefined} aria-current={isAccountPage ? 'page' : undefined}><UserRound aria-hidden="true" />บัญชี</Link>
        </nav>
      </div>
    </div>
  );
}
