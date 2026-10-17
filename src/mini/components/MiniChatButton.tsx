import { ChevronRight } from 'lucide-react';
import { Link, useOutletContext } from 'react-router-dom';
import type { MiniLayoutContext } from '../sampleCases';

export default function MiniChatButton({ label = 'เปิดแชต Eh?Bot' }: { label?: string }) {
  const session = useOutletContext<MiniLayoutContext | undefined>();
  if (session?.live) {
    return <div><button type="button" className="mini-primary-button" onClick={session.returnToLine} disabled={!session.canReturnToLine}>
      <span className="mini-line-mark" aria-hidden="true">LINE</span><span>{label}</span><ChevronRight aria-hidden="true" />
    </button>{!session.canReturnToLine && <p className="mini-note">เปิดจากแชต LINE เพื่อกลับไปส่งข้อความตรวจ</p>}</div>;
  }
  return <Link to="/mini/chat" className="mini-primary-button"><span className="mini-line-mark" aria-hidden="true">LINE</span><span>{label}</span><ChevronRight aria-hidden="true" /></Link>;
}
