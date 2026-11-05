import MiniPageHeading from '../components/MiniPageHeading';
import MiniChatButton from '../components/MiniChatButton';

// ปิดลิงก์เข้าหน้านี้ไว้จนกว่าเจ้าของโปรเจกต์ตรวจเนื้อหาแล้ว (หน้าผลตรวจและหน้าบัญชีอ่านค่านี้)
// เปิดใช้: ตรวจขั้นตอนด้านล่าง เพิ่มช่องทางติดต่อหน่วยงานที่ยืนยันแล้ว เอาป้าย "ร่าง" ออก แล้วเปลี่ยนเป็น true
export const RECOVERY_READY = false;

// ขั้นตอนทั่วไป ยังไม่ใส่เบอร์สายด่วนหรือลิงก์หน่วยงาน เพราะต้องตรวจความถูกต้องก่อนใช้จริง
const steps = [
  { title: 'หยุดตอบและไม่ทำตามเพิ่ม', description: 'ไม่ต้องโอน ไม่ส่งรหัส และไม่กดลิงก์เพิ่ม แม้ถูกเร่งหรือขู่' },
  { title: 'ถ้าโอนเงินหรือให้ข้อมูลบัญชี', description: 'ติดต่อธนาคารทันทีผ่านเบอร์หลังบัตรหรือแอปทางการ แจ้งว่าอาจถูกหลอกและขอระงับรายการ' },
  { title: 'ถ้าให้รหัสผ่านหรือ OTP', description: 'เปลี่ยนรหัสผ่านของบัญชีนั้น และออกจากระบบในเครื่องอื่นทั้งหมด' },
  { title: 'ถ้าติดตั้งแอปตามลิงก์', description: 'ปิดอินเทอร์เน็ต ลบแอปที่ไม่รู้จัก และให้คนที่ไว้ใจหรือร้านที่ดูแลเครื่องช่วยตรวจ' },
  { title: 'เก็บหลักฐานแล้วแจ้งความ', description: 'แคปหน้าจอแชต เลขบัญชีปลายทาง และสลิป แล้วแจ้งเจ้าหน้าที่ตำรวจ' },
];

export default function MiniRecovery() {
  return (
    <>
      <MiniPageHeading title="เผลอทำตามไปแล้ว?" pose="guide" />
      <div className="mini-page-body">
        <p className="mini-chat-notice" role="note">ร่าง · เนื้อหารอตรวจสอบก่อนใช้งานจริง</p>
        <p className="mini-home-lead">ไม่ต้องตกใจ ทำทีละขั้นตามนี้</p>
        <ol className="mini-numbered">
          {steps.map(step => <li key={step.title}><h3>{step.title}</h3><p>{step.description}</p></li>)}
        </ol>
        <MiniChatButton label="กลับไปแชต LINE" />
      </div>
    </>
  );
}
