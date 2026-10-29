export interface MiniLiff {
  init(options: { liffId: string }): Promise<void>;
  isLoggedIn(): boolean;
  getIDToken(): string | null;
  login(options: { redirectUri: string }): void;
  isInClient(): boolean;
  closeWindow(): void;
  getProfile(): Promise<unknown>;
}

export interface LineProfile {
  displayName: string;
  pictureUrl?: string;
}

// ข้อมูลโปรไฟล์ใช้แสดงผลเท่านั้น ห้ามใช้ยืนยันเจ้าของเคส (backend ตรวจ ID token แทน)
export function readLineProfile(value: unknown): LineProfile | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const profile = value as Record<string, unknown>;
  if (typeof profile.displayName !== 'string') return undefined;
  const displayName = profile.displayName.trim().slice(0, 60);
  if (!displayName) return undefined;
  // รับเฉพาะรูปผ่าน HTTPS ค่าแปลกหรือ javascript: จะไม่ถูกใส่ใน <img>
  let pictureUrl: string | undefined;
  if (typeof profile.pictureUrl === 'string') {
    try {
      const url = new URL(profile.pictureUrl);
      if (url.protocol === 'https:') pictureUrl = url.href;
    } catch {
      pictureUrl = undefined;
    }
  }
  return { displayName, pictureUrl };
}

declare global {
  interface Window { liff?: MiniLiff }
}

let sdkPromise: Promise<MiniLiff> | undefined;
let initialization: Promise<MiniLiff> | undefined;

export function miniLoginTarget(currentUrl: string, liffId: string, caseId: string) {
  if (!/^[0-9]+-[A-Za-z0-9]+$/.test(liffId) || (caseId && !/^[0-9a-f]{32}$/.test(caseId))) {
    throw new Error('ข้อมูลสำหรับเปิด LINE ไม่ถูกต้อง กรุณาเปิดจากปุ่มในแชตใหม่');
  }
  const current = new URL(currentUrl);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(current.hostname);
  if (current.protocol !== 'https:' || local) {
    // LINE ไม่ยอมรับ localhost เป็น redirect ของ Endpoint ที่ตั้งเป็น HTTPS
    const launch = new URL(`https://liff.line.me/${liffId}`);
    if (caseId) launch.searchParams.set('case', caseId);
    return { launchLiff: true, url: launch.href };
  }
  current.search = '';
  current.hash = '';
  if (caseId) current.searchParams.set('case', caseId);
  return { launchLiff: false, url: current.href };
}

function loadLiffSdk(): Promise<MiniLiff> {
  if (window.liff) return Promise.resolve(window.liff);
  if (!sdkPromise) {
    sdkPromise = new Promise<MiniLiff>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://static.line-scdn.net/liff/edge/versions/2.31.1/sdk.js';
      script.async = true;
      script.charset = 'utf-8';
      script.referrerPolicy = 'no-referrer';
      const fail = () => {
        window.clearTimeout(timer);
        script.remove();
        reject(new Error('โหลดระบบ LINE ไม่สำเร็จ กรุณาตรวจอินเทอร์เน็ตแล้วลองใหม่'));
      };
      const timer = window.setTimeout(fail, 15000);
      script.onerror = fail;
      script.onload = () => {
        window.clearTimeout(timer);
        if (window.liff) resolve(window.liff);
        else fail();
      };
      document.head.appendChild(script);
    }).catch(error => { sdkPromise = undefined; throw error; });
  }
  return sdkPromise;
}

export function initializeMiniLiff(): Promise<MiniLiff> {
  if (!initialization) {
    initialization = (async () => {
      const liffId = (import.meta.env.VITE_MINI_LIFF_ID || '').trim();
      if (!/^[0-9]+-[A-Za-z0-9]+$/.test(liffId)) {
        throw new Error('หน้านี้ยังไม่ได้ตั้งค่าเชื่อมต่อ LINE กรุณาติดต่อผู้ดูแล');
      }
      const liff = await loadLiffSdk();
      // รอ SDK จัดการ liff.state และ redirect ก่อนอ่านรหัสเคส
      try {
        await liff.init({ liffId });
      } catch {
        throw new Error('ยังเปิดระบบ LINE ไม่สำเร็จ โปรดตรวจการตั้งค่าแอปและลองใหม่');
      }
      return liff;
    })().catch(error => {
      initialization = undefined;
      throw error;
    });
  }
  return initialization;
}
