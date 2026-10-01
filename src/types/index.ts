// =============================================
// Senior Guard — TypeScript Types & Interfaces
// =============================================

/** ระดับความเสี่ยงของข้อความ */
export type RiskLevel = 'high' | 'medium' | 'low';

/** สถานะการดำเนินการ */
export type ThreatStatus = 'blocked' | 'flagged' | 'reviewed' | 'pending';

/** โครงสร้างข้อมูลข้อความที่ตรวจจับว่าเป็นสแกม */
export interface ThreatLog {
  id: string;
  message: string;
  senderName: string;
  senderId: string;
  riskLevel: RiskLevel;
  confidence: number; // 0-100
  timestamp: string;  // ISO 8601
  status: ThreatStatus;
  category: string;   // e.g. "phishing", "investment_scam", "romance_scam"
  lineGroupName?: string;
}

/** สถิติภาพรวม Dashboard */
export interface DashboardStats {
  totalScanned: number;
  threatsDetected: number;
  riskRate: number;       // เปอร์เซ็นต์
  activeUsers: number;
  suspiciousSenders: number; // จำนวน user ที่ส่งข้อความน่าสงสัย
}

/** ข้อมูลกราฟแนวโน้ม */
export interface TrendDataPoint {
  date: string;
  totalMessages: number;      // จำนวนข้อความทั้งหมด
  suspiciousMessages: number;  // จำนวนข้อความที่น่าสงสัย
}

/** รายการเมนู Sidebar */
export interface SidebarMenuItem {
  label: string;
  path: string;
  icon: string;
}

/** กลุ่ม LINE ที่แชทบอทเชื่อมต่ออยู่ */
export interface LineGroup {
  id: string;
  name: string;
  memberCount: number;
  threatsDetected: number;
  messagesScanned: number;
  status: 'active' | 'inactive';
  joinedAt: string; // ISO 8601
  groupPictureUrl?: string;
}

/** Sort direction สำหรับตาราง */
export type SortDirection = 'asc' | 'desc';

/** Label สำหรับ Dataset */
export type DatasetLabel = 'spam' | 'ham';

/** ประเภทข้อมูล Dataset */
export type DatasetCategory = 'หลอกลงทุนทางการเงิน' | 'หลอกลวงผลิต' | 'ทั่วไป' | 'งาน/อาชีพ' | 'หลอกลวงทุน' | 'แจ้งเตือนระบบ' | string;

/** แหล่งข้อมูล Dataset */
export type DatasetSource = 'LINE' | 'SMS' | 'Facebook' | string;

/** รายการข้อมูลใน Dataset */
export interface DatasetEntry {
  id: string;
  message: string;
  label: DatasetLabel;
  category: string;
  source: DatasetSource;
  confirmed: boolean;
}

/** สถิติ Dataset */
export interface DatasetStats {
  total: number;
  spam: number;
  ham: number;
}
