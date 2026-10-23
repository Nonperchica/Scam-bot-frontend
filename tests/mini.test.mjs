// ใช้ Vite แปลง TypeScript จริง; จำลองเฉพาะเครือข่ายและ LIFF ไม่ใช้ token จริง
import assert from 'node:assert/strict';
import { after, afterEach, before, mock, test } from 'node:test';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom';

let server;
let api;
let MiniCaseDetail;
let MiniSessionNotice;
let App;
const caseId = 'a'.repeat(32);
const detail = {
  id: caseId, title: 'เคสทดสอบ', category: 'message', message: 'ส่ง OTP มา',
  receivedAt: '2026-10-16T08:00:00Z', status: 'risk_found', reason: 'เหตุผลจากผลเดิม',
  lessonId: 'otp', warningPoints: [{ icon: 'user', title: 'พบคำว่า OTP', description: 'คำที่พบไม่ใช่หลักฐานยืนยัน' }],
  nextSteps: ['อย่าส่งรหัส', 'ตรวจผ่านช่องทางทางการ'],
};

before(async () => {
  server = await createServer({ configFile: false, envDir: false, plugins: [react()],
    server: { middlewareMode: true }, appType: 'custom',
    define: { 'import.meta.env.VITE_MINI_LIFF_ID': JSON.stringify('1234567890-TestApp') },
  });
  api = await server.ssrLoadModule('/src/mini/services/miniApi.ts');
  MiniCaseDetail = (await server.ssrLoadModule('/src/mini/components/MiniCaseDetail.tsx')).default;
  MiniSessionNotice = (await server.ssrLoadModule('/src/mini/components/MiniSessionNotice.tsx')).default;
  App = (await server.ssrLoadModule('/src/App.tsx')).default;
});
afterEach(() => mock.restoreAll());
after(async () => { await server?.close(); });

test('ส่ง token ใน header เท่านั้นและรับผลของรหัสที่ขอ', async () => {
  const fetch = mock.method(globalThis, 'fetch', async () => Response.json(detail));
  assert.deepEqual(await api.fetchMiniCase(caseId, 'offline-id-token', new AbortController().signal), detail);
  const [url, options] = fetch.mock.calls[0].arguments;
  assert.equal(url, `/api/mini/cases/${caseId}`);
  assert.equal(options.headers.Authorization, 'Bearer offline-id-token');
  assert.equal(options.cache, 'no-store');
  assert.equal(options.credentials, 'omit');
  assert.equal(options.redirect, 'error');
  assert.equal(options.referrerPolicy, 'no-referrer');
});

test('เคสเปิดไม่ได้ไม่คืนตัวอย่างหรือข้อความดิบจาก server', async () => {
  for (const code of [401, 404, 503]) {
    mock.method(globalThis, 'fetch', async () => new Response('INTERNAL_SECRET', { status: code }));
    await assert.rejects(api.fetchMiniCase(caseId, 'offline', new AbortController().signal, 0), error => {
      assert.doesNotMatch(error.message, /INTERNAL_SECRET/);
      assert.match(error.message, code === 404 ? /ถูกลบ/ : code === 401 ? /เข้าสู่ระบบ/ : /ลองใหม่/);
      return true;
    });
    mock.restoreAll();
  }
});

const historyItem = { id: caseId, title: 'เคสทดสอบ', category: 'message', receivedAt: '2026-10-16T08:00:00Z', status: 'risk_found' };

test('ประวัติส่ง token ใน header และตัดรายการผิดรูปแบบทิ้ง', async () => {
  const fetch = mock.method(globalThis, 'fetch', async () => Response.json({ cases: [historyItem, { id: 'bad' }] }));
  const items = await api.fetchMiniHistory('offline-id-token', new AbortController().signal);
  assert.deepEqual(items, [historyItem]);
  const [url, options] = fetch.mock.calls[0].arguments;
  assert.equal(url, '/api/mini/history');
  assert.equal(options.headers.Authorization, 'Bearer offline-id-token');
  assert.equal(options.cache, 'no-store');
  assert.equal(options.credentials, 'omit');
  assert.equal(options.redirect, 'error');
  assert.equal(options.referrerPolicy, 'no-referrer');
});

test('ประวัติว่างคืน array ว่าง', async () => {
  mock.method(globalThis, 'fetch', async () => Response.json({ cases: [] }));
  assert.deepEqual(await api.fetchMiniHistory('offline', new AbortController().signal), []);
});

