import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import type { MiniLayoutContext } from '../sampleCases';
import MiniPageHeading from '../components/MiniPageHeading';
import MiniMascot from '../components/MiniMascot';
import MiniChatButton from '../components/MiniChatButton';
import { deleteMessage, nextDeleteStep } from '../deleteFlow';
import type { DeleteAction, DeleteState } from '../deleteFlow';

export default function MiniSettings() {
  const { largeText, setLargeText, live, signedIn, profile, deleteHistory } = useOutletContext<MiniLayoutContext>();
  const [deleteState, setDeleteState] = useState<DeleteState>({ step: 'idle' });
  const send = (action: DeleteAction) => setDeleteState(current => nextDeleteStep(current, action));

  async function confirmDelete() {
    // กดซ้ำระหว่างกำลังลบไม่เรียก API อีก (ปุ่มปิดอยู่ และ state ไม่ใช่ confirm แล้ว)
    if (deleteState.step !== 'confirm') return;
    send({ type: 'start' });
    try {
      send({ type: 'success', deleted: await deleteHistory() });
    } catch (error) {
      send({ type: 'fail', error: error instanceof Error ? error.message : 'ลบประวัติไม่สำเร็จ กรุณาลองใหม่' });
    }
  }
  return (
    <>
      <MiniPageHeading title="บัญชีของฉัน" pose="wave" />
      <div className="mini-page-body">
        <section className="mini-profile">
          <MiniMascot pose="heart" />
          {profile
            ? <div className="mini-line-account">
                {profile.pictureUrl && <img src={profile.pictureUrl} alt="" referrerPolicy="no-referrer" />}
                <div><h2>{profile.displayName}</h2><p className="mini-secondary">เข้าสู่ระบบ LINE แล้ว</p></div>
              </div>
            : <div><h2>เพื่อนของ Eh?Bot</h2><p className="mini-secondary">{live ? signedIn ? 'เข้าสู่ระบบ LINE แล้ว' : 'เปิดจาก LINE เพื่อเชื่อมบัญชี' : 'บัญชีตัวอย่าง'}</p></div>}
        </section>
        <section className="mini-card">
          <h2>อ่านสบาย ในขนาดที่ชอบ</h2>
          <div className="mini-font-buttons" aria-label="ขนาดตัวอักษร">
            <button type="button" aria-pressed={!largeText} onClick={() => setLargeText(false)}>ก ขนาดปกติ</button>
            <button type="button" aria-pressed={largeText} onClick={() => setLargeText(true)}>ก ขนาดใหญ่</button>
          </div>
          <p className="mini-font-preview">เอ๊ะก่อนคลิก เช็กก่อนเชื่อ</p>
        </section>
        <section className="mini-card">
          <details><summary>ข้อมูลและความเป็นส่วนตัว</summary><p>{live ? 'เก็บประวัติการตรวจในแชตส่วนตัวไว้ให้ดูย้อนหลัง หน้าเว็บอ่านเฉพาะเคสของบัญชีนี้โดยตรวจเจ้าของผ่าน LINE และลบได้เองในหน้านี้' : 'ใช้ข้อมูลสมมติสามเคส ไม่ได้อ่านประวัติ LINE หรือ Supabase'}</p></details>
          <details><summary>เกี่ยวกับ Eh?Bot</summary><p>ช่วยดูสัญญาณเสี่ยงเพื่อประกอบการตัดสินใจ ผลอาจคลาดเคลื่อน และไม่ยืนยันตัวตนผู้ส่งหรือความปลอดภัยของเว็บไซต์</p></details>
        </section>
        <section className="mini-invite">
          <div className="mini-invite-top"><MiniMascot pose="think" /><h2>สงสัยข้อความไหน<br />ให้เราช่วยดู</h2></div>
          <MiniChatButton />
        </section>
        {/* ลบแล้วกู้คืนไม่ได้ จึงวางไว้ล่างสุด ห่างจากปุ่มที่กดบ่อย */}
        {live && <section className="mini-card">
          <h2>ลบประวัติการตรวจ</h2>
          {deleteState.step === 'confirm' || deleteState.step === 'deleting' ? <>
            <p className="mini-session-error">ลบแล้วกู้คืนไม่ได้ ประวัติการตรวจในแชตส่วนตัวทั้งหมดของบัญชีนี้จะหายไป</p>
            <button type="button" className="mini-primary-button" onClick={confirmDelete} disabled={deleteState.step === 'deleting'}>
              {deleteState.step === 'deleting' ? 'กำลังลบ…' : 'ยืนยันลบ'}
            </button>
            <button type="button" className="mini-secondary-button" onClick={() => send({ type: 'cancel' })} disabled={deleteState.step === 'deleting'}>ยกเลิก</button>
          </> : <>
            <p className="mini-secondary">ลบข้อความที่เคยส่งตรวจและผลตรวจทั้งหมดของบัญชี LINE นี้</p>
            {deleteMessage(deleteState) && <p className="mini-note" role="status">{deleteMessage(deleteState)}</p>}
            <button type="button" className="mini-secondary-button" onClick={() => send({ type: 'ask' })}>
              <Trash2 aria-hidden="true" />ลบประวัติทั้งหมด
            </button>
          </>}
        </section>}
      </div>
    </>
  );
}
