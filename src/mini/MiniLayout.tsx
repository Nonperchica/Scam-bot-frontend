import { useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { BookOpen, ChevronLeft, CircleHelp, History, House, UserRound } from 'lucide-react';
import './mini.css';
import { useMiniSession } from './services/useMiniSession';

export default function MiniLayout() {
  const { pathname, search } = useLocation();
  const live = pathname === '/mini/result' || pathname.startsWith('/mini/result/');
  const caseId = new URLSearchParams(search).get('case') || '';
  const session = useMiniSession(live, caseId);
  const { miniHref } = session;
  // หน้าแรก (และหน้าผลตรวจที่เปิดจากแชต) อยู่ใต้แท็บหน้าแรก ตามแบบ mockup
  const isHomeTab = live ? pathname === '/mini/result' : pathname === '/mini' || pathname.startsWith('/mini/cases/') || pathname === '/mini/chat';
  const isHistoryPage = pathname.endsWith('/history');
  const isAccountPage = pathname.endsWith('/settings') || pathname.endsWith('/help') || pathname.endsWith('/recovery');
  const isLessonsPage = pathname.endsWith('/lessons');
  const isDetailPage = live ? pathname === '/mini/result' && Boolean(caseId) : pathname.startsWith('/mini/cases/');
  // หน้าหลักของแต่ละแท็บไม่ต้องมีปุ่มย้อนกลับ
  const showBack = !(live ? pathname === '/mini/result' && !caseId : pathname === '/mini') && !isHistoryPage && !isLessonsPage && !pathname.endsWith('/settings');

  useEffect(() => {
    const previousTitle = document.title;
    document.title = live ? 'Eh?Bot — เพื่อนรู้ทันมิจฉาชีพ' : 'Eh?Bot — ตัวอย่าง Mini App';
    return () => { document.title = previousTitle; };
  }, [live]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [pathname]);

  const tabs = [
    { href: miniHref('home'), active: isHomeTab, icon: House, label: 'หน้าแรก' },
    { href: miniHref('history'), active: isHistoryPage, icon: History, label: 'ประวัติ' },
    { href: miniHref('lessons'), active: isLessonsPage, icon: BookOpen, label: 'เรียนรู้' },
    { href: miniHref('settings'), active: isAccountPage, icon: UserRound, label: 'บัญชี' },
  ];

  return (
    <div className="mini-root">
      <div className="mini-shell">
        <header className="mini-header">
          {showBack
            ? <Link to={miniHref(pathname.endsWith('/help') || pathname.endsWith('/recovery') ? 'settings' : 'history')} className="mini-icon-button" aria-label="กลับหน้าหลัก"><ChevronLeft aria-hidden="true" /></Link>
            : null}
          {isDetailPage ? <span className="mini-header-title">รายละเอียดผลตรวจ</span>
            : <Link to={miniHref('home')} className="mini-header-brand">Eh<span>?</span>Bot</Link>}
          <Link to={miniHref('help')} className="mini-icon-button" aria-label="วิธีใช้งาน"><CircleHelp aria-hidden="true" /></Link>
        </header>
        {!live && <p className="mini-demo-notice">ตัวอย่าง · ข้อมูลสมมติ · ยังไม่เชื่อม LINE</p>}
        <main className="mini-content" id="mini-main"><Outlet context={session} /></main>
        <nav className="mini-navigation" aria-label="เมนูหลัก">
          {tabs.map(tab => <Link key={tab.label} to={tab.href} className={tab.active ? 'active' : undefined} aria-current={tab.active ? 'page' : undefined}><tab.icon aria-hidden="true" />{tab.label}</Link>)}
        </nav>
      </div>
    </div>
  );
}
