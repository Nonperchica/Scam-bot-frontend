import { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { BookOpen, ChevronRight, CircleCheck, CircleHelp, History, Info, ShieldCheck, Trash2, UserRound } from 'lucide-react';
import type { MiniLayoutContext } from '../sampleCases';
import MiniMascot from '../components/MiniMascot';
import { RECOVERY_READY } from './MiniRecovery';
import { deleteMessage, nextDeleteStep } from '../deleteFlow';
import type { DeleteAction, DeleteState } from '../deleteFlow';

export default function MiniSettings() {
  const { live, signedIn, profile, deleteHistory, miniHref } = useOutletContext<MiniLayoutContext>();
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
    <div className="mini-page-body mini-account">
      <h1 className="mini-page-title">บัญชีของฉัน</h1>
      <section className="mini-profile">
        {profile?.pictureUrl
          ? <img className="mini-avatar" src={profile.pictureUrl} alt="" referrerPolicy="no-referrer" />
          : <span className="mini-avatar" aria-hidden="true"><UserRound /></span>}
        <div className="mini-profile-copy">
          <h2>{profile?.displayName || 'เพื่อนของ Eh?Bot'}</h2>
          <p className="mini-secondary">{live
            ? signedIn ? <><CircleCheck aria-hidden="true" className="mini-ok" />เชื่อมต่อด้วย LINE</> : 'เปิดจาก LINE เพื่อเชื่อมบัญชี'
            : 'บัญชีตัวอย่าง'}</p>
        </div>
        <MiniMascot pose="calm" />
      </section>

      <h2 className="mini-topic-heading">ข้อมูลของฉัน</h2>
      <div className="mini-menu-list">
        <Link to={miniHref('history')} className="mini-menu-row"><span className="mini-menu-icon"><History aria-hidden="true" /></span><span>ประวัติการตรวจ</span><ChevronRight aria-hidden="true" className="mini-chevron" /></Link>
        <details className="mini-menu-details"><summary className="mini-menu-row"><span className="mini-menu-icon"><ShieldCheck aria-hidden="true" /></span><span>ความเป็นส่วนตัว</span><ChevronRight aria-hidden="true" className="mini-chevron" /></summary>
          <p>{live ? 'เก็บประวัติการตรวจในแชตส่วนตัวไว้ให้ดูย้อนหลัง หน้าเว็บอ่านเฉพาะเคสของบัญชีนี้โดยตรวจเจ้าของผ่าน LINE และลบได้เองในหน้านี้' : 'ใช้ข้อมูลสมมติสามเคส ไม่ได้อ่านประวัติ LINE หรือ Supabase'}</p></details>
      </div>

      <h2 className="mini-topic-heading">ความช่วยเหลือ</h2>
      <div className="mini-menu-list">
        <Link to={miniHref('help')} className="mini-menu-row"><span className="mini-menu-icon"><BookOpen aria-hidden="true" /></span><span>วิธีใช้งาน Eh?Bot</span><ChevronRight aria-hidden="true" className="mini-chevron" /></Link>
        {RECOVERY_READY && <Link to={miniHref('recovery')} className="mini-menu-row"><span className="mini-menu-icon"><CircleHelp aria-hidden="true" /></span><span>เผลอทำตามข้อความน่าสงสัย</span><ChevronRight aria-hidden="true" className="mini-chevron" /></Link>}
        <details className="mini-menu-details"><summary className="mini-menu-row"><span className="mini-menu-icon"><Info aria-hidden="true" /></span><span>เกี่ยวกับ Eh?Bot</span><ChevronRight aria-hidden="true" className="mini-chevron" /></summary>
          <p>ช่วยดูสัญญาณเสี่ยงเพื่อประกอบการตัดสินใจ ผลอาจคลาดเคลื่อน และไม่ยืนยันตัวตนผู้ส่งหรือความปลอดภัยของเว็บไซต์</p></details>
      </div>

      {/* ลบแล้วกู้คืนไม่ได้ จึงวางไว้ล่างสุด แยกจากเมนูทั่วไป และต้องกดยืนยันอีกครั้ง */}
      {live && <section className="mini-delete">
        {deleteState.step === 'confirm' || deleteState.step === 'deleting' ? <>
          <p className="mini-session-error">ลบแล้วกู้คืนไม่ได้ ประวัติการตรวจในแชตส่วนตัวทั้งหมดของบัญชีนี้จะหายไป</p>
          <button type="button" className="mini-danger-button solid" onClick={confirmDelete} disabled={deleteState.step === 'deleting'}>
            {deleteState.step === 'deleting' ? 'กำลังลบ…' : 'ยืนยันลบ'}
          </button>
          <button type="button" className="mini-secondary-button" onClick={() => send({ type: 'cancel' })} disabled={deleteState.step === 'deleting'}>ยกเลิก</button>
        </> : <>
          {deleteMessage(deleteState) && <p className="mini-note" role="status">{deleteMessage(deleteState)}</p>}
          <button type="button" className="mini-danger-button" onClick={() => send({ type: 'ask' })}>
            <Trash2 aria-hidden="true" />ลบประวัติทั้งหมด
          </button>
          <p className="mini-secondary">ลบข้อความที่เคยส่งตรวจและผลตรวจทั้งหมดของบัญชี LINE นี้</p>
        </>}
      </section>}
    </div>
  );
}
