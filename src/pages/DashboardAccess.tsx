import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Eye, EyeOff, LockKeyhole, ShieldCheck } from 'lucide-react';
import { request } from '../services/api';
import './DashboardAccess.css';

export default function DashboardAccess() {
  const location = useLocation();
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(() => !!sessionStorage.getItem('dashboardToken'));
  const [token, setToken] = useState('');
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const saved = sessionStorage.getItem('dashboardToken');
    function signedOut() {
      active = false;
      setAuthenticated(false);
      setChecking(false);
      setToken('');
    }
    window.addEventListener('dashboard-logout', signedOut);
    if (saved) {
      request('/auth/session', saved)
        .then(() => { if (active) setAuthenticated(true); })
        .catch(() => {
          if (active) {
            sessionStorage.removeItem('dashboardToken');
            setError('กรุณาใส่รหัสเพื่อเข้าสู่ระบบอีกครั้ง');
          }
        })
        .finally(() => { if (active) setChecking(false); });
    }
    return () => { active = false; window.removeEventListener('dashboard-logout', signedOut); };
  }, []);

  const from = location.state?.from;
  const destination = typeof from === 'string' && from.startsWith('/') && !from.startsWith('//') && !from.startsWith('/login') ? from : '/';
  if (checking) return <main className="access-page"><p role="status">กำลังตรวจสอบสิทธิ์เข้าใช้งาน…</p></main>;
  if (authenticated) return location.pathname === '/login' ? <Navigate to={destination} replace /> : <Outlet />;
  if (location.pathname !== '/login') return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;

  return (
    <main className="access-page">
      <div className="access-panel">
        <section className="access-brand" aria-label="Eh?Bot">
          <div className="access-wordmark">Eh?Bot<span>.</span></div>
          <img src="/ehbot-logo.png" alt="มาสคอต Eh?Bot" width="240" height="240" />
          <h2>เอ๊ะก่อนคลิก<br />เช็กก่อนเชื่อ</h2>
          <p>พื้นที่สำหรับผู้ดูแล เพื่อดูภาพรวม<br />และติดตามความเสี่ยงจากแชท LINE</p>
          <span className="access-brand-note"><ShieldCheck size={20} aria-hidden="true" /> Security monitoring</span>
        </section>
        <section className="access-form-panel" aria-labelledby="access-title">
          <LockKeyhole className="access-lock" size={28} aria-hidden="true" />
          <h1 id="access-title">เข้าสู่ Dashboard</h1>
          <p>ใส่รหัสเข้าใช้งานของผู้ดูแลระบบเพื่อดำเนินการต่อ</p>
          <form onSubmit={async event => {
            event.preventDefault();
            if (busy || !token.trim()) return;
            setBusy(true);
            setError('');
            try {
              const candidate = token.trim();
              await request('/auth/session', candidate);
              sessionStorage.setItem('dashboardToken', candidate);
              setToken('');
              setAuthenticated(true);
            } catch (err) {
              setError(err instanceof TypeError || (err instanceof DOMException && err.name === 'TimeoutError')
                ? 'ติดต่อ Backend ไม่ได้ กรุณาตรวจการเชื่อมต่อแล้วลองอีกครั้ง'
                : err instanceof Error ? err.message : 'เข้าสู่ระบบไม่สำเร็จ กรุณาลองอีกครั้ง');
            } finally { setBusy(false); }
          }}>
            <label htmlFor="dashboard-token">รหัสเข้าใช้งาน</label>
            <div className="access-input">
              <input id="dashboard-token" name="password" type={visible ? 'text' : 'password'} autoComplete="current-password" required
                placeholder="กรอก DASHBOARD_API_TOKEN" value={token} disabled={busy}
                aria-invalid={!!error} aria-describedby={error ? 'access-error access-help' : 'access-help'}
                onChange={event => { setToken(event.target.value); setError(''); }} />
              <button type="button" onClick={() => setVisible(!visible)} aria-label={visible ? 'ซ่อนรหัส' : 'แสดงรหัส'} aria-pressed={visible}>
                {visible ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p id="access-help" className="access-help">ใช้รหัส DASHBOARD_API_TOKEN ที่ตั้งไว้ใน backend</p>
            {error && <p id="access-error" className="access-error" role="alert">{error}</p>}
            <button className="access-submit" type="submit" disabled={busy || !token.trim()}>{busy ? 'กำลังตรวจสอบรหัส…' : 'เข้าสู่ Dashboard'}</button>
            <span className="access-session">จำการเข้าสู่ระบบไว้เฉพาะในแท็บนี้</span>
          </form>
        </section>
      </div>
    </main>
  );
}
