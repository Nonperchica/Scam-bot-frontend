// นำเข้า DataError — คอมโพเนนต์แสดงกล่อง error พร้อมปุ่มลองใหม่
import DataError from '../components/DataError';
// =============================================
// Senior Guard — Threat Logs Page
// หน้าแสดงรายการข้อความที่ตรวจพบความเสี่ยง
// พร้อมค้นหา กรองระดับเสี่ยง และเลือกแหล่งข้อมูล
// =============================================

// นำเข้า useEffect (ทำงานหลัง render เช่น โหลด API) และ useState (เก็บค่าที่ React จำไว้)
import { useEffect, useState } from 'react';
// นำเข้าไอคอนแว่นขยาย (Search) และไอคอนกรอง (Filter) จาก lucide-react
import { Search, Filter } from 'lucide-react';
// นำเข้า ThreatTable — คอมโพเนนต์ตารางแสดงข้อความเสี่ยง รับ logs เป็น props
import ThreatTable from '../components/ThreatTable';
// นำเข้า SourceSelector — ปุ่มเลือกแหล่งข้อมูล (ทั้งหมด/ส่วนตัว/กลุ่ม)
import SourceSelector from '../components/SourceSelector';
// นำเข้าฟังก์ชัน fetchThreatLogs — เรียก API ขอรายการข้อความเสี่ยงจาก backend
import { fetchThreatLogs } from '../services/api';
// นำเข้า type — กำหนดรูปร่างข้อมูล (ThreatLog=ข้อความเสี่ยง, RiskLevel=ระดับเสี่ยง, DashboardSource=แหล่งข้อมูล)
import type { ThreatLog, RiskLevel, DashboardSource } from '../types';

/**
 * ThreatLogs — คอมโพเนนต์หน้าข้อความเสี่ยง
 * แสดงตารางข้อความที่ระบบตรวจพบว่ามีความเสี่ยง
 * ผู้ใช้สามารถค้นหา กรองระดับเสี่ยง และเลือกแหล่งข้อมูลได้
 */
