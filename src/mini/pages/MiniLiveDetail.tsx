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
  return <>
    {session.detail ? <MiniCaseDetail detectionCase={session.detail} live learningHref={lessonHref} /> : <>
      <MiniPageHeading title="รายละเอียดผลตรวจ" pose="inspect" />
      <div className="mini-page-body"><MiniSessionNotice /></div>
    </>}
    <div className="mini-page-body mini-live-footer">
      <MiniChatButton label="กลับไปแชต LINE" />
    </div>
  </>;
}
