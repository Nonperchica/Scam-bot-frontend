// =============================================
// Senior Guard — ThreatTable Component
// =============================================

import { useState } from 'react';
import type { ThreatLog, SortDirection } from '../types';
import { formatDate, getRiskLabel, truncateText, parseImageMessage } from '../utils/formatters';
import { ArrowUpDown, Eye } from 'lucide-react';
import ThreatDetailModal from './ThreatDetailModal';

interface ThreatTableProps {
  logs: ThreatLog[];
  compact?: boolean; // true = แสดงแค่ 5 แถว สำหรับหน้า Overview
}

type SortKey = 'timestamp' | 'riskLevel';

const riskOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };

const statusConfig: Record<string, { label: string; className: string }> = {
  blocked: { label: 'บล็อกแล้ว', className: 'badge badge--blocked' },
  flagged: { label: 'พบความเสี่ยง', className: 'badge badge--flagged' },
  reviewed: { label: 'ตรวจสอบแล้ว', className: 'badge badge--reviewed' },
  pending: { label: 'รอดำเนินการ', className: 'badge badge--pending' },
};

export default function ThreatTable({ logs, compact = false }: ThreatTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('timestamp');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');
  const [selectedLog, setSelectedLog] = useState<ThreatLog | null>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sorted = [...logs].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case 'timestamp':
        cmp = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        break;
      case 'riskLevel':
        cmp = (riskOrder[a.riskLevel] || 0) - (riskOrder[b.riskLevel] || 0);
        break;
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const display = compact ? sorted.slice(0, 5) : sorted;

  return (
    <div className="threat-table-wrapper">
      <table className="threat-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>ประเภท</th>
            <th>ข้อความ</th>
            <th>ผู้ส่ง</th>
            <th aria-sort={sortKey === 'riskLevel' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
              <button className="table-sort-button" onClick={() => handleSort('riskLevel')}>ระดับเสี่ยง <ArrowUpDown size={12} /></button>
            </th>
            <th aria-sort={sortKey === 'timestamp' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
              <button className="table-sort-button" onClick={() => handleSort('timestamp')}>เวลา <ArrowUpDown size={12} /></button>
            </th>
            <th>สถานะ</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {display.length === 0 && <tr><td colSpan={8}>ไม่พบรายการความเสี่ยง</td></tr>}
          {display.map((log) => {
            const { isImage, isLink, displayText } = parseImageMessage(log.message, log.messageType);
            return (
              <tr key={log.id}>
                <td className="cell-id">{log.id}</td>
                <td>{isImage ? 'รูปภาพ' : isLink ? 'ลิงก์' : 'ข้อความ'}</td>
                <td className="cell-message" title={log.message}>
                  {isImage && <span title="ข้อความจากรูปภาพ (OCR)" style={{ marginRight: '6px' }}>🖼️</span>}
                  {truncateText(displayText, compact ? 40 : 60)}
                </td>
                <td title={log.senderId || undefined}>{log.senderName}{log.senderId && <small className="sender-id">{log.senderId.slice(-8)}</small>}</td>
                <td>
                  <span className={`badge badge--risk-${log.riskLevel}`}>
                    {getRiskLabel(log.riskLevel)}
                  </span>
                </td>
                <td className="cell-time">{formatDate(log.timestamp)}</td>
                <td>
                  <span className={statusConfig[log.status]?.className || 'badge'}>
                    {statusConfig[log.status]?.label || log.status}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className="table-detail-btn"
                    onClick={() => setSelectedLog(log)}
                  >
                    <Eye size={13} /> ดูรายละเอียด
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* หน้าต่างป๊อปอัพแสดงรายละเอียดเต็ม */}
      <ThreatDetailModal
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
}
