import { RefreshCw, WifiOff } from 'lucide-react';

export default function DataError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <section className="data-error">
      <div className="data-error-message" role="alert"><WifiOff size={22} /><div><h2>ยังเชื่อมต่อข้อมูลไม่ได้</h2><p>{message}</p></div></div>
      <button className="button button-secondary" onClick={() => onRetry ? onRetry() : window.location.reload()}><RefreshCw size={15} />ลองอีกครั้ง</button>
    </section>
  );
}
