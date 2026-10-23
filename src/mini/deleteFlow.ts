// ขั้นตอนปุ่ม "ลบประวัติทั้งหมด" แยกเป็นฟังก์ชันล้วน เพื่อทดสอบได้โดยไม่ต้องคลิกจริง
export type DeleteState =
  | { step: 'idle' }
  | { step: 'confirm' }
  | { step: 'deleting' }
  | { step: 'done'; deleted: number }
  | { step: 'error'; error: string };

export type DeleteAction =
  | { type: 'ask' }
  | { type: 'cancel' }
  | { type: 'start' }
  | { type: 'success'; deleted: number }
  | { type: 'fail'; error: string };

export function nextDeleteStep(state: DeleteState, action: DeleteAction): DeleteState {
  // ระหว่างกำลังลบ ไม่รับการกดซ้ำหรือยกเลิก กันการส่งคำขอลบสองครั้ง
  if (state.step === 'deleting') {
    if (action.type === 'success') return { step: 'done', deleted: action.deleted };
    if (action.type === 'fail') return { step: 'error', error: action.error };
    return state;
  }
  if (action.type === 'ask') return { step: 'confirm' };
  if (state.step === 'confirm' && action.type === 'cancel') return { step: 'idle' };
  // เริ่มลบได้เฉพาะหลังกดยืนยันแล้วเท่านั้น
  if (state.step === 'confirm' && action.type === 'start') return { step: 'deleting' };
  return state;
}

export function deleteMessage(state: DeleteState): string {
  if (state.step === 'done') return `ลบประวัติแล้ว ${state.deleted} รายการ`;
  if (state.step === 'error') return state.error;
  return '';
}
