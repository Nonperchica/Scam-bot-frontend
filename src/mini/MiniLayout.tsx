import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { BookOpen, ChevronLeft, CircleHelp, History, UserRound } from 'lucide-react';
import './mini.css';
import { useMiniSession } from './services/useMiniSession';

const LARGE_TEXT_KEY = 'mini-large-text';

// อ่านค่าที่ผู้ใช้เลือกไว้ ถ้าเบราว์เซอร์ไม่ให้ใช้ localStorage (เช่นโหมดส่วนตัว) ให้ใช้ขนาดปกติ
function readSavedLargeText(): boolean {
  try {
    return window.localStorage.getItem(LARGE_TEXT_KEY) === 'true';
  } catch {
    return false;
  }
}

export default function MiniLayout() {
  const [largeText, setLargeText] = useState(readSavedLargeText);
  const { pathname, search } = useLocation();
  const live = pathname === '/mini/result' || pathname.startsWith('/mini/result/');
  const caseId = new URLSearchParams(search).get('case') || '';
  const session = useMiniSession(live, caseId);
  const { miniHref } = session;
  const isHistoryPage = live ? pathname === '/mini/result' || pathname.endsWith('/history') : pathname === '/mini' || pathname.startsWith('/mini/cases/') || pathname === '/mini/chat';
  const isAccountPage = pathname.endsWith('/settings') || pathname.endsWith('/help');
  const isLessonsPage = pathname.endsWith('/lessons');
  // หน้าแรกคือหน้ารายการประวัติ อยู่หน้านี้แล้วจึงไม่ต้องมีปุ่มย้อนกลับ
  const isHomePage = live ? pathname === '/mini/result' || pathname.endsWith('/history') : pathname === '/mini';

  useEffect(() => {
    try {
      window.localStorage.setItem(LARGE_TEXT_KEY, String(largeText));
    } catch {
      // บันทึกไม่ได้ก็ยังใช้งานต่อได้ แค่โหลดหน้าใหม่แล้วกลับเป็นขนาดปกติ
    }
  }, [largeText]);

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
          {isHomePage
            ? <span className="mini-icon-placeholder" aria-hidden="true" />
            : <Link to={miniHref(pathname.endsWith('/help') ? 'settings' : 'history')} className="mini-icon-button" aria-label="กลับหน้าหลัก"><ChevronLeft aria-hidden="true" /></Link>}
          <Link to={miniHref('history')} className="mini-header-brand">Eh?Bot</Link>
          <Link to={miniHref('help')} className="mini-icon-button" aria-label="วิธีใช้งาน"><CircleHelp aria-hidden="true" /></Link>
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
