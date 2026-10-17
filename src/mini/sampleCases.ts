import type { LessonId } from './lessonTopics';
import type { MiniSession } from './services/useMiniSession';

export type DetectionStatus = 'risk_found' | 'uncertain' | 'no_risk_found';
export type WarningIcon = 'clock' | 'user' | 'link' | 'gift' | 'message' | 'calendar' | 'help';

export interface DetectionCase {
  id: string;
  title: string;
  category: 'link' | 'message' | 'gift';
  message: string;
  receivedAt: string;
  status: DetectionStatus;
  reason: string;
  lessonId: LessonId;
  warningPoints: { icon: WarningIcon; title: string; description: string }[];
  learningTopic: string;
  learningExplanation: string;
  checkingAdvice: string;
  nextSteps: string[];
}

export interface MiniLayoutContext extends MiniSession {
  largeText: boolean;
  setLargeText: (value: boolean) => void;
}

export const statusLabels: Record<DetectionStatus, string> = {
  risk_found: 'พบสัญญาณเสี่ยง',
  uncertain: 'ควรตรวจสอบเพิ่มเติม',
  no_risk_found: 'ยังไม่พบสัญญาณเสี่ยง',
};

export const statusAdvice: Record<DetectionStatus, string> = {
  risk_found: 'หยุดก่อนคลิก เช็กก่อนทำตาม',
  uncertain: 'เช็กผู้ส่งและเงื่อนไขก่อน',
  no_risk_found: 'อ่านบริบทประกอบอีกครั้ง',
};

// ข้อมูลสมมติสำหรับช่วงทำหน้าจอ ไม่ใช่ประวัติจาก LINE หรือผล AI จริง
export const sampleCases: DetectionCase[] = [
  {
    id: 'demo-electricity',
    title: 'ตรวจสิทธิ์คืนเงินค่าไฟฟ้า',
    category: 'link',
    lessonId: 'links',
    warningPoints: [
      { icon: 'gift', title: 'กล่าวอ้างสิทธิ์คืนเงิน', description: 'ตรวจเรื่องคืนเงินกับหน่วยงานจริง' },
      { icon: 'user', title: 'ชวนยืนยันข้อมูล', description: 'ตรวจว่าใครเป็นผู้ขอข้อมูล' },
      { icon: 'link', title: 'ลิงก์ยังไม่ได้ตรวจ', description: 'เข้าเว็บทางการด้วยตนเอง' },
    ],
    message: 'คุณได้รับสิทธิ์คืนเงินค่าไฟฟ้า กรุณาคลิกลิงก์เพื่อตรวจสอบและยืนยันข้อมูล',
    receivedAt: '2026-10-11T10:42:00+07:00',
    status: 'risk_found',
    reason: 'มีการกล่าวอ้างเรื่องการคืนเงินค่าไฟฟ้าและชักชวนให้คลิกลิงก์ ซึ่งเป็นรูปแบบที่มักพบในการแอบอ้างเพื่อหลอกลวงข้อมูลส่วนตัวหรือทรัพย์สิน',
    learningTopic: 'พบคำว่า “ลิงก์”',
    learningExplanation: 'คำนี้อย่างเดียวไม่ยืนยันการหลอกลวง บอตยังไม่ได้เปิดตรวจเว็บไซต์ปลายทาง',
    checkingAdvice: 'แยกว่าเป็นการชักชวนให้เปิดลิงก์จริง หรือการยกตัวอย่างและเตือนภัย',
    nextSteps: [
      'เข้าแอปหรือเว็บไซต์ทางการด้วยตนเอง',
      'ตรวจเรื่องคืนเงินผ่านช่องทางทางการที่ค้นหาเอง',
      'หากข้อมูลไม่พอ ส่งข้อความพร้อมบริบทใหม่ โดยปิดบังข้อมูลส่วนตัว',
    ],
  },
  {
    id: 'demo-meeting',
    title: 'นัดประชุมพรุ่งนี้ 10 โมง',
    category: 'message',
    lessonId: 'impersonation',
    warningPoints: [
      { icon: 'calendar', title: 'เป็นข้อความนัดหมาย', description: 'เช็กวันและเวลากับคู่สนทนา' },
      { icon: 'message', title: 'ดูบริบทการสนทนา', description: 'ผลนี้ยังไม่ยืนยันว่าใครเป็นผู้ส่ง' },
    ],
    message: 'พรุ่งนี้ประชุมทีมเวลา 10 โมง ที่ห้องประชุมเดิม ฝากเตรียมสรุปงานมาด้วยนะ',
    receivedAt: '2026-10-11T09:15:00+07:00',
    status: 'no_risk_found',
    reason: 'ข้อความตัวอย่างเป็นการนัดประชุม ยังไม่พบการชักชวนให้เปิดลิงก์ จ่ายเงิน หรือส่งข้อมูลส่วนตัว',
    learningTopic: 'อ่านบริบทให้ครบ',
    learningExplanation: 'ผลนี้อ้างอิงเฉพาะข้อความที่ส่ง ไม่ยืนยันว่าผู้ส่งเป็นบุคคลที่คุณรู้จัก',
    checkingAdvice: 'หากภายหลังมีการขอเงินหรือรหัสยืนยัน ให้พิจารณาข้อความใหม่นั้นเพิ่มเติม',
    nextSteps: ['อ่านบริบทการสนทนาให้ครบ', 'ตรวจสอบก่อนทำตามหากมีคำขอเงินหรือข้อมูลเพิ่มเติม'],
  },
  {
    id: 'demo-prize',
    title: 'รับสิทธิ์ของรางวัลฟรี',
    category: 'gift',
    lessonId: 'prizes',
    warningPoints: [
      { icon: 'gift', title: 'เสนอของรางวัล', description: 'ดูที่มาและเงื่อนไขการรับ' },
      { icon: 'help', title: 'ข้อมูลยังไม่ครบ', description: 'ตรวจผ่านช่องทางของผู้จัดจริง' },
    ],
    message: 'คุณได้รับสิทธิ์ของรางวัลฟรี ติดต่อกลับเพื่อรับรายละเอียด',
    receivedAt: '2026-10-10T18:30:00+07:00',
    status: 'uncertain',
    reason: 'ข้อความไม่ได้ระบุผู้จัดกิจกรรม เงื่อนไข หรือที่มาของสิทธิ์ จึงมีข้อมูลไม่พอสำหรับประเมิน',
    learningTopic: 'ยังไม่ทราบที่มาของสิทธิ์',
    learningExplanation: 'การกล่าวถึงของรางวัลเพียงอย่างเดียวยังไม่ยืนยันว่าเป็นการหลอกลวง',
    checkingAdvice: 'ตรวจว่าคุณเคยเข้าร่วมกิจกรรมใด และผู้จัดประกาศเงื่อนไขไว้อย่างไร',
    nextSteps: ['ตรวจสอบผู้จัดกิจกรรมจากช่องทางที่ค้นหาเอง', 'อ่านเงื่อนไขก่อนติดต่อกลับหรือให้ข้อมูล'],
  },
];

export function formatCaseTime(receivedAt: string): string {
  return new Intl.DateTimeFormat('th-TH', {
    timeZone: 'Asia/Bangkok',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(receivedAt));
}
