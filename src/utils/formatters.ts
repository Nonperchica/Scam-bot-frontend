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
 * คืนค่าสี CSS ตามระดับความเสี่ยง
 */
export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case 'high':
      return 'var(--color-risk-high)';
    case 'medium':
      return 'var(--color-risk-medium)';
    case 'low':
      return 'var(--color-risk-low)';
    default:
      return 'var(--color-text-secondary)';
  }
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
