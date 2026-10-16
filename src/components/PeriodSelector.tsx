import type { DashboardPeriod } from '../types';

const options: { value: DashboardPeriod; label: string }[] = [
  { value: 'day', label: 'รายวัน' },
  { value: 'week', label: 'รายสัปดาห์' },
  { value: 'month', label: 'รายเดือน' },
];

export default function PeriodSelector({ value, onChange, target, onTargetChange }: { value: DashboardPeriod; onChange: (period: DashboardPeriod) => void; target?: string; onTargetChange?: (target: string) => void }) {
  return <div className="period-controls"><div className="period-selector" role="group" aria-label="เลือกช่วงข้อมูล">
    {options.map(option => <button key={option.value} type="button" aria-pressed={value === option.value}
      className={value === option.value ? 'period-option is-active' : 'period-option'}
      onClick={() => onChange(option.value)}>{option.label}</button>)}
  </div>{target && onTargetChange && value !== 'week' && <label className="period-target-label">
    <span>{value === 'day' ? 'เลือกวันที่' : 'เลือกเดือนและปี'}</span>
    <input type={value === 'day' ? 'date' : 'month'} aria-label={value === 'day' ? 'เลือกวันที่' : 'เลือกเดือนและปี'}
      value={value === 'day' ? target : target.slice(0, 7)}
      onChange={event => { if (event.target.value) onTargetChange(value === 'day' ? event.target.value : `${event.target.value}-01`); }} />
  </label>}</div>;
}
