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

  useEffect(() => {
    async function loadData() {
      try {
        const groups = await fetchLineGroups();
        setLineGroups(groups);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

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
      {/* LINE Groups Grid */}
      <div className="line-groups-grid" style={{ padding: 0 }}>
        {lineGroups.map((group, index) => (
          <LineGroupCard key={group.id} group={group} index={index} />
        ))}
      </div>
    </div>
  );
}
