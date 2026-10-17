import type { DetectionCase } from '../sampleCases';

export type MiniCaseData = Pick<DetectionCase, 'id' | 'title' | 'category' | 'message' | 'receivedAt' | 'status' | 'reason' | 'lessonId' | 'warningPoints' | 'nextSteps'>;

// Bot API แยกจาก Dashboard; ถ้าไม่ระบุให้ใช้ reverse proxy ของเว็บ
function miniApiBase(): string {
  const configured = (import.meta.env.VITE_MINI_API_BASE_URL || '').trim();
  if (!configured) return '';
  const url = new URL(configured);
  const local = ['localhost', '127.0.0.1'].includes(url.hostname);
  if ((url.protocol !== 'https:' && !(local && url.protocol === 'http:'))
      || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('การตั้งค่าที่อยู่ระบบข้อมูล Mini App ไม่ถูกต้อง');
  }
  return url.origin;
}

export function isMiniCaseData(value: unknown): value is MiniCaseData {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  const icons = ['clock', 'user', 'link', 'gift', 'message', 'calendar', 'help'];
  const lessons = ['links', 'otp', 'prizes', 'urgency', 'payments', 'impersonation'];
  return ['id', 'title', 'message', 'receivedAt', 'reason'].every(key => typeof item[key] === 'string' && item[key].length > 0)
    && Number.isFinite(Date.parse(item.receivedAt as string))
    && ['risk_found', 'uncertain', 'no_risk_found'].includes(item.status as string)
    && ['link', 'message', 'gift'].includes(item.category as string)
    && lessons.includes(item.lessonId as string)
    && Array.isArray(item.nextSteps) && item.nextSteps.length > 0
    && item.nextSteps.every(step => typeof step === 'string' && step.length > 0)
    && Array.isArray(item.warningPoints) && item.warningPoints.length > 0
    && item.warningPoints.every(point => point && typeof point === 'object'
      && icons.includes(point.icon) && typeof point.title === 'string' && typeof point.description === 'string');
}

export async function fetchMiniCase(caseId: string, idToken: string, signal: AbortSignal): Promise<MiniCaseData> {
  let response: Response;
  const base = miniApiBase();
  try {
    response = await fetch(`${base}/api/mini/cases/${caseId}`, {
      headers: { Authorization: `Bearer ${idToken}` },
      cache: 'no-store', credentials: 'omit', redirect: 'error', referrerPolicy: 'no-referrer', signal,
    });
  } catch (error) {
    if (signal.aborted) throw error;
    throw new Error('ติดต่อระบบข้อมูลไม่ได้ กรุณาตรวจอินเทอร์เน็ตแล้วลองใหม่', { cause: error });
  }
  if (response.status === 404) throw new Error('เคสอาจหมดอายุ บอตรีสตาร์ต หรือไม่ใช่เคสของคุณ กรุณาส่งข้อความมาตรวจใหม่ในแชตเดิม');
  if (response.status === 401) throw new Error('การเข้าสู่ระบบหมดอายุ กรุณาปิดหน้านี้แล้วเปิดจากปุ่มในแชต LINE ใหม่');
  if (!response.ok) throw new Error('ระบบยังเปิดผลตรวจไม่ได้ กรุณาลองใหม่ภายหลัง');
  let detail: unknown;
  try {
    detail = await response.json();
  } catch (error) {
    throw new Error('ข้อมูลผลตรวจไม่สมบูรณ์ กรุณาลองใหม่', { cause: error });
  }
  if (!isMiniCaseData(detail) || detail.id !== caseId) throw new Error('ข้อมูลผลตรวจไม่สมบูรณ์ กรุณาเปิดจากปุ่มในแชต LINE ใหม่');
  return detail;
}