test('ลบประวัติใช้ DELETE และคืนจำนวน', async () => {
  const fetch = mock.method(globalThis, 'fetch', async () => Response.json({ deleted: 3 }));
  assert.equal(await api.deleteMiniHistory('offline-id-token'), 3);
  const [url, options] = fetch.mock.calls[0].arguments;
  assert.equal(url, '/api/mini/history');
  assert.equal(options.method, 'DELETE');
  assert.equal(options.headers.Authorization, 'Bearer offline-id-token');
});

test('ลบหรือโหลดประวัติล้มเหลวใช้ข้อความผู้ใช้เข้าใจ', async () => {
  mock.method(globalThis, 'fetch', async () => new Response('INTERNAL_SECRET', { status: 503 }));
  for (const call of [() => api.fetchMiniHistory('offline', new AbortController().signal), () => api.deleteMiniHistory('offline')]) {
    await assert.rejects(call(), error => {
      assert.doesNotMatch(error.message, /INTERNAL_SECRET/);
      assert.match(error.message, /ลองใหม่/);
      return true;
    });
  }
});

test('เปิดเคสได้ 404 แล้วลองใหม่หนึ่งครั้ง', async () => {
  const responses = [new Response('', { status: 404 }), Response.json(detail)];
  const fetch = mock.method(globalThis, 'fetch', async () => responses.shift());
  assert.deepEqual(await api.fetchMiniCase(caseId, 'offline', new AbortController().signal, 0), detail);
  assert.equal(fetch.mock.calls.length, 2);
});

test('404 สองครั้งยังลองต่ออีกครั้งเพราะบอตอาจบันทึกช้า', async () => {
  const responses = [new Response('', { status: 404 }), new Response('', { status: 404 }), Response.json(detail)];
  const fetch = mock.method(globalThis, 'fetch', async () => responses.shift());
  assert.deepEqual(await api.fetchMiniCase(caseId, 'offline', new AbortController().signal, 0), detail);
  assert.equal(fetch.mock.calls.length, 3);
});

test('404 สามครั้งจึงแสดงว่าเปิดไม่ได้', async () => {
  const fetch = mock.method(globalThis, 'fetch', async () => new Response('', { status: 404 }));
  await assert.rejects(api.fetchMiniCase(caseId, 'offline', new AbortController().signal, 0), /ถูกลบ/);
  assert.equal(fetch.mock.calls.length, 3);
});

function renderWithContext(Component, context) {
  return renderToStaticMarkup(React.createElement(MemoryRouter, null,
    React.createElement(Routes, null,
      React.createElement(Route, { element: React.createElement(Outlet, { context }) },
        React.createElement(Route, { index: true, element: React.createElement(Component) })))));
}

function liveContext(overrides = {}) {
  return { live: true, loading: false, error: undefined, needsLogin: false, retry: () => {},
    history: [], historyLoading: false, historyError: '', reloadHistory: () => {},
    deleteHistory: async () => 0, canReturnToLine: false, returnToLine: () => {},
    miniHref: (page, id) => (page === 'detail' ? `/mini/result?case=${id}` : `/mini/result/${page}`),
    largeText: false, setLargeText: () => {}, ...overrides };
}

test('หน้าประวัติจริงแสดงหลายเคสและลิงก์ไปเคสของแต่ละรายการ', async () => {
  const MiniHistory = (await server.ssrLoadModule('/src/mini/pages/MiniHistory.tsx')).default;
  const other = { ...historyItem, id: 'b'.repeat(32), title: 'เคสที่สอง', status: 'uncertain' };
  const markup = renderWithContext(MiniHistory, liveContext({ history: [historyItem, other] }));
  assert.match(markup, new RegExp(`href="/mini/result\\?case=${caseId}"`));
  assert.match(markup, new RegExp(`href="/mini/result\\?case=${'b'.repeat(32)}"`));
  assert.match(markup, /เคสที่สอง/);
  assert.match(markup, /2 รายการ/);
});

test('หน้าประวัติจริงไม่มีหมายเหตุ 15 นาที', async () => {
  const MiniHistory = (await server.ssrLoadModule('/src/mini/pages/MiniHistory.tsx')).default;
  const markup = renderWithContext(MiniHistory, liveContext({ history: [historyItem] }));
  assert.doesNotMatch(markup, /15 นาที|เคสที่เปิดครั้งนี้/);
});

test('ไม่มีประวัติแสดงชวนส่งข้อความ', async () => {
  const MiniHistory = (await server.ssrLoadModule('/src/mini/pages/MiniHistory.tsx')).default;
  const markup = renderWithContext(MiniHistory, liveContext());
  assert.match(markup, /ยังไม่มีประวัติการตรวจ/);
  assert.match(markup, /inspect\.png/);
});

