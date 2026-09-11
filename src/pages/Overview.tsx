// =============================================
// Senior Guard — Overview Page (Dashboard)
// =============================================

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ScanSearch, ShieldAlert, Activity, Users } from 'lucide-react';
import StatCard from '../components/StatCard';
import { fetchDashboardStats, fetchTrendData } from '../services/api';
import { formatNumber } from '../utils/formatters';
import type { DashboardStats, TrendDataPoint } from '../types';

export default function Overview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [s, t] = await Promise.all([
          fetchDashboardStats(),
          fetchTrendData(),
        ]);
        setStats(s);
        setTrendData(t);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  // Generate "last week" comparison data for grouped bar chart
  const chartData = trendData.map((d) => ({
    date: d.date,
    current: d.threats,
    lastWeek: Math.max(0, d.threats + Math.floor((Math.random() - 0.5) * 10)),
    scannedCurrent: d.scanned,
    scannedLastWeek: Math.max(0, d.scanned + Math.floor((Math.random() - 0.5) * 300)),
  }));

  const tooltipStyle = {
    backgroundColor: '#ffffff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    color: '#2c3e2d',
    fontSize: '12px',
  };

  return (
    <div className="overview-page">
      {/* Stat Cards */}
      <div className="stat-cards-grid">
        <StatCard
          title="ข้อความที่สแกนทั้งหมด"
          value={formatNumber(stats?.totalScanned ?? 0)}
          icon={<ScanSearch size={24} />}
          trend={{ value: 12.5, isPositive: true }}
          accentColor="var(--color-accent)"
        />
        <StatCard
          title="ภัยคุกคามที่ตรวจพบ"
          value={formatNumber(stats?.threatsDetected ?? 0)}
          icon={<ShieldAlert size={24} />}
          trend={{ value: 8.3, isPositive: false }}
          accentColor="var(--color-risk-high)"
        />
        <StatCard
          title="อัตราความเสี่ยง"
          value={`${stats?.riskRate?.toFixed(2) ?? '0'}%`}
          icon={<Activity size={24} />}
          trend={{ value: 2.1, isPositive: false }}
          accentColor="var(--color-risk-medium)"
        />
        <StatCard
          title="ผู้ใช้งานที่เฝ้าระวัง"
          value={formatNumber(stats?.activeUsers ?? 0)}
          icon={<Users size={24} />}
          trend={{ value: 5.7, isPositive: true }}
          accentColor="var(--color-success)"
        />
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* Threat Detection Trend */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div className="chart-card-header-left">
              <h2 className="chart-title">แนวโน้มการตรวจจับภัยคุกคาม</h2>
              <span className="chart-trend-badge">▲ 2.1% vs last week</span>
            </div>
            <button className="chart-view-report">View Report</button>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barGap={2} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                <XAxis dataKey="date" stroke="#8a9a8c" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#8a9a8c" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="current" fill="#4a6fa5" radius={[3, 3, 0, 0]} name="Last 6 days" />
                <Bar dataKey="lastWeek" fill="#a0b4cc" radius={[3, 3, 0, 0]} name="Last Week" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-legend">
            <div className="chart-legend-item">
              <span className="chart-legend-dot chart-legend-dot--primary" />
              <span>Last 6 days</span>
            </div>
            <div className="chart-legend-item">
              <span className="chart-legend-dot chart-legend-dot--secondary" />
              <span>Last Week</span>
            </div>
          </div>
        </div>

        {/* Scanned Messages */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div className="chart-card-header-left">
              <h2 className="chart-title">จำนวนข้อความที่สแกน</h2>
              <span className="chart-trend-badge">▲ 2.1% vs last week</span>
            </div>
            <button className="chart-view-report">View Report</button>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barGap={2} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                <XAxis dataKey="date" stroke="#8a9a8c" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#8a9a8c" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="scannedCurrent" fill="#4a6fa5" radius={[3, 3, 0, 0]} name="Last 6 days" />
                <Bar dataKey="scannedLastWeek" fill="#a0b4cc" radius={[3, 3, 0, 0]} name="Last Week" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-legend">
            <div className="chart-legend-item">
              <span className="chart-legend-dot chart-legend-dot--primary" />
              <span>Last 6 days</span>
            </div>
            <div className="chart-legend-item">
              <span className="chart-legend-dot chart-legend-dot--secondary" />
              <span>Last Week</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
