import { Link, useOutletContext, useSearchParams } from 'react-router-dom';
import { BadgeCheck, ChevronLeft, ChevronRight, Clock3, FileSearch, Gift, KeyRound, Lightbulb, Link2, Wallet } from 'lucide-react';
import MiniPageHeading from '../components/MiniPageHeading';
import { lessonTopics } from '../lessonTopics';
import { sampleCases } from '../sampleCases';
import type { MiniLayoutContext } from '../sampleCases';

const lessonIcons = { links: Link2, otp: KeyRound, prizes: Gift, urgency: Clock3, payments: Wallet, impersonation: BadgeCheck };

export default function MiniLessons() {
  const session = useOutletContext<MiniLayoutContext>();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedLesson = lessonTopics.find((lesson) => lesson.id === searchParams.get('topic'));
  const sourceCase = session.live ? undefined : sampleCases.find((item) => item.id === searchParams.get('case'));
  // หัวข้อจากเคส: ใช้ lessonId ที่ backend เลือกจากคำที่พบ (learning.lesson_points) เฉพาะเคสที่เปิดอยู่จริง
  const caseLessonId = session.live ? session.detail?.lessonId : sourceCase?.lessonId;
  const caseLesson = lessonTopics.find(lesson => lesson.id === caseLessonId);
  const featuredLesson = caseLesson ?? lessonTopics.find(lesson => lesson.id === 'otp')!;
  function closeTopic() {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('topic');
    setSearchParams(nextParams, { replace: true });
  }
  function selectTopic(topicId: string) {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('topic', topicId);
    setSearchParams(nextParams, { replace: true });
  }
  return (
    <>
      <MiniPageHeading title="เรียนรู้ทันกลโกง" pose="book" />
      <div className="mini-page-body mini-lessons-body">
        <p className="mini-home-lead">รู้จุดสังเกต ก่อนตัดสินใจ</p>
        {!selectedLesson && <section className="mini-card mini-mint mini-case-lesson">
          <div>
            <span className="mini-tag">{caseLesson ? 'จากเคสที่คุณเคยตรวจ' : 'เรื่องน่ารู้ใกล้ตัว'}</span>
            <h2>{featuredLesson.id === 'otp' ? 'ทำไมไม่ควรส่งรหัส OTP?' : featuredLesson.title}</h2>
            <p className="mini-secondary">บทเรียนสั้น อ่านแล้วนำไปใช้ได้</p>
            <button type="button" className="mini-text-link" onClick={() => selectTopic(featuredLesson.id)}>อ่านบทเรียน<ChevronRight aria-hidden="true" /></button>
          </div>
          <KeyRound className="mini-feature-icon" aria-hidden="true" />
        </section>}
        {/* เนื้อหาอยู่เหนือรายการหัวข้อ กดเลือกแล้วเห็นสิ่งที่เปลี่ยนโดยไม่ต้องเลื่อนจอ */}
        {selectedLesson && <><button type="button" className="mini-topic-back" onClick={closeTopic}><ChevronLeft aria-hidden="true" />หัวข้อทั้งหมด</button><section className="mini-example-scene" aria-live="polite">
          <h2>{selectedLesson.title}</h2>
          <p className="mini-secondary">ตัวอย่างข้อความสมมติ</p>
          <blockquote>{selectedLesson.exampleBefore}<mark>{selectedLesson.highlightedText}</mark>{selectedLesson.exampleAfter}</blockquote>
          <p className="mini-lesson-advice"><Lightbulb aria-hidden="true" />{selectedLesson.advice}</p>
          <p className="mini-lesson-explanation">{selectedLesson.explanation}</p>
        </section>
        <p className="mini-note">ตัวอย่างใช้เป็นจุดสังเกต ต้องดูบริบทประกอบ การพบคำเดียวไม่ยืนยันการหลอกลวง</p></>}
        <h2 className="mini-topic-heading">เลือกเรื่องที่อยากรู้</h2>
        <div className="mini-menu-list" aria-label="เลือกหัวข้อเรียนรู้">
          {lessonTopics.map((lesson) => {
            const LessonIcon = lessonIcons[lesson.id];
            return (
              <button type="button" key={lesson.id} className="mini-menu-row" aria-pressed={selectedLesson?.id === lesson.id} onClick={() => selectTopic(lesson.id)}>
                <span className="mini-menu-icon"><LessonIcon aria-hidden="true" /></span>
                <span>{lesson.title}</span>
                <ChevronRight aria-hidden="true" className="mini-chevron" />
              </button>
            );
          })}
        </div>
        {session.live && session.detail ? <Link to={session.miniHref('detail')} className="mini-learning-link"><FileSearch aria-hidden="true" /><span>กลับไปดูผลตรวจเดิม</span><ChevronRight aria-hidden="true" /></Link>
          : sourceCase && <Link to={`/mini/cases/${sourceCase.id}`} className="mini-learning-link"><FileSearch aria-hidden="true" /><span>กลับไปดูผลตรวจเดิม</span><ChevronRight aria-hidden="true" /></Link>}
      </div>
    </>
  );
}
