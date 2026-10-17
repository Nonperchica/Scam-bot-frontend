import { useOutletContext } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import type { MiniLayoutContext } from '../sampleCases';
import MiniMascot from './MiniMascot';

export default function MiniSessionNotice() {
  const session = useOutletContext<MiniLayoutContext>();
  if (!session.loading && !session.error && !session.needsLogin) return null;
  return <section className="mini-card mini-session-notice" aria-busy={session.loading}>
    <div className="mini-session-heading"><MiniMascot pose={session.error ? 'inspect' : 'guide'} />
      <div><h2>{session.loading ? 'กำลังเปิดผลตรวจเดิม' : session.needsLogin ? 'เข้าสู่ระบบด้วย LINE' : 'ยังเปิดผลตรวจไม่ได้'}</h2>
        <p className="mini-secondary">{session.loading ? 'รอสักครู่ ให้เราช่วยเปิดเคสของคุณ' : session.needsLogin ? 'ใช้บัญชีเดียวกับที่ส่งข้อความตรวจ' : 'ลองอีกครั้ง หรือเปิดจากปุ่มในแชตเดิม'}</p>
      </div>
    </div>
    {session.error && <details><summary>ดูรายละเอียด</summary><p role="alert">{session.error}</p></details>}
    {session.loading && <p className="mini-note" role="status">กำลังยืนยันเจ้าของเคส โดยไม่ตรวจ AI ซ้ำ</p>}
    {session.needsLogin && <button type="button" className="mini-primary-button" onClick={session.login}>เข้าสู่ระบบ LINE</button>}
    {session.error && <button type="button" className="mini-secondary-button" onClick={session.retry}><RefreshCw aria-hidden="true" />ลองอีกครั้ง</button>}
  </section>;
}
