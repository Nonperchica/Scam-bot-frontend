import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MiniChatButton({ label = 'เปิดแชต Eh?Bot' }: { label?: string }) {
  return <Link to="/mini/chat" className="mini-primary-button"><span className="mini-line-mark" aria-hidden="true">LINE</span><span>{label}</span><ChevronRight aria-hidden="true" /></Link>;
}
