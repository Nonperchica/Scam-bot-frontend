// =============================================
// Senior Guard — Threat Logs Page
// =============================================

import { useEffect, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import ThreatTable from '../components/ThreatTable';
import { fetchThreatLogs } from '../services/api';
import type { ThreatLog, RiskLevel } from '../types';

export default function ThreatLogs() {
  const [logs, setLogs] = useState<ThreatLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<RiskLevel | 'all'>('all');

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchThreatLogs();
        setLogs(data);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // กรองข้อมูล
  const filteredLogs = logs.filter((log) => {
    const matchSearch =
      searchQuery === '' ||
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchRisk = filterRisk === 'all' || log.riskLevel === filterRisk;

    return matchSearch && matchRisk;
  });

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  return (
    <div className="threat-logs-page">
      {/* Toolbar */}
      <div className="toolbar">
        {/* Search */}
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="ค้นหาข้อความ, ผู้ส่ง, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Filter */}
        <div className="filter-group">
          <Filter size={18} />
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value as RiskLevel | 'all')}
            className="filter-select"
          >
            <option value="all">ทุกระดับความเสี่ยง</option>
            <option value="high">สูง</option>
            <option value="medium">ปานกลาง</option>
            <option value="low">ต่ำ</option>
          </select>
        </div>

        {/* Result count */}
        <div className="result-count">
          แสดง {filteredLogs.length} จาก {logs.length} รายการ
        </div>
      </div>

      {/* Table */}
      <div className="section-card">
        <ThreatTable logs={filteredLogs} />
      </div>
    </div>
  );
}
