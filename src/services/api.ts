// =============================================
// Senior Guard — API Service (Mock Data)
// =============================================

import type { ThreatLog, DashboardStats, TrendDataPoint, LineGroup } from '../types';

// =============================================
// Mock Data — จะเปลี่ยนเป็น API จริงภายหลัง
// =============================================

const mockThreatLogs: ThreatLog[] = [
  {
    id: 'TH-001',
    message: 'คุณได้รับรางวัลพิเศษ 100,000 บาท กรุณาคลิกลิงก์เพื่อรับรางวัล...',
    senderName: 'สมชาย ไม่ระบุนามสกุล',
    senderId: 'U1a2b3c4d5',
    riskLevel: 'high',
    confidence: 95,
    timestamp: '2026-08-19T14:30:00+07:00',
    status: 'blocked',
    category: 'lottery_scam',
    lineGroupName: 'กลุ่มผู้สูงอายุบ้านสุขใจ',
  },
  {
    id: 'TH-002',
    message: 'ลงทุนกับเราวันนี้ ได้กำไร 300% ภายใน 7 วัน การันตีผลตอบแทน...',
    senderName: 'นายหน้าลงทุน',
    senderId: 'U2b3c4d5e6',
    riskLevel: 'high',
    confidence: 92,
    timestamp: '2026-08-19T12:15:00+07:00',
    status: 'blocked',
    category: 'investment_scam',
    lineGroupName: 'กลุ่มออมทรัพย์ชุมชน',
  },
  {
    id: 'TH-003',
    message: 'สวัสดีค่ะ เราเป็นเจ้าหน้าที่ธนาคาร ต้องการยืนยันข้อมูลบัญชีของคุณ...',
    senderName: 'เจ้าหน้าที่ธนาคาร',
    senderId: 'U3c4d5e6f7',
    riskLevel: 'high',
    confidence: 88,
    timestamp: '2026-08-19T10:45:00+07:00',
    status: 'flagged',
    category: 'phishing',
    lineGroupName: 'กลุ่มชมรมผู้เกษียณ',
  },
  {
    id: 'TH-004',
    message: 'ผมรักคุณมาก ส่งเงินมาให้ผมหน่อยนะ ผมจะไปหาคุณเร็วๆนี้...',
    senderName: 'รักแท้จากต่างแดน',
    senderId: 'U4d5e6f7g8',
    riskLevel: 'medium',
    confidence: 75,
    timestamp: '2026-08-18T20:30:00+07:00',
    status: 'reviewed',
    category: 'romance_scam',
  },
  {
    id: 'TH-005',
    message: 'กู้เงินด่วน อนุมัติภายใน 30 นาที ไม่ต้องค้ำประกัน โอนเงินค่าดำเนินการก่อน...',
    senderName: 'สินเชื่อด่วน',
    senderId: 'U5e6f7g8h9',
    riskLevel: 'high',
    confidence: 90,
    timestamp: '2026-08-18T16:00:00+07:00',
    status: 'blocked',
    category: 'loan_scam',
    lineGroupName: 'กลุ่มผู้สูงอายุบ้านสุขใจ',
  },
  {
    id: 'TH-006',
    message: 'ผมเป็นตำรวจ คุณมีคดีค้างอยู่ ต้องโอนเงินมาเพื่อประกันตัว...',
    senderName: 'พ.ต.อ.ปลอม',
    senderId: 'U6f7g8h9i0',
    riskLevel: 'high',
    confidence: 97,
    timestamp: '2026-08-18T09:20:00+07:00',
    status: 'blocked',
    category: 'impersonation',
    lineGroupName: 'กลุ่มชมรมผู้เกษียณ',
  },
  {
    id: 'TH-007',
    message: 'แนะนำงานออนไลน์ทำที่บ้าน รายได้วันละ 5,000 บาท สนใจทักมา...',
    senderName: 'งานออนไลน์',
    senderId: 'U7g8h9i0j1',
    riskLevel: 'medium',
    confidence: 68,
    timestamp: '2026-08-17T15:45:00+07:00',
    status: 'flagged',
    category: 'investment_scam',
  },
  {
    id: 'TH-008',
    message: 'คุณมีพัสดุค้างส่ง กรุณากดลิงก์นี้เพื่อยืนยันที่อยู่จัดส่ง...',
    senderName: 'ขนส่งพัสดุ',
    senderId: 'U8h9i0j1k2',
    riskLevel: 'medium',
    confidence: 72,
    timestamp: '2026-08-17T11:10:00+07:00',
    status: 'pending',
    category: 'phishing',
    lineGroupName: 'กลุ่มผู้สูงอายุบ้านสุขใจ',
  },
  {
    id: 'TH-009',
    message: 'สวัสดีครับ สบายดีไหม วันนี้อากาศดีนะครับ',
    senderName: 'คุณลุงสมศักดิ์',
    senderId: 'U9i0j1k2l3',
    riskLevel: 'low',
    confidence: 15,
    timestamp: '2026-08-17T08:30:00+07:00',
    status: 'reviewed',
    category: 'other',
    lineGroupName: 'กลุ่มผู้สูงอายุบ้านสุขใจ',
  },
  {
    id: 'TH-010',
    message: 'ท่านได้รับสิทธิ์พิเศษจากรัฐบาล เงินเยียวยา 15,000 บาท กรอกข้อมูลที่ลิงก์...',
    senderName: 'สิทธิ์พิเศษ',
    senderId: 'U0j1k2l3m4',
    riskLevel: 'high',
    confidence: 93,
    timestamp: '2026-08-16T13:00:00+07:00',
    status: 'blocked',
    category: 'phishing',
    lineGroupName: 'กลุ่มออมทรัพย์ชุมชน',
  },
];

