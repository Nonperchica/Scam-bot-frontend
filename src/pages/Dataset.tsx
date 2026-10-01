// =============================================
// Senior Guard — Dataset Page
// =============================================

import { useEffect, useState } from 'react';
import { Search, Upload, Download, Save, CheckCircle, MoreHorizontal } from 'lucide-react';
import { fetchDatasetEntries, fetchDatasetStats } from '../services/api';
import { formatNumber } from '../utils/formatters';
import type { DatasetEntry, DatasetStats, DatasetLabel } from '../types';

export default function Dataset() {
  const [entries, setEntries] = useState<DatasetEntry[]>([]);
  const [stats, setStats] = useState<DatasetStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLabel, setFilterLabel] = useState<DatasetLabel | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterSource, setFilterSource] = useState('all');

  useEffect(() => {
    async function loadData() {
      try {
        const [e, s] = await Promise.all([
          fetchDatasetEntries(),
          fetchDatasetStats(),
        ]);
        setEntries(e);
        setStats(s);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter entries
  const filteredEntries = entries.filter((entry) => {
    const matchSearch =
      searchQuery === '' ||
      entry.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchLabel = filterLabel === 'all' || entry.label === filterLabel;
    const matchCategory = filterCategory === 'all' || entry.category === filterCategory;
    const matchSource = filterSource === 'all' || entry.source === filterSource;

    return matchSearch && matchLabel && matchCategory && matchSource;
  });

  // Get unique categories and sources for filter dropdowns
  const categories = [...new Set(entries.map((e) => e.category))];
  const sources = [...new Set(entries.map((e) => e.source))];

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  const spamPercent = stats && stats.total > 0 ? ((stats.spam / stats.total) * 100).toFixed(1) : '0';
  const hamPercent = stats && stats.total > 0 ? ((stats.ham / stats.total) * 100).toFixed(1) : '0';

  return (
    <div className="dataset-page">
      {/* Stat Cards */}
      <div className="overview-stat-cards">
        <div className="overview-stat-card">
          <span className="overview-stat-label">ข้อมูลทั้งหมด</span>
          <span className="overview-stat-value">{formatNumber(stats?.total ?? 0)}</span>
        </div>
        <div className="overview-stat-card">
          <span className="overview-stat-label">Spam</span>
          <span className="overview-stat-value dataset-value--spam">{formatNumber(stats?.spam ?? 0)}</span>
          <span className="dataset-stat-sub">{spamPercent}% ของทั้งหมด</span>
        </div>
        <div className="overview-stat-card">
          <span className="overview-stat-label">Ham</span>
          <span className="overview-stat-value dataset-value--ham">{formatNumber(stats?.ham ?? 0)}</span>
          <span className="dataset-stat-sub">{hamPercent}% ของทั้งหมด</span>
        </div>
      </div>

      {/* Table Section */}
      <div className="dataset-table-section">
        <div className="dataset-table-header">
          <h2 className="dataset-table-title">ข้อมูลที่ยืนยันแล้ว</h2>
          <span className="dataset-result-count">แสดง {filteredEntries.length} รายการ</span>
        </div>

        {/* Filters */}
        <div className="dataset-toolbar">
          <div className="search-box dataset-search">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="ค้นหาข้อความ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <select
            value={filterLabel}
            onChange={(e) => setFilterLabel(e.target.value as DatasetLabel | 'all')}
            className="dataset-filter-select"
          >
            <option value="all">ทุก Label</option>
            <option value="spam">Spam</option>
            <option value="ham">Ham</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="dataset-filter-select"
          >
            <option value="all">ทุกประเภท</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="dataset-filter-select"
          >
            <option value="all">ทุกแหล่งข้อมูล</option>
            {sources.map((src) => (
              <option key={src} value={src}>{src}</option>
            ))}
          </select>

          <button className="dataset-select-all-btn">เลือกทั้งหมด</button>
        </div>

        {/* Table */}
        <div className="threat-table-wrapper">
          <table className="threat-table dataset-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>ข้อความตัวอย่าง</th>
                <th>Label</th>
                <th>ประเภท</th>
                <th>แหล่งข้อมูล</th>
                <th style={{ width: '50px' }}></th>
                <th style={{ width: '50px' }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry) => (
                <tr key={entry.id}>
                  <td className="cell-id">{entry.id}</td>
                  <td className="cell-message">{entry.message}</td>
                  <td>
                    <span className={`dataset-label dataset-label--${entry.label}`}>
                      {entry.label === 'spam' ? 'Spam' : 'Ham'}
                    </span>
                  </td>
                  <td>{entry.category}</td>
                  <td>{entry.source}</td>
                  <td style={{ textAlign: 'center' }}>
                    {entry.confirmed && (
                      <CheckCircle size={20} className="dataset-confirmed-icon" />
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button className="dataset-action-btn" aria-label="More actions">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Actions */}
        <div className="dataset-bottom-actions">
          <div className="dataset-bottom-left">
            <button className="dataset-btn dataset-btn--outline">
              <Upload size={16} />
              <span>นำเข้าข้อมูล</span>
            </button>
            <button className="dataset-btn dataset-btn--outline">
              <Download size={16} />
              <span>ส่งออก CSV</span>
            </button>
          </div>
          <button className="dataset-btn dataset-btn--primary">
            <Save size={16} />
            <span>อนุมัติเข้า Dataset</span>
          </button>
        </div>
      </div>
    </div>
  );
}
