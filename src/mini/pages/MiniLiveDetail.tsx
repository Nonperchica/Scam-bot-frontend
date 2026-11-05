import { useOutletContext } from 'react-router-dom';
import type { MiniLayoutContext } from '../sampleCases';
import MiniCaseDetail from '../components/MiniCaseDetail';
import MiniPageHeading from '../components/MiniPageHeading';
import MiniSessionNotice from '../components/MiniSessionNotice';
import MiniChatButton from '../components/MiniChatButton';

export default function MiniLiveDetail() {
  const session = useOutletContext<MiniLayoutContext>();
  const lessonBase = session.miniHref('lessons');
  const lessonHref = lessonBase + (lessonBase.includes('?') ? '&' : '?') + `topic=${session.detail?.lessonId || 'links'}`;
  if (session.detail) {
    return <MiniCaseDetail detectionCase={session.detail} learningHref={lessonHref} recoveryHref={session.miniHref('recovery')} />;
  }
  // ยังโหลดอยู่ ต้องล็อกอิน หรือเปิดไม่ได้: บอกสถานะ พร้อมทางกลับแชตและไปประวัติของตนเอง
  return <>
    <MiniPageHeading title="รายละเอียดผลตรวจ" pose="inspect" />
    <div className="mini-page-body"><MiniSessionNotice /><MiniChatButton label="กลับไปแชต LINE" /></div>
  </>;
}
