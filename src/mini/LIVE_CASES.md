# เปิดผลเดิมจาก LINE — รอบเชื่อมเคสจริง

สถานะล่าสุด 17 ตุลาคม 2569: ผู้ใช้ยืนยันว่าเปิดผลจริงจากแชต LINE ได้แล้ว
และ Rich Menu เปิดหน้าบทเรียน/วิธีใช้ถูกต้อง ข้อความเปิดเคสไม่ได้แสดงทันทีบนการ์ด
ไม่ต้องกดดูรายละเอียด เทสต์ Mini App ผ่าน 13 ข้อและ build ผ่าน
เคสอ่านจาก `detection_logs` ใน Supabase จึงเปิดได้ตลอดจนกว่าผู้ใช้จะกดลบ (ไม่หมดอายุ 15 นาทีแล้ว)
หน้าประวัติแสดงประวัติแชตส่วนตัว 50 รายการล่าสุดของบัญชีที่ login

## หน้าที่ของไฟล์

| ไฟล์ / ฟังก์ชัน | รับอะไร → ทำอะไร → คืนอะไร | ถ้าพัง |
|---|---|---|
| `services/miniLiff.ts` / `initializeMiniLiff()` | อ่าน `VITE_MINI_LIFF_ID` → โหลด LIFF SDK 2.31.1 จาก LINE CDN และ init → คืน SDK ที่เริ่มแล้ว | แสดงข้อความตั้งค่า/เครือข่าย; การเรียกพร้อมกันใช้ Promise เดียว |
| `services/miniLiff.ts` / `miniLoginTarget(currentUrl, liffId, caseId)` | เลือก URL เข้าสู่ระบบ: localhost/HTTP → เปิด LIFF HTTPS ก่อน; HTTPS จริง → ใช้หน้าเดิมพร้อม case | ตรวจ ID ไม่ให้แทรก query; ตัด query อื่นและ hash ไม่ส่ง token ต่อในลิงก์ |
| `services/miniApi.ts` / `fetchMiniCase()` | caseId + ID token + AbortSignal → GET `/api/mini/cases/{id}` พร้อม Authorization header → ตรวจโครงสร้างด้วย `isMiniCaseData()` และ ID → คืน `MiniCaseData` | ได้ 404 จะลองใหม่ 2 ครั้ง (รอ 1 และ 2 วินาที) เพราะบอตอาจยังบันทึกเคสไม่เสร็จ; ยัง 404 แจ้ง “เคสอาจถูกลบ หรือไม่ใช่เคสของบัญชีนี้”; 401 ให้เปิด LINE ใหม่; JSON เสียไม่แสดงผล |
| `services/miniApi.ts` / `fetchMiniHistory()` | ID token + AbortSignal → GET `/api/mini/history` → กรองทีละรายการด้วย `isMiniHistoryItem()` → คืน `MiniHistoryItem[]` | รายการที่ผิดรูปแบบถูกตัดทิ้งเฉพาะรายการนั้น ทั้งหน้าไม่พัง; 401 ให้เปิด LINE ใหม่ |
| `services/miniApi.ts` / `deleteMiniHistory()` | ID token → DELETE `/api/mini/history` → คืนจำนวนที่ลบ (`deleted`) | 401 ให้เปิด LINE ใหม่; อื่น ๆ แจ้งลบไม่สำเร็จ |
| `services/useMiniSession.ts` / `deleteHistory()`, `reloadHistory()` | เรียก `deleteMiniHistory()` แล้วล้างรายการในหน้าและยกเลิกคำขอประวัติที่ค้าง | error ส่งต่อให้ `MiniSettings` แสดง |
| `services/useMiniSession.ts` / `useMiniSession(live, caseId)` | เริ่ม LIFF → อ่าน case หลัง init → ถ้ายังไม่ login แสดงปุ่ม → ถ้า login แล้วโหลดผลเดิม และแชร์ผ่าน Outlet | ยกเลิกคำขอเมื่อเปลี่ยนเคสหรือรอเกิน 30 วินาที; ไม่เปิดผลเก่าระหว่างเปลี่ยนเคส |
| `pages/MiniLiveEntry.tsx` | URL ไม่มี case → หน้าประวัติดีไซน์ใหม่; มี case → รายละเอียดของเคสนั้น | เปิด LIFF เปล่า ๆ ได้โดยไม่ขึ้นว่ารหัสเคสผิด |
| `pages/MiniLiveDetail.tsx` | อ่าน session จาก Outlet → แสดงผลเดิมหรือการ์ดสถานะในดีไซน์เดียวกัน | มีมาสคอตและเมนูครบแม้กำลังโหลดหรือเปิดไม่ได้ |
| `components/MiniSessionNotice.tsx` | loading/login/error → การ์ดมาสคอต guide/inspect และปุ่มที่ตรงสถานะ | ข้อความ error แสดงทันทีด้วย role=alert พร้อมปุ่มลองอีกครั้ง |
| `components/MiniCaseDetail.tsx` | รับ `detectionCase` + `live` → แสดงการ์ด มาสคอต ข้อความ และคำแนะนำ → JSX | รับเฉพาะข้อมูลที่ผ่านการตรวจรูปแบบแล้ว ไม่ render HTML จากข้อความ |
| `pages/MiniDetail.tsx` | caseId ของตัวอย่าง → find ใน `sampleCases` → ใช้การ์ดร่วมกัน | ไม่พบไม่แทนด้วยเคสแรก |
| `MiniLayout.tsx` | หัวหน้าและเมนูร่วมดีไซน์ 8 ท่า → แยกเส้นทางจริงไว้ใต้ `/mini/result` | เมนูส่งต่อรหัสเคสและไม่พาไปข้อมูลตัวอย่าง |
| `App.tsx` | เพิ่ม `/mini/result` นอกระบบรหัส Dashboard | หน้า Mini App ใช้ LINE Login แยกจากผู้ดูแล |
| `mini.css` | เก็บธีมเดิม เพิ่มการตัดข้อความยาวในผลจริง | รองรับข้อความ URL ยาวโดยไม่ดันจอแนวนอน |
| `vite.config.ts` | `/api/mini` → Bot API พอร์ต 8001; `/api` อื่น → Dashboard 8000 | ตั้งพอร์ตผิดจะโหลดไม่ได้ ต้องแก้ให้ตรงบริการ |

