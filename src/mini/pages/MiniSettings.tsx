import { Link, useOutletContext } from 'react-router-dom';
import { BookOpen, ChevronRight, CircleHelp } from 'lucide-react';
import type { MiniLayoutContext } from '../sampleCases';
import MiniPageHeading from '../components/MiniPageHeading';
import MiniMascot from '../components/MiniMascot';
import MiniChatButton from '../components/MiniChatButton';

export default function MiniSettings() {
  const { largeText, setLargeText, live, signedIn, miniHref } = useOutletContext<MiniLayoutContext>();
  return (
    <>
      <MiniPageHeading title="บัญชีของฉัน" pose="wave" />
      <div className="mini-page-body">
        <section className="mini-profile">
          <MiniMascot pose="heart" />
          <div><h2>เพื่อนของ Eh?Bot</h2><p className="mini-secondary">{live ? signedIn ? 'เข้าสู่ระบบ LINE แล้ว' : 'เปิดจาก LINE เพื่อเชื่อมบัญชี' : 'บัญชีตัวอย่าง'}</p></div>
        </section>
        <section className="mini-card">
          <h2>อ่านสบาย ในขนาดที่ชอบ</h2>
          <div className="mini-font-buttons" aria-label="ขนาดตัวอักษร">
            <button type="button" aria-pressed={!largeText} onClick={() => setLargeText(false)}>ก ขนาดปกติ</button>
            <button type="button" aria-pressed={largeText} onClick={() => setLargeText(true)}>ก ขนาดใหญ่</button>
          </div>
          <p className="mini-font-preview">เอ๊ะก่อนคลิก เช็กก่อนเชื่อ</p>
          <details><summary>การตั้งค่านี้มีผลอย่างไร?</summary><p>เปลี่ยนขนาดข้อความในทุกหน้า Mini App ระหว่างใช้งาน โหลดหน้าใหม่แล้วกลับขนาดปกติ</p></details>
        </section>
        <section className="mini-card">
          <Link to={miniHref('help')} className="mini-menu-row">
            <span className="mini-status-icon no_risk_found"><CircleHelp aria-hidden="true" /></span>
            <span>วิธีใช้งาน</span><ChevronRight aria-hidden="true" />
          </Link>
          <Link to={miniHref('lessons')} className="mini-menu-row">
            <span className="mini-status-icon"><BookOpen aria-hidden="true" /></span>
            <span>เรียนรู้เรื่องกลโกง</span><ChevronRight aria-hidden="true" />
          </Link>
          <details><summary>ข้อมูลและความเป็นส่วนตัว</summary><p>{live ? 'หน้าเว็บอ่านเฉพาะเคสที่คุณเปิด โดยตรวจเจ้าของผ่าน LINE เคสชั่วคราวมีอายุ 15 นาทีหรือจนกว่าบอตรีสตาร์ต ส่วนประวัติการตรวจที่บอตบันทึกไว้ยังเป็นไปตามการทำงานเดิม' : 'ใช้ข้อมูลสมมติสามเคส ไม่ได้อ่านประวัติ LINE หรือ Supabase การเก็บและลบข้อมูลจริงต้องกำหนดนโยบายและสิทธิ์ผู้ใช้ก่อนเชื่อมระบบ'}</p></details>
          <details><summary>เกี่ยวกับ Eh?Bot</summary><p>ช่วยดูสัญญาณเสี่ยงเพื่อประกอบการตัดสินใจ ผลอาจคลาดเคลื่อน และไม่ยืนยันตัวตนผู้ส่งหรือความปลอดภัยของเว็บไซต์</p></details>
        </section>
        <section className="mini-invite">
          <div className="mini-invite-top"><MiniMascot pose="think" /><h2>สงสัยข้อความไหน<br />ให้เราช่วยดู</h2></div>
          <MiniChatButton />
        </section>
      </div>
    </>
  );
}
