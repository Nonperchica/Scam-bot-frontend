import { useEffect, useState } from 'react';
import { deleteMiniHistory, fetchMiniCase, fetchMiniHistory } from './miniApi';
import type { MiniCaseData, MiniHistoryItem } from './miniApi';
import { initializeMiniLiff, miniLoginTarget } from './miniLiff';
import type { MiniLiff } from './miniLiff';

interface SessionView {
  caseId: string;
  loading: boolean;
  liff?: MiniLiff;
  detail?: MiniCaseData;
  error?: string;
  login?: boolean;
}

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

  function reloadHistory() {
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

  function retry() {
    setState({ caseId, loading: true });
    setRevision(value => value + 1);
  }

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

  const canReturnToLine = Boolean(view.liff?.isInClient());
  function returnToLine() { if (canReturnToLine) view.liff?.closeWindow(); }

  // targetId: เปิดเคสที่เลือกจากรายการ; ไม่ส่ง = ใช้เคสที่กำลังเปิดอยู่
  function miniHref(page: 'history' | 'detail' | 'lessons' | 'settings' | 'help', targetId?: string) {
    if (!live) return { history: '/mini', detail: '/mini', lessons: '/mini/lessons', settings: '/mini/settings', help: '/mini/help' }[page];
    const path = page === 'detail' ? '/mini/result' : `/mini/result/${page}`;
    const openedId = targetId || view.detail?.id || caseId;
    return openedId ? `${path}?case=${encodeURIComponent(openedId)}` : path;
  }

  return { live, caseId, loading: live && view.loading, detail: live ? view.detail : undefined,
    error: live ? view.error : undefined, needsLogin: live && view.login,
    signedIn: Boolean(view.liff?.isLoggedIn()), retry, login, canReturnToLine, returnToLine, miniHref,
    history: live ? history.items : [], historyLoading: live && history.loading,
    historyError: live ? history.error : '', reloadHistory, deleteHistory };
}

export type MiniSession = ReturnType<typeof useMiniSession>;
