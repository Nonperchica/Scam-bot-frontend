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

export type MiniHistoryItem = Pick<DetectionCase, 'id' | 'title' | 'category' | 'receivedAt' | 'status'>;

const LOGIN_EXPIRED = 'การเข้าสู่ระบบหมดอายุ กรุณาปิดหน้านี้แล้วเปิดจากปุ่มในแชต LINE ใหม่';
const CASE_NOT_FOUND = 'เปิดผลตรวจนี้ไม่ได้ เคสอาจถูกลบ หรือไม่ใช่เคสของบัญชี LINE นี้';

export function isMiniHistoryItem(value: unknown): value is MiniHistoryItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return typeof item.id === 'string' && /^[0-9a-f]{32}$/.test(item.id)
    && typeof item.title === 'string' && item.title.length > 0
    && typeof item.receivedAt === 'string' && Number.isFinite(Date.parse(item.receivedAt))
    && ['risk_found', 'uncertain', 'no_risk_found'].includes(item.status as string)
    && ['link', 'message', 'gift'].includes(item.category as string);
}

// ส่ง token ทาง header เท่านั้น ไม่ใช้ cookie และไม่ส่ง referrer
async function requestMiniApi(path: string, idToken: string, init: { method?: string; signal?: AbortSignal } = {}): Promise<Response> {
  try {
    return await fetch(`${miniApiBase()}${path}`, {
      method: init.method, headers: { Authorization: `Bearer ${idToken}` },
      cache: 'no-store', credentials: 'omit', redirect: 'error', referrerPolicy: 'no-referrer', signal: init.signal,
    });
  } catch (error) {
    if (init.signal?.aborted) throw error;
    throw new Error('ติดต่อระบบข้อมูลไม่ได้ กรุณาตรวจอินเทอร์เน็ตแล้วลองใหม่', { cause: error });
  }
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch (error) {
    throw new Error('ข้อมูลประวัติไม่สมบูรณ์ กรุณาลองใหม่', { cause: error });
  }
}

export async function fetchMiniHistory(idToken: string, signal: AbortSignal): Promise<MiniHistoryItem[]> {
  const response = await requestMiniApi('/api/mini/history', idToken, { signal });
  if (response.status === 401) throw new Error(LOGIN_EXPIRED);
  if (!response.ok) throw new Error('ระบบยังโหลดประวัติไม่ได้ กรุณาลองใหม่ภายหลัง');
  const body = await readJson(response) as { cases?: unknown };
  // รายการที่ผิดรูปแบบตัดทิ้งทีละรายการ ไม่ให้ทั้งหน้าพัง
  return Array.isArray(body?.cases) ? body.cases.filter(isMiniHistoryItem) : [];
}

export async function deleteMiniHistory(idToken: string): Promise<number> {
  const response = await requestMiniApi('/api/mini/history', idToken, { method: 'DELETE' });
  if (response.status === 401) throw new Error(LOGIN_EXPIRED);
  if (!response.ok) throw new Error('ระบบยังลบประวัติไม่ได้ กรุณาลองใหม่ภายหลัง');
  const body = await readJson(response) as { deleted?: unknown };
  return typeof body?.deleted === 'number' ? body.deleted : 0;
}

function wait(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) { reject(signal.reason); return; }
    const timer = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => { clearTimeout(timer); reject(signal.reason); }, { once: true });
  });
}

// retryDelayMs: บอตบันทึกเคสหลังส่งการ์ด (บางครั้งเกิน 1 วินาที) ผู้ใช้ที่กดปุ่มทันทีอาจได้ 404
// จึงลองใหม่ 2 ครั้ง รอ 1 เท่า แล้ว 2 เท่าของ retryDelayMs
export async function fetchMiniCase(caseId: string, idToken: string, signal: AbortSignal, retryDelayMs = 1000): Promise<MiniCaseData> {
  const path = `/api/mini/cases/${caseId}`;
  let response = await requestMiniApi(path, idToken, { signal });
  for (const factor of [1, 2]) {
    if (response.status !== 404) break;
    await wait(retryDelayMs * factor, signal);
    response = await requestMiniApi(path, idToken, { signal });
  }
  if (response.status === 404) throw new Error(CASE_NOT_FOUND);
  if (response.status === 401) throw new Error(LOGIN_EXPIRED);
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