### ฝั่ง backend (repo `scam-bot-backend` แยกจาก frontend)

| ไฟล์ / ฟังก์ชัน | รับอะไร → ทำอะไร → คืนอะไร | ถ้าพัง |
|---|---|---|
| `mini_api.py` / `verify_line_owner()` | header `Authorization: Bearer <ID token>` → ส่งให้ LINE ตรวจ แล้วเช็ก `iss`, `aud`, `exp` → คืน `sub` (รหัสผู้ใช้ LINE) | token ผิด/หมดอายุ 401; ติดต่อ LINE ไม่ได้ 503 โดยไม่ส่ง error ดิบกลับ |
| `mini_api.py` / `create_mini_router()` | สร้าง 3 endpoint: GET/DELETE `/api/mini/history`, GET `/api/mini/cases/{id}` ทุกตัวเรียก `verify_line_owner()` ก่อน | เคสไม่มี/ถูกลบ/ไม่ใช่เจ้าของ ตอบ 404 ข้อความเดียวกัน; ฐานข้อมูลล่ม 503 |
| `mini_history.py` / `list_cases(owner)` | กรอง `detection_logs` ตามเจ้าของ แชตส่วนตัว และ 3 สถานะ → คืน 50 รายการล่าสุด (มีแค่หัวข้อ ไม่มีข้อความเต็ม) | Supabase ขัดข้องกลายเป็น `HistoryUnavailable` |
| `mini_history.py` / `get_case(case_hex, owner)` | รหัส 32 ตัว + เจ้าของ → อ่านแถวเดียว → `build_case_detail()` | รหัสผิดรูปแบบคืน `None` โดยไม่ถามฐานข้อมูล |
| `mini_history.py` / `delete_all(owner)` | ลบทุกแถวแชตส่วนตัวของเจ้าของ → คืนจำนวนที่ผู้ใช้เห็นในหน้าประวัติ | ไม่แตะข้อความในกลุ่ม |
| `learning.py` / `case_category(text)` | ข้อความ → มี `http://`, `https://` หรือ `www.` คืน `link` ไม่มีคืน `message` | ใช้เลือกไอคอนเท่านั้น ไม่ได้ตัดสินความเสี่ยง; ลิงก์แบบ `bit.ly/abc` ที่ไม่มี http/www ยังนับเป็น `message` |