test('โหลดประวัติไม่สำเร็จแสดงข้อความและปุ่มลองใหม่', async () => {
  const MiniHistory = (await server.ssrLoadModule('/src/mini/pages/MiniHistory.tsx')).default;
  const markup = renderWithContext(MiniHistory, liveContext({ historyError: 'ระบบยังโหลดประวัติไม่ได้ กรุณาลองใหม่ภายหลัง' }));
  assert.match(markup, /role="alert"[^>]*>ระบบยังโหลดประวัติไม่ได้/);
  assert.match(markup, /ลองอีกครั้ง/);
  assert.doesNotMatch(markup, /ยังไม่มีประวัติการตรวจ/);
});

test('ลบต้องกดยืนยันก่อนเรียก API และยกเลิกได้', async () => {
  const { nextDeleteStep } = await server.ssrLoadModule('/src/mini/deleteFlow.ts');
  const idle = { step: 'idle' };
  const confirm = nextDeleteStep(idle, { type: 'ask' });
  assert.equal(confirm.step, 'confirm');
  assert.equal(nextDeleteStep(idle, { type: 'start' }).step, 'idle');
  assert.equal(nextDeleteStep(confirm, { type: 'cancel' }).step, 'idle');
});

test('กดยืนยันซ้ำระหว่างกำลังลบไม่เริ่มลบรอบใหม่', async () => {
  const { nextDeleteStep } = await server.ssrLoadModule('/src/mini/deleteFlow.ts');
  const deleting = nextDeleteStep({ step: 'confirm' }, { type: 'start' });
  assert.equal(deleting.step, 'deleting');
  assert.equal(nextDeleteStep(deleting, { type: 'start' }), deleting);
  assert.equal(nextDeleteStep(deleting, { type: 'cancel' }), deleting);
});

test('ลบสำเร็จแสดงจำนวน และล้มเหลวลองใหม่ได้', async () => {
  const { nextDeleteStep, deleteMessage } = await server.ssrLoadModule('/src/mini/deleteFlow.ts');
  const done = nextDeleteStep({ step: 'deleting' }, { type: 'success', deleted: 3 });
  assert.equal(deleteMessage(done), 'ลบประวัติแล้ว 3 รายการ');
  const failed = nextDeleteStep({ step: 'deleting' }, { type: 'fail', error: 'ระบบยังลบประวัติไม่ได้' });
  assert.equal(deleteMessage(failed), 'ระบบยังลบประวัติไม่ได้');
  assert.equal(nextDeleteStep(failed, { type: 'ask' }).step, 'confirm');
});

test('หน้าบัญชีจริงมีปุ่มลบประวัติ หน้าตัวอย่างไม่มี', async () => {
  const MiniSettings = (await server.ssrLoadModule('/src/mini/pages/MiniSettings.tsx')).default;
  assert.match(renderWithContext(MiniSettings, liveContext({ signedIn: true })), /ลบประวัติทั้งหมด/);
  assert.doesNotMatch(renderWithContext(MiniSettings, liveContext({ live: false })), /ลบประวัติทั้งหมด/);
});

test('FAQ และหน้าบัญชีไม่อ้าง 15 นาทีแล้ว', () => {
  for (const path of [`/mini/result/help?case=${caseId}`, `/mini/result/settings?case=${caseId}`, '/mini/help']) {
    assert.doesNotMatch(renderPage(path), /15 นาที/);
  }
});

test('ข้อความเคสหมดอายุแสดงทันทีโดยไม่ต้องกดดูรายละเอียด', () => {
  const error = 'เคสอาจหมดอายุ บอตรีสตาร์ต หรือไม่ใช่เคสของคุณ กรุณาส่งข้อความมาตรวจใหม่ในแชตเดิม';
  const session = { loading: false, error, needsLogin: false, retry: () => {} };
  const markup = renderToStaticMarkup(React.createElement(MemoryRouter, null,
    React.createElement(Routes, null,
      React.createElement(Route, { element: React.createElement(Outlet, { context: session }) },
        React.createElement(Route, { index: true, element: React.createElement(MiniSessionNotice) })))));
  assert.match(markup, /role="alert"[^>]*>เคสอาจหมดอายุ/);
  assert.match(markup, /กรุณาส่งข้อความมาตรวจใหม่ในแชตเดิม/);
  assert.doesNotMatch(markup, /<details|ดูรายละเอียด/);
});

