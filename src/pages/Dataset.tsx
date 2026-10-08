import { useEffect, useState } from 'react';
import { Check, X, Search, RefreshCw, Download } from 'lucide-react';
import { request } from '../services/api';
import type { DatasetEntry, DatasetLabel } from '../types';
import './Dataset.css';

interface Candidate { id: string; message: string; label: DatasetLabel | null; reason: string; similarity: number | null; analysis: string; source: string; category: string; occurrences: number }
interface HistoryEntry extends DatasetEntry { reviewId: string; approvedAt: string }
interface MatchPreview { confirmation: string; match: { message: string; label: DatasetLabel; similarity: number }; message: string; label: DatasetLabel | null }
const examples: Candidate[] = [
  { id: 'EX-001', message: 'รับงานกดไลก์ รายได้วันละ 2,000 บาท เติมเงินเปิดภารกิจก่อนเริ่มงาน', label: null, reason: 'ความคล้ายต่ำและพบความเสี่ยง', similarity: 48, analysis: 'มีการเรียกเก็บเงินก่อนเริ่มงาน', source: 'LINE', category: 'หลอกทำงาน', occurrences: 3 },
  { id: 'EX-002', message: 'บัญชีคุณเกี่ยวข้องกับคดี กรุณาโอนเงินไปบัญชีตรวจสอบ', label: null, reason: 'ความคล้ายต่ำและพบความเสี่ยง', similarity: 56, analysis: 'แอบอ้างเจ้าหน้าที่และขอให้โอนเงิน', source: 'LINE', category: 'แอบอ้างเจ้าหน้าที่', occurrences: 1 },
  { id: 'EX-003', message: 'พรุ่งนี้ช่วยโอนค่าสินค้าตามที่ตกลงด้วยนะครับ', label: null, reason: 'ระบบไม่แน่ใจ', similarity: 72, analysis: 'บริบทไม่เพียงพอที่จะสรุปความเสี่ยง', source: 'LINE', category: 'ทั่วไป', occurrences: 1 },
];