`useMiniSession()` เปรียบเทียบรหัสใน state กับรหัสที่กำลังเปิด หากไม่ตรงจะคืนสถานะกำลังโหลด
โดยไม่คืนรายละเอียดเก่า เมนูใช้ `miniHref()` สร้างลิงก์พร้อมรหัสเดิม ทุกเส้นทางจริงอยู่ใต้
Endpoint `/mini/result` เพื่อให้เรียก LIFF SDK ได้แม้ reload หน้าลูก

หน้าหลัก `/mini/result` ไม่มี case แสดงแบนเนอร์ wave, การ์ดมิ้นต์ think และเมนูครบ
หน้าประวัติ `/mini/result/history` โหลดรายการด้วย `fetchMiniHistory()` ผ่าน `useMiniSession()`
ไม่อ้างว่าอ่านประวัติทั้งหมด หน้าเรียนรู้ใช้ book, วิธีใช้ใช้ guide, บัญชีใช้ heart
รายละเอียดเลือก alert/calm/inspect ตามผลเดิม ส่วนสถานะโหลดและผิดพลาดยังใช้โครงชุดเดียวกัน

## อธิบายในงานนำเสนอ

“ปุ่มของ LINE ส่งเฉพาะรหัสสุ่มมาให้หน้าเว็บ ส่วน `initializeMiniLiff()` เริ่มระบบ LINE
เพื่อรับ ID token เว็บส่ง token ให้ `fetchMiniCase()` แนบทาง header Backend ตรวจ token กับ LINE
แล้วใช้ user ID ที่ตรวจแล้วค้นแถวของเจ้าของใน `detection_logs` ด้วย `mini_history.get_case()` จึงคืนผลเดิมมาแสดงด้วย `MiniCaseDetail`
การเปิดหน้านี้ไม่มีการตรวจ AI ซ้ำ และไม่ถือว่าคำที่เลือกมาเป็นหัวข้อเรียนรู้ยืนยันการหลอกลวง”

ไม่ใช้ `liff.getProfile()` หรือ user ID ที่เบราว์เซอร์ส่งเองเป็นหลักฐานว่าเป็นเจ้าของ
token ไม่ถูกคัดลอกลง localStorage/sessionStorage ของแอป ไม่แนบใน URL ไม่ใช้รหัส Dashboard
(ตัว SDK จัดการ session ของ LINE ตามปกติ)

## ตั้งค่า

สร้าง `.env.local` ที่ราก frontend แล้วตั้ง `VITE_MINI_LIFF_ID` และ `VITE_MINI_API_BASE_URL`
ตาม `.env.example` ตัวหลังเป็น origin ของ **Bot API** ไม่ใช่ Dashboard API
ให้เว้นว่างเมื่อใช้ same-origin reverse proxy; Vite ในเครื่องมี proxy แล้ว

