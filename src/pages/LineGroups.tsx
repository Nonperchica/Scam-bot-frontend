import DataError from '../components/DataError';
// =============================================
// Senior Guard — LINE Groups Page
// =============================================

import { useEffect, useState } from 'react';
import LineGroupCard from '../components/LineGroupCard';
import { fetchLineGroups } from '../services/api';
import type { LineGroup } from '../types';

export default function LineGroups() {
  const [lineGroups, setLineGroups] = useState<LineGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const groups = await fetchLineGroups();
        setLineGroups(groups);
      } catch {
        setError('โหลดข้อมูลจริงไม่สำเร็จ กรุณาตรวจการเชื่อมต่อหรือรหัสเข้า Dashboard');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (error) return <DataError message={error} />;

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  return (
    <div className="overview-page">
      {lineGroups.length === 0 && <p>ยังไม่มีข้อมูลกลุ่ม LINE จริง</p>}
      {/* LINE Groups Grid */}
      <div className="line-groups-grid" style={{ padding: 0 }}>
        {lineGroups.map((group, index) => (
          <LineGroupCard key={group.id} group={group} index={index} />
        ))}
      </div>
    </div>
  );
}
