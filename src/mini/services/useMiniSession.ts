import { useEffect, useState } from 'react';
import { fetchMiniCase } from './miniApi';
import type { MiniCaseData } from './miniApi';
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

  function miniHref(page: 'history' | 'detail' | 'lessons' | 'settings' | 'help') {
    if (!live) return { history: '/mini', detail: '/mini', lessons: '/mini/lessons', settings: '/mini/settings', help: '/mini/help' }[page];
    const path = page === 'detail' ? '/mini/result' : `/mini/result/${page}`;
    const openedId = view.detail?.id || caseId;
    return openedId ? `${path}?case=${encodeURIComponent(openedId)}` : path;
  }

  return { live, caseId, loading: live && view.loading, detail: live ? view.detail : undefined,
    error: live ? view.error : undefined, needsLogin: live && view.login,
    signedIn: Boolean(view.liff?.isLoggedIn()), retry, login, canReturnToLine, returnToLine, miniHref };
}

export type MiniSession = ReturnType<typeof useMiniSession>;
