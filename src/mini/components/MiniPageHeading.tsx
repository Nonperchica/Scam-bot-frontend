import MiniMascot from './MiniMascot';
import type { MascotPose } from './MiniMascot';

// หัวหน้า: ชื่อหน้า (h1) คู่กับมาสคอต ใช้ร่วมหลายหน้า
export default function MiniPageHeading({ title, pose }: { title: string; pose: MascotPose }) {
  return <div className="mini-page-heading"><h1>{title}</h1><MiniMascot pose={pose} /></div>;
}
