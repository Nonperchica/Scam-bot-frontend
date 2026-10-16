import type { DashboardSource } from '../types';

const options: { value: DashboardSource; label: string }[] = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'private', label: 'แชทส่วนตัว' },
  { value: 'group', label: 'กลุ่ม LINE' },
];

export default function SourceSelector({ value, onChange }: { value: DashboardSource; onChange: (source: DashboardSource) => void }) {
  return <div className="period-selector" role="group" aria-label="เลือกแหล่งข้อความ">
    {options.map(option => <button key={option.value} type="button" aria-pressed={value === option.value}
      className={value === option.value ? 'period-option is-active' : 'period-option'}
      onClick={() => onChange(option.value)}>{option.label}</button>)}
  </div>;
}
