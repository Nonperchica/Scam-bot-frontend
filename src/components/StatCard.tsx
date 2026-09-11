// =============================================
// Senior Guard — StatCard Component
// =============================================

import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  accentColor?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  trend,
  accentColor = 'var(--color-accent)',
}: StatCardProps) {
  return (
    <div className="stat-card" style={{ '--card-accent': accentColor } as React.CSSProperties}>
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        <div className="stat-card-icon" style={{ color: accentColor }}>
          {icon}
        </div>
      </div>
      <div className="stat-card-value">{value}</div>
      {trend && (
        <div
          className={`stat-card-trend ${
            trend.isPositive ? 'stat-card-trend--up' : 'stat-card-trend--down'
          }`}
        >
          {trend.isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{Math.abs(trend.value)}% จากสัปดาห์ก่อน</span>
        </div>
      )}
    </div>
  );
}
