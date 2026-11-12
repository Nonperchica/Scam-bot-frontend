# Eh?Bot Frontend

หน้าเว็บของ Eh?Bot บอต LINE ตรวจข้อความเสี่ยงหลอกลวงภาษาไทย มี 2 ส่วนในแอปเดียว

- **Admin Dashboard** (`/overview`, `/line-groups`, `/risky-messages`, `/dataset`): ผู้ดูแลดูสถิติ ข้อความเสี่ยง กลุ่ม LINE และตรวจทานชุดข้อมูล เข้าด้วยรหัส `DASHBOARD_API_TOKEN`
- **LINE Mini App** (`/mini/result`): ผู้ใช้เปิดจากปุ่ม "ดูรายละเอียด" ในการ์ดผลตรวจ ยืนยันตัวตนด้วย LIFF แล้วดูผลตรวจ ประวัติ และบทเรียนของตนเอง (`/mini` คือโหมดตัวอย่างที่ใช้ข้อมูลสมมติ)

บอตและ API ของ Mini App อยู่ใน repo แยก (`scam-bot-backend`) ส่วน Dashboard API อยู่ใน `backend/` ของ repo นี้

## Tech stack

- React + TypeScript + Vite, React Router, Recharts, Lucide icons
- `backend/`: FastAPI อ่านตาราง `detection_logs` และ `line_sources` ของบอตจาก Supabase แบบอ่านอย่างเดียว และคิวตรวจทาน Dataset

## โครงสร้าง

```
src/
├── pages/, components/, layouts/   Admin Dashboard
├── mini/                           LINE Mini App (ดู src/mini/README.md)
├── services/api.ts                 เรียก Dashboard API พร้อมรหัสเข้าใช้งาน
├── ehbot.css, index.css            สไตล์ Dashboard (ehbot.css โหลดทีหลังและเป็นค่าที่ใช้จริง)
backend/
├── main.py                         FastAPI + CORS
├── routers/dashboard.py            สถิติ ข้อความเสี่ยง กลุ่ม รายงานรายวัน (ต้องมีรหัส)
├── routers/dataset.py              คิวตรวจทานและบันทึกตัวอย่างเข้า scam_dataset
└── live_data.py                    รวมข้อมูลจากตารางของบอต
tests/                              tests ของ Mini App และเกณฑ์อ่านง่ายของ Dashboard
```

## รันในเครื่อง

```powershell
npm install
npm run dev
```

Dashboard API (ต้องมี `backend/.venv` และ `backend/.env` ตาม `backend/.env.example`):

```powershell
npm run backend
```

Vite ส่ง `/api/mini` ไปบอตที่พอร์ต 8001 และ `/api` อื่นไป Dashboard API ที่พอร์ต 8000 ค่าตั้งต้นของหน้าเว็บดู `.env.example`

## ทดสอบ

```powershell
node --test tests/mini.test.mjs tests/dashboard-style.test.mjs
npx tsc -p tsconfig.app.json --noEmit
npx eslint .
```

Backend (จากโฟลเดอร์ `backend/`):

```powershell
.\.venv\Scripts\python.exe -B -m unittest discover -s tests
```

tests ใช้บริการจำลอง ไม่เรียก Supabase, Gemini หรือ LINE จริง

## เอกสารเพิ่มเติม

- `DESIGN.md`, `UX-CONTRACT.md`: ดีไซน์และข้อตกลงของ Mini App
- `src/mini/README.md`, `src/mini/LIVE_CASES.md`: การทำงานและการตั้งค่า Mini App
- `backend/LIVE_DASHBOARD.md`, `backend/DATASET_SETUP.md`: ตั้งค่า Dashboard API และตาราง Dataset
- `DATASET_API.md`: สัญญา API ของหน้า Dataset