LINE Developers ต้องตั้ง Endpoint URL เป็น `https://โดเมนเว็บจริง/mini/result`
เลือก scope `openid` และใช้ LINE Login ภายใต้ Provider เดียวกับบอต
origin ของเว็บต้องตรง `MINI_WEB_ORIGIN` ใน `.env` บอตเมื่อใช้ API คนละโดเมน
เพิ่ม `MINI_WEB_ORIGIN` ใน `.env.local` ของ frontend ด้วยเมื่อใช้ dev tunnel เพื่อให้ Vite
รับเฉพาะ hostname นั้น ไม่ใช้ `allowedHosts: true` หาก URL Tunnel เปลี่ยนต้องแก้ค่าและ Endpoint URL ให้ตรง
LIFF ID ต้องตรง `MINI_LIFF_ID` ของบอต ส่วน `LINE_LOGIN_CHANNEL_ID` เป็น ID ของ LINE Login

เว็บที่ deploy ต้องคืน `index.html` สำหรับการเปิด `/mini/result` โดยตรง
อย่าใส่ secret ในตัวแปร `VITE_`; ค่าจะถูกรวมในไฟล์ JavaScript สาธารณะ
หลังตั้งค่าให้ restart Vite / build เว็บใหม่ และ restart บอต (เคสเก่าไม่หาย เพราะเก็บใน Supabase)

## ผลตรวจในเครื่อง 28 ตุลาคม 2569 (หลังลง Windows ใหม่)

- `npm run test:mini`: ผ่าน 34 tests (จำลอง LIFF/เครือข่าย)
- backend `pytest tests`: ผ่าน 294 tests รวมเทสต์ใหม่ของ `case_category()` (ใช้ Supabase จำลอง)
- ยังไม่ได้ทดสอบซ้ำกับ LINE จริงบนเครื่องใหม่ เพราะยังไม่ได้ตั้ง `.env.local` และ `.env` ของบอต

## ผลตรวจในเครื่อง 16 ตุลาคม 2569 (บันทึกเดิม)

- `npm.cmd run test:mini`: 12 tests จำลองเครือข่าย/LIFF ผ่าน รวม token header,
  401/404/503, JSON เสีย, เคสคนละ ID, abort, render เหตุผล/คำแนะนำ, escape HTML
  การคงดีไซน์มาสคอต/เมนูพร้อมส่งรหัสเคสในหน้าจริงทั้ง 5 หน้า และ Login จาก localhost/HTTPS
- `npm.cmd run build`: ผ่าน มีคำเตือน bundle รวม Dashboard เกิน 500 kB
- `npm.cmd run lint -- --ignore-pattern 'backend/**'`: ผ่าน
- ตรวจ browser: หน้าแรก wave/think, เรียนรู้ book, บัญชี heart, วิธีใช้ guide; ขนาดจอ 320/390
  และตัวอักษรใหญ่ไม่ล้นแนวนอน รูปโหลดครบ
- ตั้งค่า LIFF ID และ Channel ID ที่ผู้ใช้ให้แล้ว; ผู้ใช้เปลี่ยน URL Tunnel ต้องแก้ `.env.local`, `.env` บอต และ Endpoint URL ใน LINE ให้ตรงทุกครั้ง
- Bot API พอร์ต 8001 ยังเป็น process เดิมที่ตอบ 503 ว่ายังไม่ตั้งค่า LINE ต้อง restart เพื่ออ่าน environment ใหม่
- ยังไม่ยืนยันการ Login/redirect จริงบนมือถือ LINE และการเปิดเคสจาก webhook จริง
- tests เป็นระบบจำลอง ไม่ใช่ผลบริการ LINE จริงหรือการวัดความแม่นยำ AI

เคสจริงอยู่ใน Supabase ไม่หายเมื่อบอตรีสตาร์ต; ผู้ใช้กดลบในหน้าบัญชีแล้วแถวถูกลบจริง (ตัวเลข Dashboard ลดตาม)
ส่วนหน้าประวัติ `/mini` และเมนูตัวอย่างอื่นยังเป็นข้อมูลสมมติตามป้ายบนหน้า

อ้างอิง [LIFF กับการใช้ข้อมูลบน server](https://developers.line.biz/en/docs/liff/using-user-profile/)
และ [LIFF URL/redirect](https://developers.line.biz/en/docs/liff/opening-liff-app/)
