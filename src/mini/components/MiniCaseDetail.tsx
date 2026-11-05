import { Link } from 'react-router-dom';
import { BadgeHelp, BookOpen, CalendarDays, ChevronRight, Clock3, Gift, Info, Lightbulb, Link2, MessageCircle, UserRound } from 'lucide-react';
import { formatCaseTime, readSource, statusLabels, statusSymbols } from '../sampleCases';
import type { DetectionStatus } from '../sampleCases';
import type { MiniCaseData } from '../services/miniApi';
import type { MascotPose } from './MiniMascot';
import MiniMascot from './MiniMascot';
import MiniChatButton from './MiniChatButton';
import { RECOVERY_READY } from '../pages/MiniRecovery';
import warningImage from '../assets/warning.png';

const statusMascots: Record<DetectionStatus, MascotPose> = { risk_found: 'alert', no_risk_found: 'calm', uncertain: 'inspect' };
const warningIcons = { clock: Clock3, user: UserRound, link: Link2, gift: Gift, message: MessageCircle, calendar: CalendarDays, help: BadgeHelp };

// แยกเหตุผลเป็นข้อตามขึ้นบรรทัดใหม่หรือ • ที่มากับผลตรวจ (กฎเดียวกับการ์ด LINE ใน flex_cards.reason_items)
function reasonItems(reason: string): string[] {
  const items = reason.split(/[\r\n•]+/).map(item => item.replace(/^[\s\-–]+|\s+$/g, '')).filter(Boolean);
  return items.length ? items : [reason];
}

// เรียงตามการ์ด LINE: ผลตรวจ → ข้อความที่พบ → เหตุผล → คำเตือน/สิ่งที่ควรทำ
export default function MiniCaseDetail({ detectionCase, recoveryHref, learningHref }: { detectionCase: MiniCaseData; recoveryHref: string; learningHref: string }) {
  const isRisk = detectionCase.status === 'risk_found';
  const source = readSource(detectionCase.message);
  return (
    <div className="mini-page-body mini-detail-body">
      <h1 className="mini-detail-title">รายละเอียดผลตรวจ</h1>
      <section className={`mini-result-banner ${detectionCase.status}`}>
        <span className="mini-result-mascot"><MiniMascot pose={statusMascots[detectionCase.status]} /><span className="mini-result-badge" aria-hidden="true">{statusSymbols[detectionCase.status]}</span></span>
        <div><h2>{detectionCase.status === 'uncertain'
          ? <><span className="mini-status-word">ควรตรวจสอบ</span><wbr /><span className="mini-status-word">เพิ่มเติม</span></>
          : statusLabels[detectionCase.status]}</h2><p>{source.image ? 'ผลตรวจข้อความจากรูปภาพ' : 'ผลตรวจข้อความ'}</p></div>
      </section>

      <section className="mini-section">
        <h2>{source.image ? 'ข้อความที่อ่านได้จากรูป' : 'ข้อความที่พบ'}</h2>
        <blockquote>{source.text || 'อ่านข้อความในรูปไม่ได้'}</blockquote>
        <p className="mini-secondary"><time dateTime={detectionCase.receivedAt}>{formatCaseTime(detectionCase.receivedAt)}</time></p>
      </section>

      <section className="mini-section">
        <h2>เหตุผล</h2>
        <ul className="mini-reasons">{reasonItems(detectionCase.reason).map(item => <li key={item}>{item}</li>)}</ul>
      </section>

      {/* คำแนะนำสั้น 2–3 ข้อ แสดงครบทุกข้อทุกสถานะ ไม่พับไว้ */}
      <section className={`mini-card mini-advice ${isRisk ? 'mini-warn' : 'mini-mint'}`}>
        <h2 className="mini-advice-heading">
          {isRisk ? <img src={warningImage} alt="" /> : <Lightbulb aria-hidden="true" />}
          ควรทำอย่างไร
        </h2>
        <ol className="mini-steps">{detectionCase.nextSteps.map(step => <li key={step}>{step}</li>)}</ol>
      </section>

      {detectionCase.warningPoints.length > 0 && <details className="mini-section mini-detail-extra">
        <summary>จุดที่ควรสังเกตเพิ่มเติม</summary>
        {detectionCase.warningPoints.map(point => {
          const WarningIcon = warningIcons[point.icon];
          return <div className="mini-warning-row" key={point.title}>
            <span className={`mini-status-icon ${detectionCase.status}`}><WarningIcon aria-hidden="true" /></span>
            <div><h3>{point.title}</h3><p>{point.description}</p></div>
          </div>;
        })}
      </details>}

      <p className="mini-note"><Info aria-hidden="true" /><span>เป็นผลประเมิน ไม่ยืนยันตัวตนหรือข้อเท็จจริงของผู้ส่ง จุดที่ควรสังเกตเลือกจากคำที่พบ ไม่ใช่หลักฐานยืนยันการหลอกลวง และไม่ใช่การตรวจซ้ำ</span></p>
      <Link to={learningHref} className="mini-learning-link"><BookOpen aria-hidden="true" /><span>เรียนรู้จากเคสนี้</span><ChevronRight aria-hidden="true" /></Link>
      {RECOVERY_READY && <Link to={recoveryHref} className="mini-text-link">เผลอทำตามไปแล้ว?<ChevronRight aria-hidden="true" /></Link>}
      <MiniChatButton label="กลับไปแชต LINE" />
    </div>
  );
}
