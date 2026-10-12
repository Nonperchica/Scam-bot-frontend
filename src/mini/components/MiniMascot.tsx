import waveImage from '../assets/wave.png';
import thinkImage from '../assets/think.png';
import alertImage from '../assets/alert.png';
import calmImage from '../assets/calm.png';
import inspectImage from '../assets/inspect.png';
import bookImage from '../assets/book.png';
import guideImage from '../assets/guide.png';
import heartImage from '../assets/heart.png';

export type MascotPose = 'wave' | 'think' | 'alert' | 'calm' | 'inspect' | 'book' | 'guide' | 'heart';
const mascotImages = {
  wave: { source: waveImage, description: 'โบกมือทักทาย' },
  think: { source: thinkImage, description: 'ครุ่นคิดแตะคาง' },
  alert: { source: alertImage, description: 'ยกมือเตือนให้หยุดก่อน' },
  calm: { source: calmImage, description: 'ยิ้มสบายใจ' },
  inspect: { source: inspectImage, description: 'ถือแว่นขยายตรวจสอบ' },
  book: { source: bookImage, description: 'อ่านหนังสือ' },
  guide: { source: guideImage, description: 'ชี้แนะนำ' },
  heart: { source: heartImage, description: 'กอดหัวใจ' },
};

export default function MiniMascot({ pose, className = '' }: { pose: MascotPose; className?: string }) {
  const mascot = mascotImages[pose];
  return <img className={`mini-mascot ${className}`} src={mascot.source} alt={`Eh?Bot ${mascot.description}`} width={224} height={224} />;
}
