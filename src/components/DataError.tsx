import { useState } from 'react';
import { RefreshCw, WifiOff } from 'lucide-react';

export default function DataError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const [token, setToken] = useState('');
  return (
    <section className="data-error">
      <div className="data-error-message" role="alert"><WifiOff size={22} /><div><h2>ยังเชื่อมต่อข้อมูลไม่ได้</h2><p>{message}</p></div></div>
      <form onSubmit={event => {
        event.preventDefault();
        if (token.trim()) sessionStorage.setItem('dashboardToken', token.trim());
        if (onRetry) onRetry(); else window.location.reload();
      }}>
        <label><span>รหัสเข้า Dashboard (ถ้ามี)</span><input type="password" autoComplete="current-password" placeholder="กรอกรหัสเข้าใช้งาน" value={token} onChange={event => setToken(event.target.value)} /></label>
        <button className="button button-secondary" type="submit"><RefreshCw size={15} />ลองอีกครั้ง</button>
      </form>
    </section>
  );
}
