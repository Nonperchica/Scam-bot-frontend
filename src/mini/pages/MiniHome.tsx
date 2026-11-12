import { Link, useOutletContext } from 'react-router-dom';
import { ChevronRight, Lightbulb, MessageCircle, Search } from 'lucide-react';
import { readSource, sampleCases, statusLabels } from '../sampleCases';
import type { DetectionStatus, MiniLayoutContext } from '../sampleCases';
import type { MascotPose } from '../components/MiniMascot';
import MiniMascot from '../components/MiniMascot';
import MiniChatButton from '../components/MiniChatButton';
import MiniSessionNotice from '../components/MiniSessionNotice';

const statusMascots: Record<DetectionStatus, MascotPose> = { risk_found: 'alert', no_risk_found: 'calm', uncertain: 'inspect' };
const steps = [
  { icon: MessageCircle, label: 'ส่งข้อความหรือรูป' },
  { icon: Search, label: 'อ่านผล' },
  { icon: Lightbulb, label: 'ดูคำแนะนำ' },
];

export default function MiniHome() {
  const session = useOutletContext<MiniLayoutContext>();
  // โหมดจริงใช้ประวัติจาก Bot API เท่านั้น โหลดไม่ได้ก็ไม่แสดงเคสสมมติแทน
  const latest = (session.live ? session.history : sampleCases)[0];
  const latestTitle = latest ? readSource(latest.title) : undefined;
  return (
    <div className="mini-page-body mini-home">
      <section className="mini-home-hero">
        <h1>สวัสดี<br />ให้เราช่วย<br />เช็กนะ</h1>
        <MiniMascot pose="calm" />
      </section>
      <p className="mini-home-lead">สงสัยข้อความไหน ส่งให้บอตช่วยดู</p>
      <MiniChatButton label="ตรวจข้อความใน LINE" />
      {session.live && <MiniSessionNotice />}

      <section className="mini-section">
        <h2>ผลตรวจล่าสุด</h2>
        {session.historyLoading && <p className="mini-note" role="status">กำลังโหลดผลตรวจล่าสุด…</p>}
        {session.historyError && <>
          <p className="mini-session-error" role="alert">{session.historyError}</p>
          <button type="button" className="mini-secondary-button" onClick={session.reloadHistory}>ลองอีกครั้ง</button>
        </>}
        {latest && latestTitle && <>
          <Link className={`mini-latest ${latest.status}`} to={session.live ? session.miniHref('detail', latest.id) : `/mini/cases/${latest.id}`}>
            <MiniMascot pose={statusMascots[latest.status]} />
            <span className="mini-latest-copy"><strong>{statusLabels[latest.status]}</strong><span>{latestTitle.image ? 'รูปภาพ: ' : ''}{latestTitle.text || 'ข้อความในรูป'}</span></span>
            <ChevronRight aria-hidden="true" />
          </Link>
          <Link className="mini-text-link" to={session.miniHref('history')}>ดูประวัติทั้งหมด<ChevronRight aria-hidden="true" /></Link>
        </>}
        {!latest && !session.historyLoading && !session.historyError && !session.needsLogin && !session.loading && !session.error
          && <p className="mini-secondary">ยังไม่มีผลตรวจ ลองส่งข้อความที่สงสัยในแชตดูนะ</p>}
      </section>

      <section className="mini-section">
        <h2>วิธีใช้งานง่าย ๆ 3 ขั้นตอน</h2>
        <ol className="mini-home-steps">
          {steps.map(step => <li key={step.label}><span className="mini-step-icon"><step.icon aria-hidden="true" /></span>{step.label}</li>)}
        </ol>
      </section>
    </div>
  );
}
