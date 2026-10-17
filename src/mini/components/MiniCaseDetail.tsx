import { Link } from 'react-router-dom';
import { BadgeHelp, BookOpen, CalendarDays, ChevronRight, CircleHelp, Clock3, Gift, Info, Lightbulb, Link2, MessageCircle, ShieldAlert, UserRound } from 'lucide-react';
import { formatCaseTime, statusAdvice, statusLabels } from '../sampleCases';
import type { DetectionStatus } from '../sampleCases';
import type { MiniCaseData } from '../services/miniApi';
import type { MascotPose } from './MiniMascot';
import MiniPageHeading from './MiniPageHeading';
import MiniChatButton from './MiniChatButton';

const statusMascots: Record<DetectionStatus, MascotPose> = { risk_found: 'alert', no_risk_found: 'calm', uncertain: 'inspect' };
const warningIcons = { clock: Clock3, user: UserRound, link: Link2, gift: Gift, message: MessageCircle, calendar: CalendarDays, help: BadgeHelp };

export default function MiniCaseDetail({ detectionCase, live = false, learningHref }: { detectionCase: MiniCaseData; live?: boolean; learningHref?: string }) {
  const StatusIcon = { risk_found: ShieldAlert, uncertain: CircleHelp, no_risk_found: MessageCircle }[detectionCase.status];
  return (
    <>
      <MiniPageHeading title="รายละเอียดผลตรวจ" pose={statusMascots[detectionCase.status]} />
      <div className="mini-page-body mini-detail-body">
        <section className={`mini-result-banner ${detectionCase.status}`}><span className="mini-result-shield"><StatusIcon aria-hidden="true" /></span><div><h2>{statusLabels[detectionCase.status]}</h2><p>{statusAdvice[detectionCase.status]}</p></div></section>
        <section className="mini-card"><h2>ข้อความที่ตรวจ</h2><blockquote>{detectionCase.message}</blockquote><p className="mini-secondary"><time dateTime={detectionCase.receivedAt}>{formatCaseTime(detectionCase.receivedAt)}</time></p></section>
        {live && <section className="mini-card"><h2>เหตุผลจากผลตรวจเดิม</h2><p>{detectionCase.reason}</p></section>}
        <section className="mini-card">
          <h2>{live ? 'หัวข้อที่ควรตรวจเพิ่ม' : detectionCase.status === 'no_risk_found' ? 'สิ่งที่พบในข้อความ' : 'จุดที่ควรระวัง'}</h2>
          {live && <p className="mini-secondary">เลือกจากคำที่พบในข้อความ อาจเป็นข่าวหรือคำเตือนภัย จึงไม่ใช่หลักฐานยืนยันการหลอกลวง</p>}
          {detectionCase.warningPoints.map((point) => {
            const WarningIcon = warningIcons[point.icon];
            return (
              <div className="mini-warning-row" key={point.title}>
                <span className={`mini-status-icon ${detectionCase.status}`}><WarningIcon aria-hidden="true" /></span>
                <div><h3>{point.title}</h3><p>{point.description}</p></div>
              </div>
            );
          })}
          {!live && <details><summary>อ่านเหตุผลเพิ่มเติม</summary><p>{detectionCase.reason}</p></details>}
        </section>
        <section className="mini-card mini-mint"><div className="mini-advice-row"><span className="mini-advice-icon"><Lightbulb aria-hidden="true" /></span><div><h2>แนะนำให้ทำ</h2><p>{detectionCase.nextSteps[0]}</p></div></div><details><summary>ดูคำแนะนำเพิ่มเติม</summary><ol className="mini-steps">{detectionCase.nextSteps.slice(1).map((step) => <li key={step}>{step}</li>)}</ol></details></section>
        {(!live || learningHref) && <Link to={learningHref || `/mini/lessons?topic=${detectionCase.lessonId}&case=${detectionCase.id}`} className="mini-learning-link"><BookOpen aria-hidden="true" /><span>เรียนรู้จากเคสนี้</span><ChevronRight aria-hidden="true" /></Link>}
        <p className="mini-note"><Info aria-hidden="true" /><span>คำแนะนำจากผลเดิม ไม่ใช่การตรวจซ้ำ<br />ไม่ยืนยันตัวตนผู้ส่งหรือความปลอดภัยของลิงก์</span></p>
        {!live && <MiniChatButton label="กลับไปแชต LINE" />}
      </div>
    </>
  );
}
