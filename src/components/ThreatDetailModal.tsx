// =============================================
// Senior Guard — ThreatDetailModal Component
// หน้าต่างป๊อปอัพแสดงรายละเอียดข้อความเสี่ยงแบบเต็ม
// =============================================

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Copy, Check, ShieldAlert, Image, MessageSquare, Link2, Clock, User, Users } from 'lucide-react';
import type { ThreatLog } from '../types';
import { formatDate, getRiskLabel, parseImageMessage } from '../utils/formatters';

interface ThreatDetailModalProps {
  log: ThreatLog | null;
  onClose: () => void;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  blocked: { label: 'บล็อกแล้ว', className: 'badge badge--blocked' },
  flagged: { label: 'พบความเสี่ยง', className: 'badge badge--flagged' },
  reviewed: { label: 'ตรวจสอบแล้ว', className: 'badge badge--reviewed' },
  pending: { label: 'รอดำเนินการ', className: 'badge badge--pending' },
};

/**
 * ThreatDetailModal — ป๊อปอัพแสดงข้อมูลเชิงลึกของข้อความเสี่ยง
 * รับ: log (ข้อมูลข้อความที่เลือก หรือ null) และ onClose (ฟังก์ชันปิด modal)
 * ทำ: 
 *   - แสดงข้อมูลทั้งหมด ข้อความ OCR เต็ม และปุ่มคัดลอกข้อความ
 *   - ใช้ createPortal ย้าย Modal ไปที่ document.body เพื่อให้อยู่ตรงกลางหน้าจอเสมอ ไม่หลุดไปตามการเลื่อนหน้าเว็บ
 *   - ล็อก scroll ของ body ขณะเปิด modal
 * คืน: React Portal ไปที่ document.body หรือ null เมื่อไม่ได้เลือกรายการ
 * ถ้าพัง: มีเงื่อนไข if (!log) return null ป้องกันการ crash
 */
export default function ThreatDetailModal({ log, onClose }: ThreatDetailModalProps) {
  const [copied, setCopied] = useState(false);

  // รองรับการกดปุ่ม ESC และล็อก scroll ของหน้าจอขณะเปิด modal
  useEffect(() => {
    if (!log) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [log, onClose]);

  if (!log) return null;

  const { isImage, isLink, displayText } = parseImageMessage(log.message, log.messageType);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayText || log.message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard fallback
    }
  };

  const modalJSX = (
    <div className="threat-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="threat-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="threat-modal-header">
          <div className="threat-modal-header-title">
            <span className="threat-modal-icon">
              <ShieldAlert size={20} />
            </span>
            <div>
              <h3>รายละเอียดข้อความที่พบความเสี่ยง</h3>
              <p className="threat-modal-id">ID: {log.id}</p>
            </div>
          </div>
          <button
            type="button"
            className="threat-modal-close-btn"
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="threat-modal-body">
          {/* ข้อมูลสรุป Grid */}
          <div className="threat-modal-grid">
            <div className="threat-modal-field">
              <label>ประเภท</label>
              <span className="threat-modal-type-badge">
                {isImage ? <Image size={14} /> : isLink ? <Link2 size={14} /> : <MessageSquare size={14} />}
                {isImage ? 'รูปภาพ (ข้อความ OCR)' : isLink ? 'ลิงก์ (URL)' : 'ข้อความทั่วไป'}
              </span>
            </div>

            <div className="threat-modal-field">
              <label>ระดับความเสี่ยง</label>
              <div>
                <span className={`badge badge--risk-${log.riskLevel}`}>
                  {getRiskLabel(log.riskLevel)}
                </span>
              </div>
            </div>

            <div className="threat-modal-field">
              <label>สถานะ</label>
              <div>
                <span className={statusConfig[log.status]?.className || 'badge'}>
                  {statusConfig[log.status]?.label || log.status}
                </span>
              </div>
            </div>

            <div className="threat-modal-field">
              <label>เวลาที่ตรวจพบ</label>
              <span className="threat-modal-text-with-icon">
                <Clock size={14} />
                {formatDate(log.timestamp)}
              </span>
            </div>

            <div className="threat-modal-field">
              <label>ผู้ส่ง</label>
              <span className="threat-modal-text-with-icon" title={log.senderId || undefined}>
                <User size={14} />
                {log.senderName}
                {log.senderId && <small className="sender-id">({log.senderId.slice(-8)})</small>}
              </span>
            </div>

            <div className="threat-modal-field">
              <label>กลุ่ม LINE</label>
              <span className="threat-modal-text-with-icon">
                <Users size={14} />
                {log.lineGroupName || 'แชทส่วนตัว (Private)'}
              </span>
            </div>
          </div>

          {/* กล่องข้อความเต็ม */}
          <div className="threat-modal-message-box">
            <div className="threat-modal-message-header">
              <label>ข้อความทั้งหมดที่ระบบตรวจพบ ({isImage ? 'ข้อความจากรูปภาพ' : isLink ? 'ลิงก์เว็บไซต์' : 'ข้อความแชท'})</label>
              <button
                type="button"
                className="threat-modal-copy-btn"
                onClick={handleCopy}
              >
                {copied ? <Check size={14} color="#138568" /> : <Copy size={14} />}
                {copied ? 'คัดลอกแล้ว' : 'คัดลอกข้อความ'}
              </button>
            </div>
            <div className="threat-modal-message-content">
              {displayText || '(ไม่พบเนื้อหาข้อความ)'}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="threat-modal-footer">
          <button type="button" className="threat-modal-btn" onClick={onClose}>
            ปิด
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalJSX, document.body);
}
