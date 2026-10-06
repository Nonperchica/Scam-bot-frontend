import type { ThreatLog, DashboardStats, TrendDataPoint, LineGroup, DatasetEntry, DatasetStats } from '../types';

const BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

export function logout() {
  sessionStorage.removeItem('dashboardToken');
  window.dispatchEvent(new Event('dashboard-logout'));
}

export async function request<T>(path: string, token = sessionStorage.getItem('dashboardToken')): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) {
    if (res.status === 401) {
      if (path !== '/auth/session' && token === sessionStorage.getItem('dashboardToken')) logout();
      throw new Error('รหัสเข้า Dashboard ไม่ถูกต้อง กรุณาลองอีกครั้ง');
    }
    if (path === '/auth/session') throw new Error('ยังตรวจสอบรหัสไม่ได้ กรุณาตรวจว่า Backend พร้อมใช้งาน แล้วลองอีกครั้ง');
    throw new Error('โหลดข้อมูลจริงไม่สำเร็จ กรุณาตรวจว่า Backend เชื่อมต่อ Supabase แล้ว');
  }
  return res.json() as Promise<T>;
}
export const fetchDashboardStats = () => request<DashboardStats>('/dashboard');
export const fetchTrendData = async () => (await fetchDashboardStats()).trends;
export const fetchThreatLogs = () => request<ThreatLog[]>('/threats');
export const fetchLineGroups = () => request<LineGroup[]>('/line-groups');
export const fetchGroupById = async (id: string) => (await fetchLineGroups()).find(g => g.id === id);
export const fetchGroupTrendData = (id: string) => request<TrendDataPoint[]>(`/line-groups/${encodeURIComponent(id)}/trends`);
export const fetchGroupThreatLogs = (id: string) => request<ThreatLog[]>(`/threats?source_id=${encodeURIComponent(id)}`);

// Dataset management remains a separate demo feature; it is not dashboard history.
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
