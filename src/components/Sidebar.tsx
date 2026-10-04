import { NavLink, Link } from 'react-router-dom';
import { ArrowUpRight, Database, LayoutDashboard, MessagesSquare, ShieldAlert, ShieldCheck } from 'lucide-react';

const menuItems = [
  { label: 'ภาพรวมระบบ', caption: 'Overview', path: '/', icon: LayoutDashboard },
  { label: 'กลุ่ม LINE', caption: 'Connected groups', path: '/line-groups', icon: MessagesSquare },
  { label: 'ประวัติความเสี่ยง', caption: 'Threat history', path: '/threat-logs', icon: ShieldAlert },
  { label: 'ชุดข้อมูล', caption: 'Dataset', path: '/dataset', icon: Database },
];

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <aside className="sidebar">
      <Link to="/" className="sidebar-logo" onClick={onNavigate} aria-label="Eh?Bot หน้าภาพรวม">
        <span className="brand-mark"><img src="/ehbot-logo.png" alt="" /></span>
        <span className="sidebar-logo-text">
          <span className="brand-wordmark">Eh<span>?</span>Bot<span className="brand-period">.</span></span>
          <span className="sidebar-logo-subtitle">YOUR SCAM SPOTTING BUDDY</span>
        </span>
      </Link>
      <div className="workspace-label"><span>ADMIN WORKSPACE</span><span className="workspace-dot" /></div>
      <nav className="sidebar-nav" aria-label="เมนูหลัก">
        {menuItems.map(item => (
          <NavLink key={item.path} to={item.path} end={item.path === '/'} onClick={onNavigate}
            className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`}>
            <item.icon size={20} strokeWidth={1.8} />
            <span className="nav-copy"><span>{item.label}</span><small>{item.caption}</small></span>
            <span className="nav-active-dot" />
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-note">
        <span className="sidebar-note-icon"><ShieldCheck size={22} /></span>
        <strong>เอ๊ะไว้ก่อน ปลอดภัยกว่า</strong>
        <p>ให้ทุกบทสนทนา มีเพื่อนช่วยสังเกตความเสี่ยง</p>
        <Link to="/threat-logs" onClick={onNavigate}>ตรวจดูข้อความ <ArrowUpRight size={16} /></Link>
      </div>
      <div className="sidebar-footer">
        <span className="sidebar-footer-mark">Eh?</span>
        <div><strong>Eh?Bot Console</strong><small>พื้นที่สำหรับผู้ดูแลระบบ</small></div>
        <span className="console-version">v1.0</span>
      </div>
    </aside>
  );
}
