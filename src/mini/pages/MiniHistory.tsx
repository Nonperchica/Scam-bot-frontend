import { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { ChevronRight, Gift, Link2, MessageCircle, Search } from 'lucide-react';
import { formatCaseTime, sampleCases, statusLabels } from '../sampleCases';
import type { DetectionStatus, MiniLayoutContext } from '../sampleCases';
import MiniMascot from '../components/MiniMascot';
import MiniChatButton from '../components/MiniChatButton';
import MiniSessionNotice from '../components/MiniSessionNotice';
import type { MiniHistoryItem } from '../services/miniApi';

const categoryIcons = { link: Link2, message: MessageCircle, gift: Gift };

export default function MiniHistory() {
  const session = useOutletContext<MiniLayoutContext>();
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<DetectionStatus | 'all'>('all');
  // โหมดจริงใช้ประวัติจาก Bot API (มีแค่หัวข้อ ไม่มีข้อความเต็ม); โหมดตัวอย่างใช้ข้อมูลสมมติ
  const cases: MiniHistoryItem[] = session.live ? session.history : sampleCases;
  const showFilters = cases.length > 1;
  const visibleCases = cases.filter((detectionCase) => {
    const matchesStatus = selectedStatus === 'all' || detectionCase.status === selectedStatus;
    const fullMessage = 'message' in detectionCase ? String(detectionCase.message) : '';
    const searchableText = `${detectionCase.title} ${fullMessage}`.toLocaleLowerCase('th-TH');
    const matchesSearch = searchableText.includes(searchText.trim().toLocaleLowerCase('th-TH'));
    return matchesStatus && matchesSearch;
  });

  function clearFilters() {
    setSearchText('');
    setSelectedStatus('all');
  }

  return (
    <>
      <section className="mini-brand-banner"><div><div className="mini-wordmark"><span>Eh?</span>Bot</div><p>เพื่อนรู้ทันมิจฉาชีพ บน LINE</p></div><MiniMascot pose="wave" /></section>
      <div className="mini-page-body">
        <div className="mini-intro"><h1>ประวัติการตรวจ</h1><p className="mini-secondary">ผลตรวจจากแชตส่วนตัวกับ Eh?Bot</p></div>
        <section className="mini-invite"><div className="mini-invite-top"><MiniMascot pose="think" /><div><h2>เอ๊ะก่อนคลิก<br />เช็กก่อนเชื่อ</h2><p>มีข้อความที่สงสัย ส่งให้เราช่วยดู</p></div></div><MiniChatButton /></section>
        {session.live && <MiniSessionNotice />}
        {session.live && session.historyError && <section className="mini-card">
          <p className="mini-session-error" role="alert">{session.historyError}</p>
          <button type="button" className="mini-secondary-button" onClick={session.reloadHistory}>ลองอีกครั้ง</button>
        </section>}
        <div className="mini-section-heading"><h2>รายการล่าสุด</h2><span role="status">{visibleCases.length} รายการ</span></div>
        {/* มีเคสไม่เกินหนึ่งรายการ ค้นหาหรือกรองไปก็ไม่ได้อะไร จึงซ่อนไว้ให้หน้าสั้นลง */}
        {showFilters && <>
        <details className="mini-search-disclosure"><summary><Search aria-hidden="true" />ค้นหาประวัติ</summary><label className="mini-search"><Search aria-hidden="true" /><input type="search" value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="ค้นหาข้อความที่เคยตรวจ" aria-label="ค้นหาประวัติ" /></label></details>
        <div className="mini-filters" aria-label="กรองสถานะผลตรวจ">
          <button type="button" aria-pressed={selectedStatus === 'all'} onClick={() => setSelectedStatus('all')}>ทั้งหมด</button>
          {(['risk_found', 'uncertain', 'no_risk_found'] as const).map((status) => <button type="button" key={status} aria-pressed={selectedStatus === status} onClick={() => setSelectedStatus(status)}>{statusLabels[status]}</button>)}
        </div>
        </>}
        <div className="mini-case-list">
          {visibleCases.map((detectionCase) => {
            const CategoryIcon = categoryIcons[detectionCase.category];
            return (
              <Link key={detectionCase.id} className="mini-case-row" to={session.live ? session.miniHref('detail', detectionCase.id) : `/mini/cases/${detectionCase.id}`}>
                <span className={`mini-status-icon ${detectionCase.status}`}><CategoryIcon aria-hidden="true" /></span>
                <span className="mini-case-copy">
                  <span className="mini-case-message">{detectionCase.title}</span>
                  <span className="mini-case-meta">
                    <time dateTime={detectionCase.receivedAt}>{formatCaseTime(detectionCase.receivedAt)}</time>
                    <span className={`mini-status-label ${detectionCase.status}`}>{statusLabels[detectionCase.status]}</span>
                  </span>
                </span>
                <ChevronRight aria-hidden="true" className="mini-chevron" />
              </Link>
            );
          })}
        </div>
        {visibleCases.length === 0 && !session.loading && !session.error && !session.needsLogin
          && !session.historyLoading && !session.historyError && <section className="mini-card mini-empty">
          <MiniMascot pose="inspect" />
          <h2>{cases.length === 0 ? 'ยังไม่มีประวัติการตรวจ' : 'ไม่พบรายการที่ตรงกัน'}</h2>
          <p>{cases.length === 0 ? 'ส่งข้อความที่สงสัยในแชตเพื่อเริ่มตรวจ' : 'ลองเปลี่ยนคำค้นหาหรือตัวกรอง'}</p>
          {cases.length > 0 && <button type="button" className="mini-secondary-button" onClick={clearFilters}>ดูรายการทั้งหมด</button>}
        </section>}
      </div>
    </>
  );
}
