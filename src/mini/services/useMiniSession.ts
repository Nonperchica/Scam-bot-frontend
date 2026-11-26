import { useEffect, useState } from 'react';
import { LOGIN_EXPIRED, deleteMiniHistory, fetchMiniCase, fetchMiniHistory } from './miniApi';
import type { MiniCaseData, MiniHistoryItem } from './miniApi';
import { initializeMiniLiff, miniLoginTarget, readLineProfile } from './miniLiff';
import type { LineProfile, MiniLiff } from './miniLiff';

interface SessionView {
  caseId: string;
  loading: boolean;
  liff?: MiniLiff;
  detail?: MiniCaseData;
  error?: string;
  login?: boolean;
}

// hook กลางของ Mini App: ล็อกอิน LIFF เปิดเคสจาก ?case= โหลดประวัติและโปรไฟล์; โหมดตัวอย่าง (live=false) ไม่เรียกอะไรเลย
export function useMiniSession(live: boolean, caseId: string) {
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<SessionView>({ caseId, loading: live });
  // เปลี่ยนรหัสเคสแล้วซ่อนผลเก่าทันที ไม่รอให้คำขอใหม่เสร็จ
  const view: SessionView = state.caseId === caseId ? state : { caseId, loading: live };

  useEffect(() => {
    if (!live) return;
    const controller = new AbortController();
    let active = true;
    let liff: MiniLiff | undefined;
    const timeout = window.setTimeout(() => {
      if (active) {
        active = false;
        controller.abort();
        setState({ caseId, loading: false, liff, error: 'ใช้เวลาเปิดผลนานเกินไป กรุณาตรวจอินเทอร์เน็ตแล้วลองใหม่' });
      }
    }, 30000);
    // เปิดเคส: init LIFF → เช็กรหัสเคส → เช็กล็อกอิน → ขอ ID token → fetchMiniCase
    async function load() {
      try {
        liff = await initializeMiniLiff();
        if (!active) return;
        // อ่านหลัง init เพราะ SDK อาจจัดการ liff.state และ redirect
        const currentId = new URL(window.location.href).searchParams.get('case') || '';
        if (currentId && !/^[0-9a-f]{32}$/.test(currentId)) throw new Error('รหัสเคสไม่ถูกต้อง กรุณาเปิดจากปุ่มในแชต LINE');
        if (!liff.isLoggedIn()) {
          setState({ caseId, loading: false, liff, login: true });
          return;
        }
        if (!currentId) {
          setState({ caseId, loading: false, liff });
          return;
        }
        const token = liff.getIDToken();
        if (!token) throw new Error('ยังไม่ได้รับสิทธิ์เข้าสู่ระบบ กรุณาตรวจ scope openid หรือเปิดจาก LINE ใหม่');
        const detail = await fetchMiniCase(currentId, token, controller.signal);
        if (active) setState({ caseId, loading: false, liff, detail });
      } catch (error) {
        if (active) setState({ caseId, loading: false, liff, error: error instanceof Error ? error.message : 'เปิดผลตรวจไม่ได้ กรุณาลองใหม่' });
      } finally {
        window.clearTimeout(timeout);
      }
    }
    void load();
    return () => { active = false; controller.abort(); window.clearTimeout(timeout); };
  }, [live, caseId, revision]);

  // ประวัติแยก state จากเคสที่เปิด เพื่อเปลี่ยนเคสแล้วรายการไม่หายไปด้วย
  const [history, setHistory] = useState<{ items: MiniHistoryItem[]; loading: boolean; error: string }>(
    { items: [], loading: live, error: '' });
  const [historyRevision, setHistoryRevision] = useState(0);
  const signedInLiff = view.liff?.isLoggedIn() ? view.liff : undefined;

  useEffect(() => {
    if (!live || !signedInLiff) return;
    const controller = new AbortController();
    // โหลดรายการประวัติด้วย ID token ของผู้ใช้ที่ล็อกอินแล้ว
    async function loadHistory() {
      try {
        const token = signedInLiff?.getIDToken();
        if (!token) throw new Error('ยังไม่ได้รับสิทธิ์เข้าสู่ระบบ กรุณาเปิดจาก LINE ใหม่');
        const items = await fetchMiniHistory(token, controller.signal);
        // ถูกยกเลิกระหว่างรอ (เช่น ผู้ใช้กดลบ) ห้ามเอารายการเก่ามาทับ
        if (controller.signal.aborted) return;
        setHistory({ items, loading: false, error: '' });
      } catch (error) {
        if (controller.signal.aborted) return;
        setHistory({ items: [], loading: false, error: error instanceof Error ? error.message : 'โหลดประวัติไม่ได้ กรุณาลองใหม่' });
      }
    }
    void loadHistory();
    return () => controller.abort();
  }, [live, signedInLiff, historyRevision]);

  // ชื่อและรูปจาก LINE (ต้องเปิด scope profile ใน LIFF); อ่านไม่ได้ก็ใช้ข้อความเดิม หน้าไม่พัง
  const [profile, setProfile] = useState<LineProfile | undefined>();
  useEffect(() => {
    if (!live || !signedInLiff) return;
    let active = true;
    signedInLiff.getProfile()
      .then(value => { if (active) setProfile(readLineProfile(value)); })
      .catch(() => { if (active) setProfile(undefined); });
    return () => { active = false; };
  }, [live, signedInLiff]);

  // ปุ่มโหลดประวัติใหม่: เปลี่ยน historyRevision ให้ effect ประวัติรันอีกรอบ
  function reloadHistory() {
    if (history.error === LOGIN_EXPIRED) { renewLogin(); return; }
    setHistory(current => ({ ...current, loading: true, error: '' }));
    setHistoryRevision(value => value + 1);
  }

  // ลบจริงที่ฐานข้อมูล แล้วล้างรายการในหน้าทันที; error ส่งต่อให้หน้าบัญชีแสดง
  async function deleteHistory(): Promise<number> {
    const token = signedInLiff?.getIDToken();
    if (!token) throw new Error('ยังไม่ได้รับสิทธิ์เข้าสู่ระบบ กรุณาเปิดจาก LINE ใหม่');
    const deleted = await deleteMiniHistory(token);
    setHistory({ items: [], loading: false, error: '' });
    // เปลี่ยน revision เพื่อยกเลิกคำขอประวัติที่ค้างอยู่ แล้วโหลดใหม่ (ซึ่งจะว่าง)
    setHistoryRevision(value => value + 1);
    return deleted;
  }

  // ปุ่มลองเปิดเคสใหม่: เปลี่ยน revision ให้ effect เปิดเคสรันอีกรอบ
  function retry() {
    if (view.error === LOGIN_EXPIRED) { renewLogin(); return; }
    setState({ caseId, loading: true });
    setRevision(value => value + 1);
  }

  // ปุ่มเข้าสู่ระบบ LINE แล้วกลับมาที่เคสเดิม
  function login() {
    try {
      const target = miniLoginTarget(window.location.href,
        (import.meta.env.VITE_MINI_LIFF_ID || '').trim(), view.detail?.id || caseId);
      if (target.launchLiff) window.location.assign(target.url);
      else view.liff?.login({ redirectUri: target.url });
    } catch {
      setState({ caseId, loading: false, liff: view.liff, error: 'เปิด LINE ไม่สำเร็จ กรุณาเปิดจากปุ่มในแชตเดิม' });
    }
  }

  // token หมดอายุแต่ isLoggedIn() ยังเป็น true: ต้อง logout ล้าง token เก่าก่อน
  // ในแอป LINE ใช้ liff.login() ไม่ได้ จึงโหลดหน้าใหม่ให้ init ออก token ให้; ผู้ใช้กดเองเท่านั้น จึงไม่วนซ้ำ
  function renewLogin() {
    view.liff?.logout();
    if (view.liff?.isInClient()) window.location.reload();
    else login();
  }

  const canReturnToLine = Boolean(view.liff?.isInClient());
  // ปิด Mini App กลับไปแชต LINE (ทำได้เฉพาะเปิดในแอป LINE)
  function returnToLine() { if (canReturnToLine) view.liff?.closeWindow(); }

  // targetId: เปิดเคสที่เลือกจากรายการ; ไม่ส่ง = ใช้เคสที่กำลังเปิดอยู่
  function miniHref(page: 'home' | 'history' | 'detail' | 'lessons' | 'settings' | 'help', targetId?: string) {
    if (!live) return { home: '/mini', history: '/mini/history', detail: '/mini', lessons: '/mini/lessons', settings: '/mini/settings', help: '/mini/help' }[page];
    // หน้าแรกคือ /mini/result ที่ไม่มีรหัสเคส (มีรหัส = หน้าผลตรวจ) จึงไม่พารหัสไปด้วย
    if (page === 'home') return '/mini/result';
    const path = page === 'detail' ? '/mini/result' : `/mini/result/${page}`;
    const openedId = targetId || view.detail?.id || caseId;
    return openedId ? `${path}?case=${encodeURIComponent(openedId)}` : path;
  }

  return { live, caseId, loading: live && view.loading, detail: live ? view.detail : undefined,
    error: live ? view.error : undefined, needsLogin: live && view.login,
    signedIn: Boolean(view.liff?.isLoggedIn()), retry, login, canReturnToLine, returnToLine, miniHref,
    // โหลดประวัติเฉพาะเมื่อ login แล้ว (effect ด้านบน); ยังไม่ login หรือเปิด LINE ไม่ได้ จึงไม่ถือว่ากำลังโหลด
    history: live ? history.items : [], historyLoading: live && Boolean(signedInLiff) && history.loading,
    historyError: live ? history.error : '', reloadHistory, deleteHistory,
    profile: live ? profile : undefined };
}

export type MiniSession = ReturnType<typeof useMiniSession>;
