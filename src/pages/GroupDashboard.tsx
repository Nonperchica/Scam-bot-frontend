// =============================================
// Senior Guard — Group Dashboard Page
// =============================================

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { ArrowLeft, Users, ShieldAlert, ScanSearch, MessageSquare } from 'lucide-react';
import StatCard from '../components/StatCard';
import { fetchGroupById, fetchGroupTrendData, fetchGroupThreatLogs } from '../services/api';
import { formatNumber } from '../utils/formatters';
import type { LineGroup, TrendDataPoint, ThreatLog } from '../types';

export default function GroupDashboard() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<LineGroup | null>(null);
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [threatLogs, setThreatLogs] = useState<ThreatLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!groupId) return;
      try {
        const g = await fetchGroupById(groupId);
        if (!g) {
          navigate('/line-groups');
          return;
        }
        setGroup(g);
        const [trend, threats] = await Promise.all([
          fetchGroupTrendData(groupId),
          fetchGroupThreatLogs(g.name),
        ]);
        setTrendData(trend);
        setThreatLogs(threats);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [groupId, navigate]);

  if (loading || !group) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  const riskRate = group.messagesScanned > 0
    ? ((group.threatsDetected / group.messagesScanned) * 100).toFixed(2)
    : '0';

  const tooltipStyle = {
    backgroundColor: '#ffffff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    color: '#2c3e2d',
    fontSize: '12px',
  };

  const riskLevelLabel: Record<string, string> = {
    high: 'สูง',
    medium: 'กลาง',
    low: 'ต่ำ',
  };

  const statusLabel: Record<string, string> = {
    blocked: 'บล็อกแล้ว',
    flagged: 'แจ้งเตือน',
    reviewed: 'ตรวจสอบแล้ว',
    pending: 'รอดำเนินการ',
  };

  return (
    <div className="overview-page">
      {/* Back button + Group header */}
      <div className="group-dashboard-header">
        <button
          className="group-back-btn"
          onClick={() => navigate('/line-groups')}
        >
          <ArrowLeft size={18} />
          <span>กลับ</span>
        </button>
        <div className="group-dashboard-title-section">
          <div className="group-dashboard-avatar">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .346-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.271.18-.51.432-.596.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.349 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
            </svg>
          </div>
          <div>
            <h1 className="page-title" style={{ marginBottom: '4px' }}>{group.name}</h1>
            <span className={`line-group-status line-group-status--${group.status}`}>
              <span className="line-group-status-dot" />
              {group.status === 'active' ? 'ออนไลน์' : 'ออฟไลน์'}
            </span>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stat-cards-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <StatCard
          title="สมาชิกในกลุ่ม"
          value={formatNumber(group.memberCount)}
          icon={<Users size={24} />}
          accentColor="var(--color-accent)"
        />
        <StatCard
          title="ข้อความที่สแกน"
          value={formatNumber(group.messagesScanned)}
          icon={<MessageSquare size={24} />}
          accentColor="var(--color-info)"
        />
        <StatCard
          title="ภัยคุกคามที่ตรวจพบ"
          value={formatNumber(group.threatsDetected)}
          icon={<ShieldAlert size={24} />}
          accentColor="var(--color-risk-high)"
        />
        <StatCard
          title="อัตราความเสี่ยง"
          value={`${riskRate}%`}
          icon={<ScanSearch size={24} />}
          accentColor="var(--color-risk-medium)"
        />
      </div>

      {/* Line Chart */}
      <div className="charts-grid">
        <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
          <div className="chart-card-header">
            <div className="chart-card-header-left">
              <h2 className="chart-title">จำนวนข้อความทั้งหมด & ข้อความที่น่าสงสัย</h2>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                <XAxis dataKey="date" stroke="#8a9a8c" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#8a9a8c" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="totalMessages"
                  name="ข้อความทั้งหมด"
                  stroke="#4a6fa5"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#4a6fa5' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="suspiciousMessages"
                  name="ข้อความที่น่าสงสัย"
                  stroke="#e74c3c"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#e74c3c' }}
                  activeDot={{ r: 6 }}
                  strokeDasharray="6 3"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Threat Logs Table */}
      {threatLogs.length > 0 && (
        <div className="chart-card" style={{ marginTop: 'var(--space-lg)' }}>
          <div className="chart-card-header">
            <div className="chart-card-header-left">
              <h2 className="chart-title">ประวัติข้อความที่น่าสงสัยในกลุ่ม</h2>
            </div>
          </div>
          <div className="group-threat-table-wrapper">
            <table className="threat-table">
              <thead>
                <tr>
                  <th>ข้อความ</th>
                  <th>ผู้ส่ง</th>
                  <th>ระดับความเสี่ยง</th>
                  <th>ความมั่นใจ</th>
                  <th>สถานะ</th>
                  <th>วันที่</th>
                </tr>
              </thead>
              <tbody>
                {threatLogs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <span className="threat-message-preview">
                        {log.message.length > 60 ? log.message.slice(0, 60) + '...' : log.message}
                      </span>
                    </td>
                    <td>{log.senderName}</td>
                    <td>
                      <span className={`risk-badge risk-badge--${log.riskLevel}`}>
                        {riskLevelLabel[log.riskLevel]}
                      </span>
                    </td>
                    <td>{log.confidence}%</td>
                    <td>
                      <span className={`status-badge status-badge--${log.status}`}>
                        {statusLabel[log.status]}
                      </span>
                    </td>
                    <td>
                      {new Date(log.timestamp).toLocaleDateString('th-TH', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {threatLogs.length === 0 && (
        <div className="chart-card" style={{ marginTop: 'var(--space-lg)', textAlign: 'center', padding: 'var(--space-xl)' }}>
          <p style={{ color: 'var(--color-text-tertiary)' }}>ยังไม่มีข้อความที่น่าสงสัยในกลุ่มนี้</p>
        </div>
      )}
    </div>
  );
}