test('ผลของเคสอื่นและโครงสร้างที่ไม่ถูกต้องแสดงไม่ได้', async () => {
  for (const invalid of [{ ...detail, id: 'b'.repeat(32) }, { ...detail, status: 'safe' },
    { ...detail, warningPoints: [{ icon: 'unknown', title: 'bad', description: '' }] },
    { ...detail, receivedAt: 'invalid' }, { ...detail, nextSteps: [] }]) {
    mock.method(globalThis, 'fetch', async () => Response.json(invalid));
    await assert.rejects(api.fetchMiniCase(caseId, 'offline', new AbortController().signal), /ข้อมูลผลตรวจไม่สมบูรณ์/);
    mock.restoreAll();
  }
});

test('JSON เสียและเครือข่ายล้มเหลวใช้ข้อความที่ผู้ใช้เข้าใจ', async () => {
  mock.method(globalThis, 'fetch', async () => new Response('NOT_JSON_SECRET'));
  await assert.rejects(api.fetchMiniCase(caseId, 'offline', new AbortController().signal), /ข้อมูลผลตรวจไม่สมบูรณ์/);
  mock.restoreAll();
  mock.method(globalThis, 'fetch', async () => { throw new Error('INTERNAL_SECRET'); });
  await assert.rejects(api.fetchMiniCase(caseId, 'offline', new AbortController().signal), /ติดต่อระบบข้อมูลไม่ได้/);
});

test('ยกเลิกคำขอได้เมื่อเปลี่ยนหน้า', async () => {
  const controller = new AbortController();
  controller.abort();
  const aborted = new DOMException('Aborted', 'AbortError');
  mock.method(globalThis, 'fetch', async () => { throw aborted; });
  await assert.rejects(api.fetchMiniCase(caseId, 'offline', controller.signal), error => error === aborted);
});

test('หน้าเคสจริงแสดงเหตุผลเดิมและแยกคำแนะนำ ไม่ลิงก์ไปเคสตัวอย่าง', () => {
  const markup = renderToStaticMarkup(React.createElement(MemoryRouter, null,
    React.createElement(MiniCaseDetail, { detectionCase: detail, live: true })));
  assert.match(markup, /เหตุผลจากผลตรวจเดิม/);
  assert.match(markup, /หัวข้อที่ควรตรวจเพิ่ม/);
  assert.match(markup, /ไม่ใช่หลักฐานยืนยันการหลอกลวง/);
  assert.doesNotMatch(markup, /demo-electricity|\/mini\/chat|\/mini\/lessons/);
});

