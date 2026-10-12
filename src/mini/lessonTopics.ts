export type LessonId = 'links' | 'otp' | 'prizes' | 'urgency' | 'payments' | 'impersonation';

export const lessonTopics = [
  { id: 'links', title: 'ลิงก์ชวนคลิก', exampleBefore: 'กด ', highlightedText: 'ลิงก์นี้ทันที', exampleAfter: ' เพื่อยืนยันสิทธิ์คืนเงินของคุณ', advice: 'เปิดแอปหรือเว็บทางการเอง', explanation: 'ชื่อที่แสดงบนลิงก์ไม่ยืนยันความปลอดภัย บอตยังไม่ได้เปิดตรวจเว็บไซต์ปลายทาง' },
  { id: 'otp', title: 'ขอรหัส OTP', exampleBefore: 'ส่ง ', highlightedText: 'รหัส OTP', exampleAfter: ' มาให้เรา เพื่อช่วยยืนยันบัญชีของคุณ', advice: 'เก็บ OTP ไว้กับตัวเอง', explanation: 'อย่าส่ง OTP หรือรหัสผ่านให้คู่สนทนา รหัสอาจใช้เข้าบัญชีหรืออนุมัติรายการ' },
  { id: 'prizes', title: 'รางวัลฟรี', exampleBefore: 'ยินดีด้วย! คุณได้รับรางวัล โอน ', highlightedText: 'ค่าดำเนินการ', exampleAfter: ' ก่อนรับสิทธิ์', advice: 'ตรวจเงื่อนไขก่อนโอน', explanation: 'ตรวจผู้จัดกิจกรรมและเงื่อนไขจากช่องทางทางการก่อนให้ข้อมูลหรือรับสิทธิ์' },
  { id: 'urgency', title: 'ข้อความเร่งด่วน', exampleBefore: 'ยืนยันภายใน ', highlightedText: '5 นาที', exampleAfter: ' ไม่เช่นนั้นบัญชีจะถูกปิด', advice: 'หยุดอ่าน ก่อนรีบทำตาม', explanation: 'คำเร่งเพียงอย่างเดียวยังไม่ยืนยันว่าหลอกลวง ต้องดูว่าข้อความชักชวนให้ทำอะไร' },
  { id: 'payments', title: 'ให้โอนเงินก่อน', exampleBefore: 'ก่อนเริ่มงาน โอน ', highlightedText: 'ค่าประกัน', exampleAfter: ' แล้วจะคืนพร้อมค่าจ้าง', advice: 'ตรวจที่มาและผู้รับก่อนจ่าย', explanation: 'ตรวจผู้รับและเงื่อนไขจากแหล่งที่เชื่อถือได้ ไม่ใช้หลักฐานจากผู้ชักชวนเพียงฝ่ายเดียว' },
  { id: 'impersonation', title: 'แอบอ้างหน่วยงาน', exampleBefore: 'เราเป็น ', highlightedText: 'เจ้าหน้าที่', exampleAfter: ' กรุณายืนยันข้อมูลบัญชีทันที', advice: 'ติดต่อหน่วยงานด้วยตัวเอง', explanation: 'ชื่อหรือตำแหน่งที่อ้างยังยืนยันตัวตนไม่ได้ ติดต่อช่องทางทางการที่คุณค้นหาเอง' },
] satisfies Array<{ id: LessonId; title: string; exampleBefore: string; highlightedText: string; exampleAfter: string; advice: string; explanation: string }>;
