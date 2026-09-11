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
}

/** ข้อมูลกราฟแนวโน้ม */
export interface TrendDataPoint {
  date: string;
  threats: number;
  scanned: number;
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
