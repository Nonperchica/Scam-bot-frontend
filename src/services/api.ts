import type { ThreatLog, DashboardStats, LineGroup, DashboardPeriod, DashboardSource } from '../types';

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
export const fetchDashboardStats = (period: DashboardPeriod = 'week', source: DashboardSource = 'all', target?: string) => request<DashboardStats>(`/dashboard?period=${period}&source=${source}${period !== 'week' && target ? `&target=${target}` : ''}`);
export const fetchThreatLogs = (source: DashboardSource = 'all') => request<ThreatLog[]>(`/threats?source=${source}`);
export const fetchLineGroups = () => request<LineGroup[]>('/line-groups');
export const fetchGroupById = async (id: string) => (await fetchLineGroups()).find(g => g.id === id);
export const fetchGroupTrendData = (id: string, period: DashboardPeriod = 'week', target?: string) => request<DashboardStats>(`/line-groups/${encodeURIComponent(id)}/trends?period=${period}${period !== 'week' && target ? `&target=${target}` : ''}`);
export const fetchGroupThreatLogs = (id: string) => request<ThreatLog[]>(`/threats?source_id=${encodeURIComponent(id)}`);
