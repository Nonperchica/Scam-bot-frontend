import { Link, useOutletContext, useSearchParams } from 'react-router-dom';
import { BadgeCheck, ChevronRight, Clock3, FileSearch, Gift, KeyRound, Lightbulb, Link2, Wallet } from 'lucide-react';
import MiniMascot from '../components/MiniMascot';
import { lessonTopics } from '../lessonTopics';
import { sampleCases } from '../sampleCases';
import type { MiniLayoutContext } from '../sampleCases';

const lessonIcons = { links: Link2, otp: KeyRound, prizes: Gift, urgency: Clock3, payments: Wallet, impersonation: BadgeCheck };

export default function MiniLessons() {
  const session = useOutletContext<MiniLayoutContext>();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedLesson = lessonTopics.find((lesson) => lesson.id === searchParams.get('topic')) ?? lessonTopics[0];
  const sourceCase = session.live ? undefined : sampleCases.find((item) => item.id === searchParams.get('case'));
  function selectTopic(topicId: string) {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('topic', topicId);
    setSearchParams(nextParams, { replace: true });
  }
  return (
    <>
      <section className="mini-lesson-hero"><MiniMascot pose="book" /><h1>เอ๊ะให้ทัน ก่อนเชื่อ</h1><p className="mini-secondary">จำจุดสังเกตง่าย ๆ ไปใช้ในแชตจริง</p></section>
      <div className="mini-page-body mini-lessons-body">
        <div className="mini-topic-grid" aria-label="เลือกหัวข้อเรียนรู้">
          {lessonTopics.map((lesson) => {
            const LessonIcon = lessonIcons[lesson.id];
            return (
              <button type="button" key={lesson.id} className="mini-topic-button" aria-pressed={selectedLesson.id === lesson.id} onClick={() => selectTopic(lesson.id)}>
                <span className="mini-status-icon"><LessonIcon aria-hidden="true" /></span>
                <span>{lesson.title}</span>
              </button>
            );
          })}
        </div>
        {sourceCase && <details className="mini-card"><summary>เรียนรู้จาก: {sourceCase.title}</summary><h2>{sourceCase.learningTopic}</h2><p>{sourceCase.learningExplanation}</p><p>{sourceCase.checkingAdvice}</p></details>}
        <section className="mini-example-scene" aria-live="polite"><p className="mini-secondary">ตัวอย่างข้อความสมมติ</p><blockquote>{selectedLesson.exampleBefore}<mark>{selectedLesson.highlightedText}</mark>{selectedLesson.exampleAfter}</blockquote><h2><Lightbulb aria-hidden="true" />{selectedLesson.advice}</h2></section>
        <p className="mini-lesson-explanation">{selectedLesson.explanation}</p>
        <p className="mini-note">ตัวอย่างใช้เป็นจุดสังเกต ต้องดูบริบทประกอบ การพบคำเดียวไม่ยืนยันการหลอกลวง</p>
        {session.live && session.detail ? <Link to={session.miniHref('detail')} className="mini-learning-link"><FileSearch aria-hidden="true" /><span>กลับไปดูผลตรวจเดิม</span><ChevronRight aria-hidden="true" /></Link> : sourceCase ? <Link to={`/mini/cases/${sourceCase.id}`} className="mini-learning-link"><FileSearch aria-hidden="true" /><span>กลับไปดูผลตรวจเดิม</span><ChevronRight aria-hidden="true" /></Link> : <Link to={session.miniHref('help')} className="mini-learning-link"><FileSearch aria-hidden="true" /><span>ดูวิธีใช้ Eh?Bot</span><ChevronRight aria-hidden="true" /></Link>}
      </div>
    </>
  );
}
