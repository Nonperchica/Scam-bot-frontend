import { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { ChevronRight, Info, Search } from 'lucide-react';
import { dayLabel, readSource, sampleCases, statusLabels, statusSymbols } from '../sampleCases';
import type { DetectionStatus, MiniLayoutContext } from '../sampleCases';
import MiniMascot from '../components/MiniMascot';
import MiniPageHeading from '../components/MiniPageHeading';
import MiniSessionNotice from '../components/MiniSessionNotice';
import type { MiniHistoryItem } from '../services/miniApi';

const bangkokTime = (iso: string) => new Intl.DateTimeFormat('th-TH', { timeZone: 'Asia/Bangkok', timeStyle: 'short' }).format(new Date(iso));

function typeLabel(item: MiniHistoryItem, image: boolean): string {
  if (image) return 'รูปภาพ';
  return item.category === 'link' ? 'ลิงก์' : 'ข้อความ';
}

export default function MiniHistory() {
  const session = useOutletContext<MiniLayoutContext>();
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<DetectionStatus | 'all'>('all');
  // โหมดจริงใช้ประวัติจาก Bot API (มีแค่หัวข้อ ไม่มีข้อความเต็ม); โหมดตัวอย่างใช้ข้อมูลสมมติ
  const cases: MiniHistoryItem[] = session.live ? session.history : sampleCases;
  const showFilters = cases.length > 1;
  const query = searchText.trim().toLocaleLowerCase('th-TH');
  const visibleCases = cases.filter((detectionCase) => {
    const matchesStatus = selectedStatus === 'all' || detectionCase.status === selectedStatus;
    const fullMessage = 'message' in detectionCase ? String(detectionCase.message) : '';
    return matchesStatus && `${detectionCase.title} ${fullMessage}`.toLocaleLowerCase('th-TH').includes(query);
  });
  // รายการเรียงใหม่→เก่ามาจาก Bot API แล้ว จึงจัดกลุ่มตามลำดับที่ได้มา
  const groups: { label: string; items: MiniHistoryItem[] }[] = [];
  for (const item of visibleCases) {
    const label = dayLabel(item.receivedAt);
    if (groups.at(-1)?.label === label) groups.at(-1)!.items.push(item);
    else groups.push({ label, items: [item] });
  }
  const busy = session.loading || session.needsLogin || session.historyLoading || Boolean(session.historyError) || Boolean(session.error);

  function clearFilters() {
    setSearchText('');
    setSelectedStatus('all');
  }

  return (
    <>
      <MiniPageHeading title="ประวัติการตรวจ" pose="inspect" />
      <div className="mini-page-body">
        {session.live && <MiniSessionNotice />}
        {session.historyLoading && <p className="mini-note" role="status">กำลังโหลดประวัติ…</p>}
        {session.live && session.historyError && <section className="mini-card">
          <p className="mini-session-error" role="alert">{session.historyError}</p>
          <button type="button" className="mini-secondary-button" onClick={session.reloadHistory}>ลองอีกครั้ง</button>
        </section>}
        {/* มีเคสไม่เกินหนึ่งรายการ ค้นหาหรือกรองไปก็ไม่ได้อะไร จึงซ่อนไว้ให้หน้าสั้นลง */}
        {showFilters && <>
          <label className="mini-search"><Search aria-hidden="true" /><input type="search" value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="ค้นหาข้อความที่เคยตรวจ" aria-label="ค้นหาประวัติ" /></label>
          <div className="mini-filters" aria-label="กรองสถานะผลตรวจ">
            <button type="button" aria-pressed={selectedStatus === 'all'} onClick={() => setSelectedStatus('all')}>ทั้งหมด</button>
            {(['risk_found', 'uncertain', 'no_risk_found'] as const).map((status) => <button type="button" key={status} aria-pressed={selectedStatus === status} onClick={() => setSelectedStatus(status)}>{statusLabels[status]}</button>)}
          </div>
        </>}
        {cases.length > 0 && <p className="mini-secondary" role="status">{visibleCases.length} รายการ</p>}
        {groups.map(group => <section key={group.label} className="mini-day-group">
          <h2>{group.label}</h2>
          {group.items.map((detectionCase) => {
            const source = readSource(detectionCase.title);
            return (
              <Link key={detectionCase.id} className="mini-case-row" to={session.live ? session.miniHref('detail', detectionCase.id) : `/mini/cases/${detectionCase.id}`}>
                <span className={`mini-status-dot ${detectionCase.status}`} aria-hidden="true">{statusSymbols[detectionCase.status]}</span>
                <span className="mini-case-copy">
                  <span className="mini-case-message">{source.text || 'ข้อความในรูป'}</span>
                  <span className="mini-case-meta">{typeLabel(detectionCase, source.image)} · <time dateTime={detectionCase.receivedAt}>{bangkokTime(detectionCase.receivedAt)} น.</time></span>
                  <span className={`mini-status-label ${detectionCase.status}`}>{statusLabels[detectionCase.status]}</span>
                </span>
                <ChevronRight aria-hidden="true" className="mini-chevron" />
              </Link>
            );
          })}
        </section>)}
        {visibleCases.length > 0 && <p className="mini-note"><Info aria-hidden="true" />เปิดแต่ละรายการเพื่อดูเหตุผลและคำแนะนำ</p>}
        {visibleCases.length === 0 && !busy && <section className="mini-card mini-empty">
          <MiniMascot pose="inspect" />
          <h2>{cases.length === 0 ? 'ยังไม่มีประวัติการตรวจ' : 'ไม่พบรายการที่ตรงกัน'}</h2>
          <p>{cases.length === 0 ? 'ส่งข้อความที่สงสัยในแชตเพื่อเริ่มตรวจ' : 'ลองเปลี่ยนคำค้นหาหรือตัวกรอง'}</p>
          {cases.length > 0 && <button type="button" className="mini-secondary-button" onClick={clearFilters}>ดูรายการทั้งหมด</button>}
        </section>}
      </div>
    </>
  );
}
