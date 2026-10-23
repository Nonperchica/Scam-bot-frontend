import { EyeOff, FileSearch, MessageCircle, ShieldAlert } from 'lucide-react';
import MiniPageHeading from '../components/MiniPageHeading';
import MiniChatButton from '../components/MiniChatButton';

const helpSteps = [
  { icon: MessageCircle, title: 'ส่งข้อความ', description: 'คัดลอกข้อความมาในแชตบอต' },
  { icon: ShieldAlert, title: 'ดูผลตรวจ', description: 'อ่านสถานะและคำแนะนำสั้น ๆ' },
  { icon: FileSearch, title: 'เปิดรายละเอียด', description: 'ดูจุดควรระวังและเรียนรู้ต่อ' },
];
const questions = [
  { question: 'ส่งรูปภาพหรือเสียงได้ไหม?', answer: 'ส่งรูปภาพ เช่น ภาพแคปหน้าจอแชต ได้ บอตจะอ่านข้อความในรูปมาตรวจ ส่วนข้อความเสียงยังไม่รองรับ ให้พิมพ์หรือคัดลอกข้อความส่งมาแทน' },
  { question: 'ควรปิดบังข้อมูลอะไร?', answer: 'เช่น เลขบัญชี เลขบัตรประชาชน รหัสผ่าน OTP และข้อมูลส่วนตัวที่ไม่จำเป็นต่อการตรวจ' },
  { question: 'ส่งแค่ลิงก์เพียงพอหรือไม่?', answer: 'อาจมีบริบทไม่พอ ควรส่งข้อความที่มาพร้อมลิงก์ด้วย บอตยังไม่ได้เปิดตรวจเว็บไซต์ปลายทาง' },
  { question: '“ควรตรวจสอบเพิ่มเติม” หมายถึงอะไร?', answer: 'ข้อมูลหรือบริบทยังไม่พอสำหรับประเมิน ไม่ใช่ผลยืนยันว่าเป็นมิจฉาชีพ' },
  { question: 'ผลไม่ตรงกับบริบท ควรทำอย่างไร?', answer: 'ส่งข้อความพร้อมบริบทเพิ่มเติมในแชต โดยปิดบังข้อมูลส่วนตัว การส่งใหม่จะเป็นการตรวจอีกเคสหนึ่ง' },
  { question: 'ทำไมเปิดผลเก่าไม่ได้?', answer: 'ต้องใช้บัญชี LINE เดียวกับที่ส่งตรวจ หรือเคสอาจถูกลบไปแล้วจากหน้าบัญชี หากเปิดไม่ได้ให้ส่งข้อความมาตรวจใหม่ในแชตเดิม' },
];

export default function MiniHelp() {
  // คำตอบใช้ชุดเดียวกันทั้งหน้าตัวอย่างและหน้าจริง จึงไม่ต้องแยกตาม live
  const visibleQuestions = questions;
  return (
    <>
      <MiniPageHeading title="ใช้ Eh?Bot ยังไง?" pose="guide" />
      <div className="mini-page-body">
        <div className="mini-intro">
          <h2>เช็กง่าย ใน 3 ขั้น</h2>
          <p className="mini-secondary">ส่งข้อความ แล้วให้เราช่วยดู</p>
        </div>
        <ol className="mini-help-steps">
          {helpSteps.map((step, index) => (
            <li key={step.title}>
              <span className={`mini-status-icon ${index === 1 ? 'risk_found' : 'no_risk_found'}`}>
                <span className="mini-step-number">{index + 1}</span>
                <step.icon aria-hidden="true" />
              </span>
              <div><h2>{step.title}</h2><p className="mini-secondary">{step.description}</p></div>
            </li>
          ))}
        </ol>
        <section className="mini-card mini-mint mini-advice-row">
          <span className="mini-advice-icon"><EyeOff aria-hidden="true" /></span>
          <div><h2>ปิดบังข้อมูลก่อนส่ง</h2><p>เช่น เลขบัตร รหัสผ่าน และ OTP</p></div>
        </section>
        <MiniChatButton label="เริ่มคุยกับ Eh?Bot" />
        <section className="mini-card mini-faq">
          <h2>คำถามที่พบบ่อย</h2>
          {visibleQuestions.map((item) => (
            <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>
          ))}
        </section>
      </div>
    </>
  );
}
