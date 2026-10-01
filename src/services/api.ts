// =============================================
// Senior Guard — API Service (Mock Data)
// =============================================

import type { ThreatLog, DashboardStats, TrendDataPoint, LineGroup, DatasetEntry, DatasetStats } from '../types';

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
  suspiciousSenders: 87,
};

const mockTrendData: TrendDataPoint[] = [
  { date: '14 ส.ค.', totalMessages: 1820, suspiciousMessages: 28 },
  { date: '15 ส.ค.', totalMessages: 2100, suspiciousMessages: 35 },
  { date: '16 ส.ค.', totalMessages: 2350, suspiciousMessages: 42 },
  { date: '17 ส.ค.', totalMessages: 2200, suspiciousMessages: 38 },
  { date: '18 ส.ค.', totalMessages: 2580, suspiciousMessages: 55 },
  { date: '19 ส.ค.', totalMessages: 2410, suspiciousMessages: 48 },
  { date: '20 ส.ค.', totalMessages: 2750, suspiciousMessages: 62 },
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

/** ดึงข้อมูลกลุ่ม LINE ตาม ID */
export async function fetchGroupById(groupId: string): Promise<LineGroup | undefined> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockLineGroups.find((g) => g.id === groupId)), 300);
  });
}

// =============================================
// Mock Data — แนวโน้มรายกลุ่ม
// =============================================

const mockGroupTrendData: Record<string, TrendDataPoint[]> = {
  'G-001': [
    { date: '14 ส.ค.', totalMessages: 620, suspiciousMessages: 5 },
    { date: '15 ส.ค.', totalMessages: 680, suspiciousMessages: 7 },
    { date: '16 ส.ค.', totalMessages: 710, suspiciousMessages: 4 },
    { date: '17 ส.ค.', totalMessages: 590, suspiciousMessages: 3 },
    { date: '18 ส.ค.', totalMessages: 750, suspiciousMessages: 8 },
    { date: '19 ส.ค.', totalMessages: 640, suspiciousMessages: 6 },
    { date: '20 ส.ค.', totalMessages: 800, suspiciousMessages: 10 },
  ],
  'G-002': [
    { date: '14 ส.ค.', totalMessages: 380, suspiciousMessages: 3 },
    { date: '15 ส.ค.', totalMessages: 410, suspiciousMessages: 2 },
    { date: '16 ส.ค.', totalMessages: 450, suspiciousMessages: 5 },
    { date: '17 ส.ค.', totalMessages: 420, suspiciousMessages: 4 },
    { date: '18 ส.ค.', totalMessages: 390, suspiciousMessages: 2 },
    { date: '19 ส.ค.', totalMessages: 470, suspiciousMessages: 6 },
    { date: '20 ส.ค.', totalMessages: 500, suspiciousMessages: 3 },
  ],
  'G-003': [
    { date: '14 ส.ค.', totalMessages: 720, suspiciousMessages: 8 },
    { date: '15 ส.ค.', totalMessages: 780, suspiciousMessages: 10 },
    { date: '16 ส.ค.', totalMessages: 810, suspiciousMessages: 12 },
    { date: '17 ส.ค.', totalMessages: 690, suspiciousMessages: 6 },
    { date: '18 ส.ค.', totalMessages: 850, suspiciousMessages: 14 },
    { date: '19 ส.ค.', totalMessages: 770, suspiciousMessages: 9 },
    { date: '20 ส.ค.', totalMessages: 900, suspiciousMessages: 11 },
  ],
  'G-004': [
    { date: '14 ส.ค.', totalMessages: 180, suspiciousMessages: 1 },
    { date: '15 ส.ค.', totalMessages: 200, suspiciousMessages: 2 },
    { date: '16 ส.ค.', totalMessages: 190, suspiciousMessages: 1 },
    { date: '17 ส.ค.', totalMessages: 210, suspiciousMessages: 3 },
    { date: '18 ส.ค.', totalMessages: 175, suspiciousMessages: 1 },
    { date: '19 ส.ค.', totalMessages: 220, suspiciousMessages: 2 },
    { date: '20 ส.ค.', totalMessages: 230, suspiciousMessages: 2 },
  ],
  'G-005': [
    { date: '14 ส.ค.', totalMessages: 110, suspiciousMessages: 0 },
    { date: '15 ส.ค.', totalMessages: 130, suspiciousMessages: 1 },
    { date: '16 ส.ค.', totalMessages: 120, suspiciousMessages: 0 },
    { date: '17 ส.ค.', totalMessages: 140, suspiciousMessages: 2 },
    { date: '18 ส.ค.', totalMessages: 100, suspiciousMessages: 0 },
    { date: '19 ส.ค.', totalMessages: 125, suspiciousMessages: 1 },
    { date: '20 ส.ค.', totalMessages: 135, suspiciousMessages: 0 },
  ],
};

/** ดึงข้อมูลแนวโน้มของกลุ่ม LINE ตาม ID */
export async function fetchGroupTrendData(groupId: string): Promise<TrendDataPoint[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockGroupTrendData[groupId] || []), 400);
  });
}

/** ดึง Threat Logs สำหรับกลุ่มเฉพาะ */
export async function fetchGroupThreatLogs(groupName: string): Promise<ThreatLog[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = mockThreatLogs.filter((log) => log.lineGroupName === groupName);
      resolve(filtered);
    }, 400);
  });
}

// =============================================
// Mock Data — Dataset
// =============================================

const mockDatasetEntries: DatasetEntry[] = [
  {
    id: 'DS-0001',
    message: 'คุณได้รับสิทธิ์เงินคืนยอดเงินนี้ กดลิงก์เพื่อยืนยันข้อมูลทันที',
    label: 'spam',
    category: 'หลอกลวงทางการเงิน',
    source: 'LINE',
    confirmed: true,
  },
  {
    id: 'DS-0002',
    message: 'สวัสดีค่ะ นัดหมายประชุมกัน พรุ่งนี้เวลา 10:00 น. ที่ห้อง A1',
    label: 'ham',
    category: 'ทั่วไป',
    source: 'LINE',
    confirmed: true,
  },
  {
    id: 'DS-0003',
    message: 'ส่งมอบคุณลูกค้ารับ กรุณาแข็งบัตรกำนัลใน 24 ชม.',
    label: 'spam',
    category: 'หลอกลวงผลิต',
    source: 'SMS',
    confirmed: true,
  },
  {
    id: 'DS-0004',
    message: 'เอกสารรายงานประจำเดือน ถามไฟล์ที่แนบมาครับ',
    label: 'ham',
    category: 'งาน/อาชีพ',
    source: 'อีเมล',
    confirmed: true,
  },
  {
    id: 'DS-0005',
    message: 'ลงทุนกรับโป รับผลตอบแทนสูงถึง 100% ภายใน 7 วัน',
    label: 'spam',
    category: 'หลอกลวงทุน',
    source: 'Facebook',
    confirmed: true,
  },
  {
    id: 'DS-0006',
    message: 'ตัวแสตร์การปรับปรุงระบบ ในวันเสาร์ เวลา 02:00-04:00 น.',
    label: 'ham',
    category: 'แจ้งเตือนระบบ',
    source: 'LINE',
    confirmed: true,
  },
];

const mockDatasetStats: DatasetStats = {
  total: 2971,
  spam: 1486,
  ham: 1485,
};

/** ดึงรายการข้อมูล Dataset */
export async function fetchDatasetEntries(): Promise<DatasetEntry[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockDatasetEntries), 400);
  });
}

/** ดึงสถิติ Dataset */
export async function fetchDatasetStats(): Promise<DatasetStats> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockDatasetStats), 300);
  });
}
