import { useSearchParams } from 'react-router-dom';
import MiniHome from './MiniHome';
import MiniLiveDetail from './MiniLiveDetail';

// มีรหัสเคส (เปิดจากปุ่มในการ์ด) = หน้าผลตรวจ; ไม่มี (เปิดจากเมนู LINE) = หน้าแรก
export default function MiniLiveEntry() {
  const [params] = useSearchParams();
  return params.get('case') ? <MiniLiveDetail /> : <MiniHome />;
}
