// =============================================
// Senior Guard — Utility Functions
// =============================================

import type { RiskLevel } from '../types';

/**
 * แปลง ISO timestamp เป็นรูปแบบวันที่ไทย
 * เช่น "20 ส.ค. 2569, 14:30"
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('th-TH', {
    timeZone: 'Asia/Bangkok',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * จัดรูปแบบตัวเลขด้วย comma
 * เช่น 12345 -> "12,345"
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('th-TH');
}

/**
 * คืนค่า label ภาษาไทยสำหรับระดับความเสี่ยง
 */
export function getRiskLabel(level: RiskLevel): string {
  switch (level) {
    case 'high':
      return 'สูง';
    case 'medium':
      return 'ปานกลาง';
    case 'low':
      return 'ต่ำ';
    default:
      return 'ไม่ระบุ';
  }
}

/**
 * คืนค่า label ภาษาไทยสำหรับหมวดหมู่สแกม
 */
export function getCategoryLabel(category: string): string {
  const map: Record<string, string> = {
    phishing: 'ฟิชชิง',
    investment_scam: 'หลอกลงทุน',
    romance_scam: 'หลอกรัก',
    lottery_scam: 'หลอกถูกรางวัล',
    impersonation: 'แอบอ้าง',
    loan_scam: 'หลอกกู้เงิน',
    other: 'อื่นๆ',
  };
  return map[category] || category;
}

/**
 * ตัดข้อความยาวเกินไป
 */
export function truncateText(text: string, maxLength: number = 80): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '…';
}
const URL_PATTERN = /(?:https?:\/\/|www\.)\S+/i;

/**
 * แยกประเภทข้อความและดึงเนื้อหาที่อ่านได้ (กรณีเป็นรูปภาพ OCR หรือลิงก์ URL)
 * รับ: message (ข้อความดิบ), messageType (ประเภท 'text' | 'image' | 'link' ถ้ามี)
 * ทำ: 
 *   - ตรวจว่ามี prefix '[รูปภาพ]' หรือเป็น image หรือไม่ ถ้ามีให้ตัด prefix ออก
 *   - ตรวจว่ามี URL/ลิงก์ หรือไม่ เพื่อจัดประเภทเป็น 'link'
 * คืน: { isImage: boolean, isLink: boolean, displayText: string }
 * ถ้าพัง: คืนข้อความเดิมเป็น text
 */
export function parseImageMessage(
  message: string,
  messageType?: 'text' | 'image' | 'link'
): { isImage: boolean; isLink: boolean; displayText: string } {
  if (!message) {
    return {
      isImage: messageType === 'image',
      isLink: messageType === 'link',
      displayText: '',
    };
  }

  const trimmed = message.trim();
  const hasImagePrefix = trimmed.startsWith('[รูปภาพ]');
  const isImage = messageType === 'image' || hasImagePrefix;

  if (hasImagePrefix) {
    const ocrText = trimmed.slice('[รูปภาพ]'.length).trim();
    return {
      isImage: true,
      isLink: false,
      displayText: ocrText || '(รูปภาพ - ไม่พบข้อความ)',
    };
  }

  if (isImage && !trimmed) {
    return {
      isImage: true,
      isLink: false,
      displayText: '(รูปภาพ - ไม่พบข้อความ)',
    };
  }

  const isLink = messageType === 'link' || URL_PATTERN.test(trimmed);

  return {
    isImage: false,
    isLink,
    displayText: message,
  };
}
