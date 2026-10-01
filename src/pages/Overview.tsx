// =============================================
// Senior Guard — Overview Page (Dashboard)
// =============================================

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { fetchDashboardStats, fetchTrendData } from '../services/api';
import { formatNumber } from '../utils/formatters';
import type { DashboardStats, TrendDataPoint } from '../types';

// Donut chart data
const scamTypeData = [
  { name: 'หลอกลงทุนและหาก์ทำงาน\n(Investment & Job Scam)', fullName: 'หลอกลงทุนและหาก์ทำงาน (Investment & Job Scam)', desc: 'ลงทุนกำไรออลเซลลิ, เกรงอริโปปลอม', value: 65 },
  { name: 'ฟิชชิงและแอบอ้าง\n(Phishing & Impersonation)', fullName: 'ฟิชชิงและแอบอ้าง (Phishing & Impersonation)', desc: 'ปัอเป็นเจ้าหน้าที่รัฐ, สืดทกรรม', value: 35 },
];
const SCAM_TYPE_COLORS = ['#2d6a3f', '#4a9960'];

const riskLevelData = [
  { name: 'เสี่ยงสูง (High Risk)', value: 40 },
  { name: 'เสี่ยงปานกลาง (Medium)', value: 25 },
  { name: 'ความเสี่ยงต่ำ (Low)', value: 25 },
];
const RISK_COLORS = ['#e6a817', '#d64545', '#3a8a4f'];

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

  const tooltipStyle = {
    backgroundColor: '#ffffff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    color: '#2c3e2d',
    fontSize: '12px',
  };

  return (
    <div className="overview-page">
      {/* Top Stat Cards — 3 columns */}
      <div className="overview-stat-cards">
        {/* อัตราความเสี่ยง */}
        <div className="overview-stat-card">
          <span className="overview-stat-label">อัตราความเสี่ยง</span>
          <span className="overview-stat-value">{stats?.riskRate?.toFixed(2) ?? '0'}%</span>
          <div className="overview-stat-trend overview-stat-trend--down">
            <TrendingDown size={14} />
            <span>2.1% จากสัปดาห์ก่อน</span>
          </div>
        </div>
        {/* ภัยคุกคามที่ตรวจพบ */}
        <div className="overview-stat-card">
          <span className="overview-stat-label">ภัยคุกคามที่ตรวจพบ</span>
          <span className="overview-stat-value">{formatNumber(stats?.threatsDetected ?? 0)}</span>
          <div className="overview-stat-trend overview-stat-trend--down">
            <TrendingDown size={14} />
            <span>8.3% จากสัปดาห์ก่อน</span>
          </div>
        </div>
        {/* ข้อความที่สแกนทั้งหมด */}
        <div className="overview-stat-card">
          <span className="overview-stat-label">ข้อความที่สแกนทั้งหมด</span>
          <span className="overview-stat-value">{formatNumber(stats?.totalScanned ?? 0)}</span>
          <div className="overview-stat-trend overview-stat-trend--up">
            <TrendingUp size={14} />
            <span>12.5% จากสัปดาห์ก่อน</span>
          </div>
        </div>
      </div>

      {/* Donut Charts Row */}
      <div className="donut-charts-row">
        {/* Scam Type Donut */}
        <div className="donut-chart-card">
          <div className="donut-chart-header">
            <div>
              <h2 className="donut-chart-title">ประเภทของข้อความ Scam</h2>
              <p className="donut-chart-subtitle">จำแนกตามพฤติกรรมการหลอกลวง (รวม 342 เคส)</p>
            </div>
            <span className="donut-chart-period">สัปดาห์นี้</span>
          </div>
          <div className="donut-chart-body">
            <div className="donut-chart-wrapper">
              <PieChart width={200} height={200}>
                <Pie
                  data={scamTypeData}
                  cx={100}
                  cy={100}
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                  stroke="none"
                  startAngle={90}
                  endAngle={-270}
                >
                  {scamTypeData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={SCAM_TYPE_COLORS[index]} />
                  ))}
                </Pie>
              </PieChart>
              <div className="donut-center-label">
                <span className="donut-center-value">342</span>
                <span className="donut-center-text">เคสตรวจพบ</span>
              </div>
            </div>
            <div className="donut-legend">
              {scamTypeData.map((item, idx) => (
                <div key={idx} className="donut-legend-item">
                  <span className="donut-legend-dot" style={{ background: SCAM_TYPE_COLORS[idx] }} />
                  <div className="donut-legend-text">
                    <span className="donut-legend-name">{item.fullName}</span>
                    <span className="donut-legend-value">{item.value}%</span>
                    <span className="donut-legend-desc">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Risk Level Donut */}
        <div className="donut-chart-card">
          <div className="donut-chart-header">
            <div>
              <h2 className="donut-chart-title">ระดับความเสี่ยงของข้อความ</h2>
              <p className="donut-chart-subtitle">การประเมินจากทุกข้อความ</p>
            </div>
          </div>
          <div className="donut-chart-body">
            <div className="donut-chart-wrapper">
              <PieChart width={200} height={200}>
                <Pie
                  data={riskLevelData}
                  cx={100}
                  cy={100}
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                  stroke="none"
                  startAngle={90}
                  endAngle={-270}
                >
                  {riskLevelData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={RISK_COLORS[index]} />
                  ))}
                </Pie>
              </PieChart>
              <div className="donut-center-label">
                <span className="donut-center-subtext">ระดับสูง</span>
                <span className="donut-center-value risk-value">40%</span>
                <span className="donut-center-text">ข้อควรระวังมาก</span>
              </div>
            </div>
            <div className="donut-legend">
              {riskLevelData.map((item, idx) => (
                <div key={idx} className="donut-legend-item">
                  <span className="donut-legend-dot" style={{ background: RISK_COLORS[idx] }} />
                  <div className="donut-legend-text">
                    <span className="donut-legend-name">{item.name}</span>
                    <span className="donut-legend-value">{item.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Line Chart */}
      <div className="chart-card overview-line-chart">
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
                stroke="#2d6a3f"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#2d6a3f' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
