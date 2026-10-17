import { Link, useParams } from 'react-router-dom';
import { sampleCases } from '../sampleCases';
import MiniMascot from '../components/MiniMascot';
import MiniCaseDetail from '../components/MiniCaseDetail';

export default function MiniDetail() {
  const { caseId } = useParams();
  const detectionCase = sampleCases.find((item) => item.id === caseId);
  if (!detectionCase) {
    return <div className="mini-page-body"><section className="mini-card mini-empty">
      <MiniMascot pose="inspect" /><h1>เปิดผลตรวจนี้ไม่ได้</h1>
      <p>ไม่พบรหัสเคสนี้ในรายการตัวอย่าง</p>
      <Link to="/mini" className="mini-primary-button">กลับไปหน้าประวัติ</Link>
    </section></div>;
  }
  return <MiniCaseDetail detectionCase={detectionCase} />;
}