const mockStats: DashboardStats = {
  totalScanned: 15847,
  threatsDetected: 342,
  riskRate: 2.16,
  activeUsers: 1253,
};

const mockTrendData: TrendDataPoint[] = [
  { date: '14 ส.ค.', threats: 28, scanned: 1820 },
  { date: '15 ส.ค.', threats: 35, scanned: 2100 },
  { date: '16 ส.ค.', threats: 42, scanned: 2350 },
  { date: '17 ส.ค.', threats: 38, scanned: 2200 },
  { date: '18 ส.ค.', threats: 55, scanned: 2580 },
  { date: '19 ส.ค.', threats: 48, scanned: 2410 },
  { date: '20 ส.ค.', threats: 62, scanned: 2750 },
];

// =============================================
// API Functions — ใช้ mock data ก่อน
// =============================================

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/** ดึงสถิติภาพรวม */
export async function fetchDashboardStats(): Promise<DashboardStats> {
  // TODO: เปลี่ยนเป็น fetch จริง
  // const res = await fetch(`${BASE_URL}/stats`);
  // return res.json();
  void BASE_URL;
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockStats), 500);
  });
}

/** ดึงรายการ Threat Logs */
export async function fetchThreatLogs(): Promise<ThreatLog[]> {
  // TODO: เปลี่ยนเป็น fetch จริง
  // const res = await fetch(`${BASE_URL}/threats`);
  // return res.json();
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockThreatLogs), 600);
  });
}

/** ดึงข้อมูลแนวโน้มสำหรับกราฟ */
export async function fetchTrendData(): Promise<TrendDataPoint[]> {
  // TODO: เปลี่ยนเป็น fetch จริง
  // const res = await fetch(`${BASE_URL}/trends`);
  // return res.json();
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockTrendData), 400);
  });
}

// =============================================
// Mock Data — กลุ่ม LINE ที่บอทเชื่อมต่อ
// =============================================

const mockLineGroups: LineGroup[] = [
  {
    id: 'G-001',
    name: 'กลุ่มผู้สูงอายุบ้านสุขใจ',
    memberCount: 156,
    threatsDetected: 24,
    messagesScanned: 4520,
    status: 'active',
    joinedAt: '2026-06-15T10:00:00+07:00',
  },
  {
    id: 'G-002',
    name: 'กลุ่มออมทรัพย์ชุมชน',
    memberCount: 89,
    threatsDetected: 15,
    messagesScanned: 2870,
    status: 'active',
    joinedAt: '2026-07-02T14:30:00+07:00',
  },
  {
    id: 'G-003',
    name: 'กลุ่มชมรมผู้เกษียณ',
    memberCount: 203,
    threatsDetected: 31,
    messagesScanned: 5140,
    status: 'active',
    joinedAt: '2026-07-10T09:00:00+07:00',
  },
  {
    id: 'G-004',
    name: 'กลุ่มสุขภาพดีวัยทอง',
    memberCount: 67,
    threatsDetected: 8,
    messagesScanned: 1350,
    status: 'active',
    joinedAt: '2026-08-01T11:15:00+07:00',
  },
  {
    id: 'G-005',
    name: 'กลุ่มวัดบ้านใหม่',
    memberCount: 42,
    threatsDetected: 3,
    messagesScanned: 890,
    status: 'inactive',
    joinedAt: '2026-05-20T08:00:00+07:00',
  },
];

/** ดึงรายชื่อกลุ่ม LINE ที่บอทเข้าร่วม */
export async function fetchLineGroups(): Promise<LineGroup[]> {
  // TODO: เปลี่ยนเป็น fetch จริง
  // const res = await fetch(`${BASE_URL}/line-groups`);
  // return res.json();
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockLineGroups), 450);
  });
}