test('ข้อความที่ตรวจแสดงเป็นตัวอักษร ไม่ทำงานเป็น HTML', () => {
  const markup = renderToStaticMarkup(React.createElement(MemoryRouter, null,
    React.createElement(MiniCaseDetail, { detectionCase: { ...detail, message: '<script>alert(1)</script>' }, live: true })));
  assert.match(markup, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(markup, /<script>alert/);
});

function renderPage(path) {
  return renderToStaticMarkup(React.createElement(MemoryRouter, { initialEntries: [path] }, React.createElement(App)));
}

test('หน้าแรกจริงยังใช้ดีไซน์มาสคอตทักทายและครุ่นคิด แม้กำลังเชื่อม LINE', () => {
  const markup = renderPage('/mini/result');
  assert.match(markup, /mini-brand-banner/);
  assert.match(markup, /wave\.png/);
  assert.match(markup, /think\.png/);
  assert.match(markup, /mini-invite/);
  assert.match(markup, /ประวัติการตรวจ/);
  assert.match(markup, /mini-navigation/);
  assert.match(markup, /href="\/mini\/result\/history"/);
  assert.doesNotMatch(markup, /demo-electricity|บัญชีตัวอย่าง/);
});

test('หน้าจริงทุกหน้าคงเมนูและมาสคอตตามแบบล่าสุด พร้อมพารหัสเคสไปต่อ', () => {
  for (const [path, pose] of [['/mini/result/history', 'wave'], ['/mini/result/lessons', 'book'],
    ['/mini/result/help', 'guide'], ['/mini/result/settings', 'heart'], ['/mini/result', 'inspect']]) {
    const markup = renderPage(`${path}?case=${caseId}`);
    assert.match(markup, new RegExp(`${pose}\\.png`));
    assert.match(markup, /mini-navigation/);
    assert.match(markup, new RegExp(`/mini/result/history\\?case=${caseId}`));
    assert.doesNotMatch(markup, /href="\/mini\/chat"|href="\/mini\/settings"|href="\/mini\/help"|บัญชีตัวอย่าง/);
  }
});

test('ผลเสี่ยงแสดงคำแนะนำทุกข้อทันที ไม่พับไว้', () => {
  const markup = renderToStaticMarkup(React.createElement(MemoryRouter, null,
    React.createElement(MiniCaseDetail, { detectionCase: detail, live: true })));
  assert.match(markup, /<ol class="mini-steps"><li>อย่าส่งรหัส<\/li><li>ตรวจผ่านช่องทางทางการ<\/li><\/ol>/);
  assert.doesNotMatch(markup, /ดูคำแนะนำเพิ่มเติม/);
});

test('ผลอื่นยังพับคำแนะนำเพิ่มเติมไว้', () => {
  const markup = renderToStaticMarkup(React.createElement(MemoryRouter, null,
    React.createElement(MiniCaseDetail, { detectionCase: { ...detail, status: 'uncertain' }, live: true })));
  assert.match(markup, /ดูคำแนะนำเพิ่มเติม/);
});

test('หน้าประวัติที่มีเคสไม่เกินหนึ่งรายการไม่แสดงช่องค้นหาและตัวกรอง', () => {
  const markup = renderPage('/mini/result');
  assert.doesNotMatch(markup, /mini-search-disclosure|mini-filters/);
  const demoMarkup = renderPage('/mini');
  assert.match(demoMarkup, /mini-search-disclosure/);
  assert.match(demoMarkup, /mini-filters/);
});

test('หัวหน้าจอซ่อนปุ่มย้อนกลับเมื่ออยู่หน้าประวัติ', () => {
  assert.doesNotMatch(renderPage('/mini'), /aria-label="กลับหน้าหลัก"/);
  assert.match(renderPage('/mini/lessons'), /aria-label="กลับหน้าหลัก"/);
});

test('คำถามที่พบบ่อยไม่มีคำว่าหน้าตัวอย่าง และบอกว่าส่งรูปได้', () => {
  for (const path of ['/mini/help', `/mini/result/help?case=${caseId}`]) {
    const markup = renderPage(path);
    assert.doesNotMatch(markup, /หน้าตัวอย่าง|ช่วงเชื่อมระบบ/);
    assert.match(markup, /ส่งรูปภาพ.*ได้/);
  }
});

test('เริ่ม LIFF ครั้งเดียวเมื่อมีการเรียกพร้อมกัน และใช้ ID ที่ตั้งค่า', async () => {
  const init = mock.fn(async () => {});
  const oldWindow = globalThis.window;
  globalThis.window = { liff: { init } };
  try {
    const { initializeMiniLiff } = await server.ssrLoadModule('/src/mini/services/miniLiff.ts');
    const [first, second] = await Promise.all([initializeMiniLiff(), initializeMiniLiff()]);
    assert.equal(first, second);
    assert.equal(init.mock.calls.length, 1);
    assert.deepEqual(init.mock.calls[0].arguments, [{ liffId: '1234567890-TestApp' }]);
  } finally {
    globalThis.window = oldWindow;
  }
});

test('Login จาก localhost เปิด LIFF HTTPS แทนการส่ง localhost กลับให้ LINE', async () => {
  const { miniLoginTarget } = await server.ssrLoadModule('/src/mini/services/miniLiff.ts');
  for (const origin of ['http://127.0.0.1:5174', 'http://localhost:5174', 'https://localhost:5174']) {
    const target = miniLoginTarget(`${origin}/mini/result/history?token=DO_NOT_FORWARD#private`, '1234567890-TestApp', caseId);
    assert.equal(target.launchLiff, true);
    assert.equal(target.url, `https://liff.line.me/1234567890-TestApp?case=${caseId}`);
    assert.doesNotMatch(target.url, /localhost|127\.0\.0\.1|DO_NOT_FORWARD|private/);
  }
});

test('Login บน HTTPS เก็บเฉพาะรหัสเคส และปฏิเสธ ID ที่แทรก query', async () => {
  const { miniLoginTarget } = await server.ssrLoadModule('/src/mini/services/miniLiff.ts');
  assert.deepEqual(miniLoginTarget('https://mini.example/mini/result/history?token=SECRET#private', '1234567890-TestApp', caseId), {
    launchLiff: false, url: `https://mini.example/mini/result/history?case=${caseId}`,
  });
  assert.equal(miniLoginTarget('http://localhost:5174/mini/result', '1234567890-TestApp', '').url,
    'https://liff.line.me/1234567890-TestApp');
  assert.throws(() => miniLoginTarget('http://localhost:5174', '123-abc?redirect=evil', caseId));
  assert.throws(() => miniLoginTarget('http://localhost:5174', '1234567890-TestApp', 'bad&token=secret'));
});
