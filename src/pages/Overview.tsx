import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Activity, ArrowRight, ArrowUpRight, CalendarDays, CheckCheck, CircleHelp, Database, MessageSquareText, MessagesSquare, RefreshCw, ShieldAlert, ShieldCheck, Sparkles } from 'lucide-react';
import { fetchDashboardStats } from '../services/api';
import DataError from '../components/DataError';
import { formatNumber } from '../utils/formatters';
import type { DashboardStats } from '../types';

const riskLevels = [
  { key: 'high', name: 'เสี่ยงสูง', color: '#ef367f' },
  { key: 'medium', name: 'เสี่ยงปานกลาง', color: '#edb950' },
  { key: 'low', name: 'เสี่ยงต่ำ', color: '#35c8a1' },
  { key: 'unknown', name: 'ไม่ระบุ', color: '#b9adbf' },
];
const tooltipStyle = { border: '1px solid #ece7ee', borderRadius: 12, fontSize: 12, boxShadow: '0 8px 28px #29133112' };

export default function Overview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const [series, setSeries] = useState({ total: true, risk: true });

  useEffect(() => {
    let active = true;
    fetchDashboardStats().then(data => {
      if (active) { setStats(data); setError(''); }
    }).catch((cause: unknown) => {
      if (active) setError(cause instanceof Error ? cause.message : 'กรุณาตรวจสอบการเชื่อมต่อแล้วลองอีกครั้ง');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [revision]);

  function refresh() { setLoading(true); setError(''); setRevision(value => value + 1); }
  const risks = riskLevels.map(risk => ({ ...risk, value: stats?.riskLevels[risk.key] || 0 }));
  const assessed = risks.reduce((sum, risk) => sum + risk.value, 0);
  const number = (value: number | undefined) => value === undefined ? '—' : formatNumber(value);
  const metrics = [
    { label: 'ข้อความที่บันทึก', value: number(stats?.totalScanned), unit: 'ข้อความ', detail: 'จากแชทส่วนตัวและกลุ่ม', icon: MessageSquareText, tone: 'plum' },
    { label: 'ข้อความที่พบความเสี่ยง', value: number(stats?.threatsDetected), unit: 'ข้อความ', detail: 'ตรวจพบสัญญาณที่ควรระวัง', icon: ShieldAlert, tone: 'pink' },
    { label: 'สัดส่วนความเสี่ยง', value: stats ? stats.riskRate.toFixed(2) : '—', unit: '%', detail: 'เทียบกับข้อความทั้งหมด', icon: Activity, tone: 'amber' },
    { label: 'ไม่พบสัญญาณเสี่ยง', value: number(stats ? stats.statuses.no_risk_found || 0 : undefined), unit: 'ข้อความ', detail: 'จากผลการตรวจของระบบ', icon: ShieldCheck, tone: 'mint' },
  ];
  const outcomes = [
    { key: 'no_risk_found', label: 'ไม่พบสัญญาณเสี่ยง', icon: ShieldCheck, tone: 'mint' },
    { key: 'uncertain', label: 'ข้อมูลไม่พอสรุป', icon: CircleHelp, tone: 'amber' },
    { key: 'conversation', label: 'บทสนทนาทั่วไป', icon: MessagesSquare, tone: 'plum' },
    { key: 'error', label: 'ตรวจไม่สำเร็จ', icon: ShieldAlert, tone: 'pink' },
  ];

  return (
    <div className="eh-overview" aria-busy={loading}>
      <section className="welcome-banner" aria-label="Eh?Bot ผู้ช่วยสังเกตความเสี่ยง">
        <div className="welcome-copy"><span className="welcome-kicker"><Sparkles size={14} /> A LITTLE DOUBT. A LOT SAFER.</span>
          <h2>เอ๊ะก่อนคลิก <span>เช็กก่อนเชื่อ.</span></h2>
          <p>ผู้ช่วยสังเกตข้อความน่าสงสัย ให้คุณดูแลทุกบทสนทนาได้อย่างมั่นใจ</p>
          <Link to="/threat-logs" className="button button-dark">ตรวจดูความเสี่ยง <ArrowUpRight size={16} /></Link>
        </div>
        <div className="welcome-art" aria-hidden="true"><span className="art-orbit" /><span className="art-spark art-spark-one">✦</span><span className="mascot-bubble">เอ๊ะ? ให้ผมช่วยดู</span><img src="/ehbot-logo.png" alt="" /><span className="art-spark art-spark-two">✦</span></div>
      </section>

      <div className="overview-section-bar">
        <div><h2>ภาพรวมการตรวจสอบ <span className="period-label">7 วันล่าสุด</span></h2><p aria-live="polite">{loading ? 'กำลังอัปเดตข้อมูล…' : error ? 'ไม่สามารถอัปเดตข้อมูลได้' : stats ? `อัปเดต ${new Date(stats.updatedAt).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} น. · เวลาไทย` : 'รอข้อมูลจากระบบ'}</p></div>
        <button className="button button-secondary" onClick={refresh} disabled={loading}><RefreshCw size={15} className={loading ? 'is-spinning' : ''} /><span>รีเฟรชข้อมูล</span></button>
      </div>
      {error && <DataError message={error} onRetry={refresh} />}
      {stats && error && <p className="stale-data-note">แสดงข้อมูลจากการโหลดสำเร็จครั้งล่าสุด</p>}

      <div className="eh-metrics">
        {metrics.map(metric => <article className={`metric-card metric-card--${metric.tone}`} key={metric.label}>
          <div className="metric-top"><span>{metric.label}</span><span className={`metric-icon tone-${metric.tone}`}><metric.icon size={19} strokeWidth={1.8} /></span></div>
          <div className="metric-number">{metric.value}<span>{metric.unit}</span></div>
          <div className="metric-detail"><span className={`detail-dot tone-${metric.tone}`} />{metric.detail}</div>
        </article>)}
      </div>

      <div className="analytics-grid">
        <section className="eh-panel activity-panel">
          <div className="panel-heading"><div><h2>แนวโน้มข้อความ</h2><p>ภาพรวมข้อความทั้งหมดและข้อความที่พบความเสี่ยง</p></div><span className="panel-icon"><Activity size={18} /></span></div>
          <div className="chart-controls"><div className="chart-legend">
            <button aria-pressed={series.total} onClick={() => setSeries(current => ({ ...current, total: !current.total }))}><span style={{ background: series.total ? '#39bd9d' : '#d9d2dc' }} />ข้อความทั้งหมด</button>
            <button aria-pressed={series.risk} onClick={() => setSeries(current => ({ ...current, risk: !current.risk }))}><span style={{ background: series.risk ? '#ef367f' : '#d9d2dc' }} />พบความเสี่ยง</button>
          </div><span className="chart-unit">หน่วย: ข้อความ</span></div>
          <div className="activity-chart" role="img" aria-label={stats ? `แนวโน้ม 7 วัน: ${stats.totalScanned} ข้อความ พบความเสี่ยง ${stats.threatsDetected} ข้อความ` : 'กราฟแนวโน้ม รอข้อมูล'}>
            {stats && stats.totalScanned > 0 ? <ResponsiveContainer width="100%" height="100%"><AreaChart data={stats.trends} margin={{ top: 14, right: 10, left: -22, bottom: 0 }}>
              <defs><linearGradient id="eh-mint-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#35c8a1" stopOpacity={0.22} /><stop offset="100%" stopColor="#35c8a1" stopOpacity={0.01} /></linearGradient><linearGradient id="eh-pink-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ef367f" stopOpacity={0.13} /><stop offset="100%" stopColor="#ef367f" stopOpacity={0.01} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 5" stroke="#eee9ef" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#7f7584', fontSize: 11 }} tickLine={false} axisLine={false} tickMargin={12} />
              <YAxis allowDecimals={false} tick={{ fill: '#7f7584', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              {series.total && <Area type="monotone" dataKey="totalMessages" name="ข้อความทั้งหมด" stroke="#29ad8f" strokeWidth={2.5} fill="url(#eh-mint-fill)" isAnimationActive={false} />}
              {series.risk && <Area type="monotone" dataKey="suspiciousMessages" name="พบความเสี่ยง" stroke="#ef367f" strokeWidth={2.5} fill="url(#eh-pink-fill)" isAnimationActive={false} />}
            </AreaChart></ResponsiveContainer> : <div className="chart-empty"><span><Activity size={28} /></span><strong>{loading ? 'กำลังโหลดแนวโน้มข้อความ' : stats ? 'ยังไม่มีข้อความในช่วง 7 วันนี้' : 'กราฟจะแสดงเมื่อเชื่อมต่อข้อมูล'}</strong><p>รวมแชทส่วนตัวและกลุ่ม LINE</p></div>}
          </div>
          <div className="chart-footnote"><CalendarDays size={13} />ข้อมูลรายวันในเขตเวลาไทย</div>
        </section>

        <section className="eh-panel risk-panel">
          <div className="panel-heading"><div><h2>ระดับความเสี่ยง</h2><p>เฉพาะผลตรวจที่สรุปได้</p></div><ShieldAlert size={18} className="muted-icon" /></div>
          <div className="risk-donut" role="img" aria-label={stats ? `ผลตรวจที่สรุปได้ ${assessed} ข้อความ` : 'ระดับความเสี่ยง รอข้อมูล'}>
            <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={assessed ? risks : [{ value: 1, color: '#f0ecf2' }]} innerRadius={65} outerRadius={84} dataKey="value" startAngle={90} endAngle={-270} paddingAngle={assessed ? 4 : 0} stroke="none" cornerRadius={5} isAnimationActive={false}>
              {(assessed ? risks : [{ key: 'empty', color: '#f0ecf2' }]).map(risk => <Cell key={risk.key} fill={risk.color} />)}
            </Pie>{assessed > 0 && <Tooltip contentStyle={tooltipStyle} />}</PieChart></ResponsiveContainer>
            <div className="risk-donut-center"><small>ผลตรวจทั้งหมด</small><strong>{stats ? formatNumber(assessed) : '—'}</strong><span>ข้อความ</span></div>
          </div>
          <div className="risk-legend">{risks.map(risk => <div key={risk.key}><span className="risk-legend-name"><i style={{ background: risk.color }} />{risk.name}</span><strong>{stats ? formatNumber(risk.value) : '—'}</strong><span className="risk-percent">{assessed ? `${(risk.value / assessed * 100).toFixed(0)}%` : '—'}</span></div>)}</div>
          <p className="panel-note">ไม่รวมบทสนทนาทั่วไป ผลที่ยังไม่แน่ชัด และการตรวจที่ล้มเหลว</p>
        </section>
      </div>

      <div className="overview-bottom-grid">
        <section className="eh-panel outcomes-panel"><div className="panel-heading"><div><h2>ผลการตรวจข้อความ</h2><p>แยกตามสถานะการวิเคราะห์ของระบบ</p></div><CheckCheck size={19} className="muted-icon" /></div>
          <div className="outcome-list">{outcomes.map(outcome => <div className="outcome-row" key={outcome.key}><span className={`outcome-icon tone-${outcome.tone}`}><outcome.icon size={16} /></span><span>{outcome.label}</span><strong>{number(stats ? stats.statuses[outcome.key] || 0 : undefined)}</strong><small>ข้อความ</small></div>)}</div>
          <div className="outcomes-footer"><span>ใช้กฎสำรองในการตรวจ</span><strong>{number(stats ? stats.statuses.fallback || 0 : undefined)} <span>ข้อความ</span></strong></div>
        </section>
        <section className="quick-access"><span className="eyebrow">YOUR NEXT STEP</span><h2>ดูแลต่อได้จากตรงนี้</h2><p>เครื่องมือที่ช่วยให้คุณเห็นภาพชัดขึ้น</p>
          <Link to="/threat-logs" className="quick-link"><span className="quick-icon tone-pink"><ShieldAlert size={20} /></span><span><strong>ตรวจสอบข้อความเสี่ยง</strong><small>ค้นหาและกรองตามระดับความเสี่ยง</small></span><ArrowUpRight size={18} /></Link>
          <Link to="/line-groups" className="quick-link"><span className="quick-icon tone-mint"><MessagesSquare size={20} /></span><span><strong>จัดการกลุ่ม LINE</strong><small>ดูสถานะและสถิติของแต่ละกลุ่ม</small></span><ArrowUpRight size={18} /></Link>
          <Link to="/dataset" className="dataset-shortcut"><Database size={16} />ไปที่ชุดข้อมูลสำหรับพัฒนาระบบ<ArrowRight size={15} /></Link>
        </section>
      </div>
    </div>
  );
}