export default function Dataset() {
  const [demo, setDemo] = useState(false);
  const [tab, setTab] = useState('review');
  const [rows, setRows] = useState<Candidate[]>([]);
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [page, setPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previews, setPreviews] = useState<Record<string, MatchPreview>>({});
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true); setRows([]); setEntries([]); setHistoryTotal(0); setSelected([]); setErrors({}); setNotice('');
    const load = Promise.allSettled([
      demo ? Promise.resolve(examples.map(row => ({ ...row }))) : request<Candidate[]>('/dataset/candidates'),
    ]);
    load.then(([pending]) => {
      if (!active) return;
      if (pending.status === 'fulfilled') setRows(pending.value);
      const failed = [];
      if (pending.status === 'rejected') failed.push('คิวรอพิจารณา');
      if (failed.length) setNotice(`โหลด${failed.join(' และ ')}ไม่สำเร็จ กรุณาตรวจการตั้งค่า API`);
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [demo, revision]);
  useEffect(() => {
    if (demo) return;
    if (tab !== 'saved') return;
    let active = true;
    setHistoryLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (filter === 'spam' || filter === 'ham') params.set('label', filter);
    request<{items: HistoryEntry[]; total: number}>(`/dataset/history?${params}`).then(result => {
      if (active) { setEntries(result.items); setHistoryTotal(result.total); }
    }).catch(() => { if (active) { setEntries([]); setNotice('โหลดประวัติการอนุมัติไม่สำเร็จ'); } }).finally(() => { if (active) setHistoryLoading(false); });
    return () => { active = false; };
  }, [tab, page, filter, demo, revision]);
  const matches = (row: { message: string; label: string | null }) => row.message.includes(query) && (filter === 'all' || row.label === filter || (filter === 'unlabeled' && row.label === null));
  const visible = rows.filter(matches);
  const saved = entries.filter(matches);
  const picked = visible.filter(row => selected.includes(row.id));
  const all = visible.length > 0 && visible.every(row => selected.includes(row.id));
  const update = (id: string, changes: Partial<Candidate>) => setRows(previous => previous.map(row => row.id === id ? { ...row, ...changes } : row));
  async function review(items: Candidate[], action: 'approve' | 'skip', confirm = false) {
    if (busy || !items.length) return;
    if (action === 'approve' && items.some(row => !row.label || !row.message.trim())) { setNotice('กรุณาระบุข้อความและเลือก Spam หรือ Ham ให้ครบ'); return; }
    setBusy(true); setNotice(''); let done = 0;
    for (const row of items) {
      try {
        let entry: DatasetEntry | undefined;
        if (demo) {
          if (action === 'approve') entry = { id: row.id, message: row.message.trim(), label: row.label!, category: row.category, source: row.source, confirmed: true };
        } else {
          const base = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
          const token = sessionStorage.getItem('dashboardToken');
          const preview = previews[row.id];
          const confirmMatch = confirm && preview?.message === row.message.trim() && preview?.label === row.label ? preview.confirmation : undefined;
          const response = await fetch(`${base}/dataset/candidates/${encodeURIComponent(row.id)}/${action}`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ message: row.message.trim(), label: row.label, confirmMatch }), signal: AbortSignal.timeout(60000) });
          if (!response.ok) throw new Error('ดำเนินการไม่สำเร็จ กรุณาตรวจสถานะก่อนลองใหม่');
          const result = await response.json() as { status: string; entry?: DatasetEntry; confirmation: string; match: MatchPreview['match'] };
          if (result.status === 'review_required') {
            setPreviews(previous => ({ ...previous, [row.id]: { confirmation: result.confirmation, match: result.match, message: row.message.trim(), label: row.label } }));
            continue;
          }
          if (action === 'approve' && (result.status !== 'saved' || !result.entry)) throw new Error('ยังไม่ได้รับการยืนยันว่าบันทึกสำเร็จ');
          if (action === 'skip' && result.status !== 'skipped') throw new Error('ยังไม่ได้รับการยืนยันว่าข้ามแล้ว');
          entry = result.entry;
        }
        if (entry && demo) { const value = { ...entry, reviewId: row.id, approvedAt: new Date().toISOString() }; setEntries(previous => [value, ...previous]); setHistoryTotal(previous => previous + 1); }
        setRows(previous => previous.filter(item => item.id !== row.id)); setSelected(previous => previous.filter(id => id !== row.id)); done++;
      } catch (error) { setErrors(previous => ({ ...previous, [row.id]: error instanceof Error ? error.message : 'ดำเนินการไม่สำเร็จ' })); }
    }
    setNotice(`${demo ? 'ผลตัวอย่าง: ' : ''}${action === 'approve' ? 'เพิ่ม' : 'ข้าม'} ${done}/${items.length} รายการ${action === 'approve' && done < items.length ? ' ตรวจผลเปรียบเทียบหรือข้อผิดพลาดด้านล่าง' : ''}${demo ? ' ไม่มีการเขียนฐานข้อมูล' : ''}`); setBusy(false);
  }
  function exportCsv() {
    const cell = (value: string) => '"' + (/^[=+@\-\t\r\n]/.test(value) ? "'" : '') + value.replace(/"/g, '""') + '"';
    const csv = ['id,message,label,category,source', ...saved.map(row => [row.id, row.message, row.label, row.category, row.source].map(cell).join(','))].join('\r\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' })); const link = document.createElement('a'); link.href = url; link.download = demo ? 'dataset-example.csv' : 'dataset.csv'; link.click(); URL.revokeObjectURL(url);
  }
  return <div className="ds-workspace">
    <header className="ds-heading"><div><h1>Dataset</h1><p>ตรวจสอบและจัดการตัวอย่างข้อความ</p></div><label><input type="checkbox" checked={demo} disabled={busy} onChange={event => setDemo(event.target.checked)} /> ข้อมูลตัวอย่าง</label></header>
    {demo && <p className="ds-banner">โหมดตัวอย่าง การอนุมัติและข้ามรายการไม่มีการบันทึกเข้า Supabase</p>}
    <div className="ds-stats"><div><span>รอพิจารณา</span><strong>{loading ? '—' : rows.length}</strong></div></div>
    <div className="ds-tabs" role="tablist" aria-label="รายการ Dataset">{[['review', 'รอพิจารณา'], ['saved', 'ประวัติการอนุมัติ']].map(([value, label]) => <button key={value} role="tab" aria-selected={tab === value} onClick={() => { setTab(value); setFilter('all'); setQuery(''); setPage(1); }}>{label}</button>)}</div>
    <div className="ds-toolbar"><label className="ds-search"><Search size={18} /><input aria-label="ค้นหาข้อความ" placeholder="ค้นหาข้อความ" value={query} onChange={event => setQuery(event.target.value)} /></label><select aria-label="กรอง Label" value={filter} onChange={event => setFilter(event.target.value)}><option value="all">ทุก Label</option><option value="spam">Spam</option><option value="ham">Ham</option>{tab === 'review' && <option value="unlabeled">ยังไม่ระบุ</option>}</select><button title="โหลดรายการใหม่" aria-label="โหลดรายการใหม่" disabled={busy || loading} onClick={() => setRevision(value => value + 1)}><RefreshCw size={18} /></button>{tab === 'saved' && <button disabled={!saved.length || loading} onClick={exportCsv}><Download size={16} />ส่งออก CSV</button>}</div>
    {notice && <p className="ds-notice" role="status">{notice}</p>}
    {loading ? <div className="ds-empty">กำลังโหลดรายการ...</div> : tab === 'review' ? <>
      <div className="ds-selection"><label><input type="checkbox" checked={all} disabled={busy || !visible.length} onChange={event => setSelected(event.target.checked ? [...new Set([...selected, ...visible.map(row => row.id)])] : selected.filter(id => !visible.some(row => row.id === id)))} /> เลือกทั้งหมดที่แสดง</label><span>{visible.length} รายการ</span></div>
      {!visible.length && <div className="ds-empty">ไม่พบรายการรอพิจารณา</div>}
      {visible.map(row => <article className="ds-row" key={row.id}><input type="checkbox" aria-label={`เลือก ${row.id}`} checked={selected.includes(row.id)} disabled={busy} onChange={event => setSelected(previous => event.target.checked ? [...previous, row.id] : previous.filter(id => id !== row.id))} /><div><div className="ds-meta"><span>{row.id} · {row.source} · พบ {row.occurrences} ครั้ง</span><span className="ds-reason">{row.reason}</span></div><textarea aria-label={`ข้อความ ${row.id}`} value={row.message} disabled={busy} onChange={event => update(row.id, { message: event.target.value })} /><p className="ds-analysis">{row.analysis}</p>{errors[row.id] && <p className="ds-error" role="alert">{errors[row.id]}</p>}</div><div className="ds-review"><span>ความคล้าย <strong>{row.similarity == null ? 'ไม่ระบุ' : `${row.similarity}%`}</strong></span><div className="ds-labels">{(['spam', 'ham'] as DatasetLabel[]).map(label => <button key={label} aria-pressed={row.label === label} disabled={busy} className={row.label === label ? `active ${label}` : ''} onClick={() => update(row.id, { label: row.label === label ? null : label })}>{label === 'spam' ? 'Spam' : 'Ham'}</button>)}</div><div className="ds-actions"><button disabled={busy || !row.label || !row.message.trim()} onClick={() => void review([row], 'approve')}><Check size={16} />อนุมัติ</button><button disabled={busy} onClick={() => void review([row], 'skip')}><X size={16} />ข้าม</button></div></div></article>)}
      {visible.filter(row => previews[row.id]?.message === row.message.trim() && previews[row.id]?.label === row.label).map(row => {
        const preview = previews[row.id];
        return <section className="ds-notice" key={`match-${row.id}`}><strong>เปรียบเทียบก่อนเพิ่ม · {row.id}</strong><p>ข้อความที่อนุมัติ: {row.message}</p><p>ตัวอย่างที่ใกล้ที่สุดในฐาน: {preview.match.message}</p><p>Label เดิม: {preview.match.label} · ความคล้าย: {preview.match.similarity}%</p><div className="ds-actions"><button disabled={busy} onClick={() => void review([row], 'skip')}><X size={16} />ข้ามเพราะซ้ำ</button><button disabled={busy} onClick={() => void review([row], 'approve', true)}><Check size={16} />ยืนยันเพิ่มเป็นตัวอย่างใหม่</button></div></section>;
      })}
      <div className="ds-bottom"><span>เลือก {picked.length} รายการที่แสดง</span><button disabled={busy || !picked.length} onClick={() => void review(picked, 'skip')}><X size={16} />ข้ามที่เลือก</button><button className="ds-primary" disabled={busy || !picked.length} onClick={() => void review(picked, 'approve')}><Check size={16} />{busy ? 'กำลังประมวลผล' : 'อนุมัติที่เลือก'}</button></div>
    </> : historyLoading ? <div className="ds-empty">กำลังโหลดประวัติ...</div> : <><div className="ds-table"><table><thead><tr><th>ID Dataset</th><th>ข้อความ</th><th>Label</th><th>วันที่อนุมัติ</th></tr></thead><tbody>{saved.map(row => <tr key={row.reviewId}><td>{row.id}</td><td>{row.message}</td><td className={row.label}>{row.label === 'spam' ? 'Spam' : 'Ham'}</td><td>{new Date(row.approvedAt).toLocaleString('th-TH')}</td></tr>)}</tbody></table>{!saved.length && <div className="ds-empty">ไม่พบประวัติการอนุมัติในหน้านี้</div>}</div><div className="ds-bottom"><span>หน้า {page} / {Math.max(1, Math.ceil(historyTotal / 25))} · {historyTotal} รายการ</span><button disabled={page === 1} onClick={() => setPage(value => value - 1)}>ก่อนหน้า</button><button disabled={page * 25 >= historyTotal} onClick={() => setPage(value => value + 1)}>ถัดไป</button></div></>}
  </div>;
}
