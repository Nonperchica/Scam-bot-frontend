import MiniMascot from './MiniMascot';
import type { MascotPose } from './MiniMascot';

export default function MiniPageHeading({ title, pose }: { title: string; pose: MascotPose }) {
  return <div className="mini-page-heading"><h1>{title}</h1><MiniMascot pose={pose} /></div>;
}
