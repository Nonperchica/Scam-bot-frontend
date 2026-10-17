import { useSearchParams } from 'react-router-dom';
import MiniHistory from './MiniHistory';
import MiniLiveDetail from './MiniLiveDetail';

export default function MiniLiveEntry() {
  const [params] = useSearchParams();
  return params.get('case') ? <MiniLiveDetail /> : <MiniHistory />;
}
