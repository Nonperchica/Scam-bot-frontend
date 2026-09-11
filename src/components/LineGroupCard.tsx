// =============================================
// Senior Guard — LineGroupCard Component
// =============================================

import { Users, ShieldAlert, ScanSearch, Calendar } from 'lucide-react';
import type { LineGroup } from '../types';
import { formatNumber } from '../utils/formatters';

interface LineGroupCardProps {
  group: LineGroup;
  index: number;
}

export default function LineGroupCard({ group, index }: LineGroupCardProps) {
  const joinDate = new Date(group.joinedAt).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div
      className="line-group-card"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Header: Group name + status */}
      <div className="line-group-card-header">
        <div className="line-group-avatar">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .346-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.271.18-.51.432-.596.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.349 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
          </svg>
        </div>
        <div className="line-group-info">
          <span className="line-group-name">{group.name}</span>
          <span className={`line-group-status line-group-status--${group.status}`}>
            <span className="line-group-status-dot" />
            {group.status === 'active' ? 'ออนไลน์' : 'ออฟไลน์'}
          </span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="line-group-stats">
        <div className="line-group-stat">
          <Users size={14} className="line-group-stat-icon" />
          <span className="line-group-stat-value">{formatNumber(group.memberCount)}</span>
          <span className="line-group-stat-label">สมาชิก</span>
        </div>
        <div className="line-group-stat">
          <ShieldAlert size={14} className="line-group-stat-icon line-group-stat-icon--danger" />
          <span className="line-group-stat-value">{formatNumber(group.threatsDetected)}</span>
          <span className="line-group-stat-label">ภัยคุกคาม</span>
        </div>
        <div className="line-group-stat">
          <ScanSearch size={14} className="line-group-stat-icon line-group-stat-icon--accent" />
          <span className="line-group-stat-value">{formatNumber(group.messagesScanned)}</span>
          <span className="line-group-stat-label">สแกนแล้ว</span>
        </div>
      </div>

      {/* Footer: Join date */}
      <div className="line-group-footer">
        <Calendar size={12} />
        <span>เพิ่มบอทเมื่อ {joinDate}</span>
      </div>
    </div>
  );
}