export default function ThreatLogs() {
  // === State (ค่าที่ React จำไว้ เปลี่ยนแล้ว UI จะอัปเดตอัตโนมัติ) ===

  // logs — เก็บรายการข้อความเสี่ยงทั้งหมดที่โหลดจาก API (เริ่มเป็น array ว่าง)
  const [logs, setLogs] = useState<ThreatLog[]>([]);
  // loading — บอกว่ากำลังโหลดข้อมูลอยู่หรือไม่ (เริ่มเป็น true เพราะเข้าหน้ามาต้องโหลด)
  const [loading, setLoading] = useState(true);
  // error — ข้อความ error ถ้าโหลดไม่สำเร็จ (เริ่มเป็นว่าง = ไม่มี error)
  const [error, setError] = useState('');
  // searchQuery — คำค้นหาที่ผู้ใช้พิมพ์ในช่องค้นหา (เริ่มเป็นว่าง)
  const [searchQuery, setSearchQuery] = useState('');
  // filterRisk — ระดับเสี่ยงที่เลือกกรอง เช่น 'high', 'medium', 'low' หรือ 'all' (เริ่มเป็น 'all' = แสดงทั้งหมด)
  const [filterRisk, setFilterRisk] = useState<RiskLevel | 'all'>('all');
  // source — แหล่งข้อมูลที่เลือก: 'all' (ทั้งหมด), 'private' (แชทส่วนตัว), 'group' (กลุ่ม LINE)
  const [source, setSource] = useState<DashboardSource>('all');

  /**
   * useEffect — โหลดข้อมูลข้อความเสี่ยงจาก API
   * ทำงานเมื่อ: เข้าหน้าครั้งแรก หรือ source (แหล่งข้อมูล) เปลี่ยน
   * dependency array [source] หมายถึง: ถ้า source เปลี่ยน ให้รัน effect นี้ใหม่
   */
  useEffect(() => {
    // active guard — ป้องกันคำขอเก่า (ที่ยังไม่ตอบกลับ) มาทับข้อมูลใหม่
    // เช่น ถ้าเปลี่ยน source เร็วๆ คำขอแรกที่ยังไม่เสร็จจะไม่อัปเดต state
    let active = true;

    /**
     * loadData — ฟังก์ชัน async ภายใน effect สำหรับเรียก API
     * ใช้ async/await เพื่อรอผลลัพธ์จาก server โดยไม่ปิดกั้นหน้าเว็บ
     */
    async function loadData() {
      try {
        // เรียก API ขอข้อมูลข้อความเสี่ยง โดยส่ง source (แหล่งข้อมูล) ไปด้วย
        const data = await fetchThreatLogs(source);
        // ถ้า effect ยัง active (ไม่ถูก cleanup) จึงอัปเดต state
        if (active) { setLogs(data); setError(''); }
      } catch {
        // ถ้าเรียก API ไม่สำเร็จ แสดงข้อความ error
        if (active) setError('โหลดข้อมูลจริงไม่สำเร็จ กรุณาตรวจการเชื่อมต่อหรือรหัสเข้า Dashboard');
      } finally {
        // ไม่ว่าจะสำเร็จหรือล้มเหลว ปิดสถานะ loading
        if (active) setLoading(false);
      }
    }
    loadData();

    // cleanup function — ทำงานเมื่อ component unmount หรือ source เปลี่ยน
    // ตั้ง active = false เพื่อไม่ให้คำขอเก่ามาอัปเดต state
    return () => { active = false; };
  }, [source]);

  /**
   * filteredLogs — กรองข้อมูลข้อความเสี่ยงตามคำค้นหาและระดับเสี่ยง
   * filter() วนทุกแถว คืนเฉพาะแถวที่ตรงเงื่อนไข
   * การค้นหาทำในเบราว์เซอร์จากข้อมูลที่โหลดมาแล้ว ไม่เรียก server ทุกครั้งที่พิมพ์
   */
  const filteredLogs = logs.filter((log) => {
    // matchSearch — ตรวจว่าคำค้นหาตรงกับข้อมูลในแถวนี้หรือไม่
    // ถ้าไม่มีคำค้น (searchQuery === '') จะตรงทุกแถว
    // ใช้ toLowerCase() เพื่อค้นหาแบบไม่สนตัวพิมพ์ใหญ่/เล็ก
    // ใช้ includes() ตรวจว่าคำค้นอยู่ใน ข้อความ หรือ ชื่อผู้ส่ง หรือ ID ผู้ส่ง หรือ ID ข้อความ
    const matchSearch =
      searchQuery === '' ||
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.senderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.id.toLowerCase().includes(searchQuery.toLowerCase());

    // matchRisk — ตรวจว่าระดับเสี่ยงตรงกับตัวกรองหรือไม่
    // ถ้าเลือก 'all' จะตรงทุกระดับ
    const matchRisk = filterRisk === 'all' || log.riskLevel === filterRisk;

    // ต้องผ่านทั้งสองเงื่อนไข (&&) จึงจะแสดงแถวนี้
    return matchSearch && matchRisk;
  });

  // === เงื่อนไข render — ตรวจสอบสถานะก่อนแสดงหน้าจอ ===

  // ถ้ามี error → แสดงคอมโพเนนต์ DataError พร้อมข้อความผิดพลาด แทนที่จะแสดงตาราง
  if (error) return <DataError message={error} />;

  // ถ้ากำลังโหลด → แสดง spinner กับข้อความ "กำลังโหลดข้อมูล..."
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  // === JSX หลัก — แสดงเมื่อโหลดสำเร็จและไม่มี error ===
  return (
    <div className="threat-logs-page">
      {/* แถบเครื่องมือ: เลือกแหล่ง, ค้นหา, กรอง, แสดงจำนวน */}
      <div className="toolbar">
        {/* SourceSelector — ปุ่มเลือกแหล่งข้อมูล (ทั้งหมด/ส่วนตัว/กลุ่ม)
            เมื่อเปลี่ยน: setSource เปลี่ยนแหล่ง → useEffect จะเรียก API ใหม่
            setLoading(true) แสดง spinner, setLogs([]) ล้างข้อมูลเก่า */}
        <SourceSelector value={source} onChange={value => { setSource(value); setLoading(true); setLogs([]); }} />
        {/* ช่องค้นหา — พิมพ์แล้ว setSearchQuery เปลี่ยน state → filteredLogs คำนวณใหม่ → ตาราง render ใหม่ */}
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            aria-label="ค้นหาข้อความที่พบความเสี่ยง"
            placeholder="ค้นหาข้อความ, ผู้ส่ง, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        {/* ตัวกรองระดับเสี่ยง — เลือกแล้ว setFilterRisk เปลี่ยน state → filteredLogs คำนวณใหม่ */}
        <div className="filter-group">
          <Filter size={18} />
          <select
            aria-label="ระดับความเสี่ยง"
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value as RiskLevel | 'all')}
            className="filter-select"
          >
            <option value="all">ทุกระดับความเสี่ยง</option>
            <option value="high">สูง</option>
            <option value="medium">ปานกลาง</option>
            <option value="low">ต่ำ</option>
            <option value="unknown">ไม่ระบุ</option>
          </select>
        </div>

        {/* แสดงจำนวนผลลัพธ์ — filteredLogs.length คือจำนวนที่กรองแล้ว, logs.length คือทั้งหมด */}
        <div className="result-count">
          แสดง {filteredLogs.length} จาก {logs.length} รายการ
        </div>
      </div>

      {/* ตาราง — ส่ง filteredLogs (ข้อมูลที่กรองแล้ว) เป็น props ให้ ThreatTable แสดง */}
      <div className="section-card">
        <ThreatTable logs={filteredLogs} />
      </div>
    </div>
  );
}
