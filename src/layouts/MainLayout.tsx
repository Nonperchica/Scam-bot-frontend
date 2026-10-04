import { Outlet, useLocation } from 'react-router-dom';
import { useRef } from 'react';
import { CalendarDays, ChevronRight, Menu, ShieldCheck, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const pages: Record<string, { title: string; subtitle: string; english: string }> = {
  '/': { title: 'ภาพรวมระบบ', subtitle: 'มองเห็นความเสี่ยง ดูแลทุกบทสนทนา', english: 'Overview' },
  '/line-groups': { title: 'กลุ่ม LINE ที่เชื่อมต่อ', subtitle: 'ดูแลการสนทนาและติดตามความเสี่ยงในแต่ละกลุ่ม', english: 'LINE groups' },
  '/threat-logs': { title: 'ประวัติความเสี่ยง', subtitle: 'ค้นหาและตรวจสอบข้อความที่ Eh?Bot พบความเสี่ยง', english: 'Threat history' },
  '/dataset': { title: 'ชุดข้อมูล', subtitle: 'จัดการตัวอย่างข้อความสำหรับพัฒนาการตรวจจับ', english: 'Dataset' },
};

export default function MainLayout() {
  const mobileMenu = useRef<HTMLDialogElement>(null);
  const location = useLocation();
  const page = pages[location.pathname] || { title: 'รายละเอียดกลุ่ม', subtitle: 'ภาพรวมการตรวจข้อความของกลุ่ม LINE', english: 'Group details' };
  const today = new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Bangkok' }).format(new Date());
  return (
    <div className="app-frame">
      <a href="#main-content" className="skip-link">ข้ามไปยังเนื้อหา</a>
      <div className="app-layout">
        <div className="sidebar-container"><Sidebar /></div>
        <dialog ref={mobileMenu} className="mobile-nav-dialog" aria-label="เมนูหลัก"
          onClick={event => { if (event.target === event.currentTarget) mobileMenu.current?.close(); }}>
          <button className="mobile-nav-close" aria-label="ปิดเมนู" onClick={() => mobileMenu.current?.close()}><X size={22} /></button>
          <Sidebar onNavigate={() => mobileMenu.current?.close()} />
        </dialog>
        <div className="main-content">
          <header className="top-header">
            <div className="header-breadcrumb">
              <button className="mobile-menu-btn" onClick={() => mobileMenu.current?.showModal()} aria-label="เปิดเมนู"><Menu size={22} /></button>
              <span className="breadcrumb-brand">Workspace</span><ChevronRight size={14} /><span>{page.english}</span>
            </div>
            <div className="top-header-right">
              <span className="header-admin-label"><ShieldCheck size={15} /> Admin console</span>
              <div className="header-user"><div className="header-user-avatar">AD</div><div><strong>Admin</strong><small>ผู้ดูแลระบบ</small></div></div>
            </div>
          </header>
          <main id="main-content" className="page-content" tabIndex={-1}>
            <div className="page-heading">
              <div><div className="eyebrow">EH?BOT / {page.english.toUpperCase()}</div><h1>{page.title}</h1><p>{page.subtitle}</p></div>
              <span className="today-label"><CalendarDays size={16} />{today}</span>
            </div>
            <Outlet />
            <footer className="workspace-footer"><span>Eh?Bot — เอ๊ะก่อนคลิก เช็กก่อนเชื่อ</span><span>ออกแบบมาเพื่อบทสนทนาที่ปลอดภัยขึ้น</span></footer>
          </main>
        </div>
      </div>
    </div>
  );
}
