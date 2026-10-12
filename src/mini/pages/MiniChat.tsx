import { Link } from 'react-router-dom';
import { FileSearch, ShieldAlert } from 'lucide-react';
import MiniPageHeading from '../components/MiniPageHeading';
import MiniMascot from '../components/MiniMascot';
import { sampleCases } from '../sampleCases';

export default function MiniChat() {
  const exampleCase = sampleCases[0];
  return (
    <>
      <MiniPageHeading title="แชต Eh?Bot" pose="wave" />
      <div className="mini-page-body">
        <p className="mini-chat-notice">ตัวอย่างการใช้งาน ยังไม่เชื่อม LINE จริง</p>
        <section className="mini-profile"><MiniMascot pose="guide" /><h1>ส่งมาให้เราช่วยดู</h1></section>
        <section className="mini-example-scene">
          <p className="mini-secondary">ข้อความตัวอย่างของคุณ</p>
          <blockquote>{exampleCase.message}</blockquote>
        </section>
        <section className="mini-card mini-advice-row">
          <span className="mini-status-icon"><ShieldAlert aria-hidden="true" /></span>
          <div><h2>พบสัญญาณเสี่ยง</h2><p>หยุดก่อนคลิก เช็กก่อนทำตาม</p></div>
        </section>
        <Link to={`/mini/cases/${exampleCase.id}`} className="mini-primary-button">
          <FileSearch aria-hidden="true" />ดูรายละเอียดผลตัวอย่าง
        </Link>
      </div>
    </>
  );
}
