// ตรวจเกณฑ์อ่านง่ายของ Dashboard จากไฟล์ style โดยตรง: ขนาดตัวอักษรขั้นต่ำ และ contrast ตาม WCAG AA
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
// ภาษาไทยมีวรรณยุกต์และสระบน/ล่าง ต่ำกว่า 11px อ่านยาก
const MIN_FONT_PX = 11;
// rem คิดจาก html { font-size } ที่ index.css ตั้งไว้จริง (ไม่ใช่ 16px ของเบราว์เซอร์)
const ROOT_PX = Number(read('src/index.css').match(/html\s*\{[^}]*font-size:\s*([\d.]+)px/)[1]);

function smallFonts(css) {
  const found = [];
  for (const match of css.matchAll(/font-size:\s*([\d.]+)(px|rem)/g)) {
    const px = match[2] === 'rem' ? Number(match[1]) * ROOT_PX : Number(match[1]);
    if (px < MIN_FONT_PX) found.push(`${match[0]} (${px}px)`);
  }
  return found;
}

function luminance(hex) {
  const channels = hex.replace('#', '').match(/../g).map(part => parseInt(part, 16) / 255)
    .map(value => (value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(foreground, background) {
  const [light, dark] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
}

// ehbot.css โหลดหลัง index.css จึงเป็นค่าที่ใช้จริงของ token
function rootToken(css, name) {
  const value = css.match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})`));
  assert.ok(value, `missing ${name}`);
  return value[1];
}

test('Dashboard ไม่มีตัวอักษรเล็กกว่า 11px', () => {
  for (const path of ['src/ehbot.css', 'src/index.css', 'src/pages/Dataset.css', 'src/pages/DashboardAccess.css']) {
    assert.deepEqual(smallFonts(read(path)), [], path);
  }
});

test('token สีตัวอักษรอ่านได้บนพื้นหลักทั้งสอง (≥ 4.5:1)', () => {
  const css = read('src/ehbot.css');
  const backgrounds = ['--color-bg-primary', '--color-bg-secondary'].map(name => {
    const short = css.match(new RegExp(`${name}:\\s*#([0-9a-fA-F]{3})\\b`));
    return short ? `#${[...short[1]].map(c => c + c).join('')}` : rootToken(css, name);
  });
  for (const name of ['--color-text-primary', '--color-text-secondary', '--color-text-tertiary']) {
    for (const background of backgrounds) {
      const ratio = contrast(rootToken(css, name), background);
      assert.ok(ratio >= 4.5, `${name} on ${background} = ${ratio.toFixed(2)}`);
    }
  }
});

test('ตัวอักษรรองที่กำหนดสีเองใน ehbot.css อ่านได้บนพื้นขาว (≥ 4.5:1)', () => {
  const css = read('src/ehbot.css');
  for (const selector of ['.breadcrumb-brand', '.header-user small', '.eyebrow', '.workspace-footer']) {
    const rule = css.match(new RegExp(`${selector.replace('.', '\\.')}\\s*\\{[^}]*[^-]color:\\s*(#[0-9a-fA-F]{6}|var\\((--[\\w-]+)\\))`));
    assert.ok(rule, `missing color for ${selector}`);
    const color = rule[2] ? rootToken(css, rule[2]) : rule[1];
    const ratio = contrast(color, '#ffffff');
    assert.ok(ratio >= 4.5, `${selector} ${color} = ${ratio.toFixed(2)}`);
  }
});

test('ตัวเลขแกนกราฟอ่านได้บนพื้นขาว (≥ 4.5:1)', () => {
  for (const path of ['src/pages/Overview.tsx', 'src/pages/GroupDashboard.tsx']) {
    const source = read(path);
    const axisColors = [...source.matchAll(/<[XY]Axis[^>]*?(?:stroke="|fill: ')(#[0-9a-fA-F]{6})/g)].map(match => match[1]);
    assert.ok(axisColors.length > 0, `no axis colors found in ${path}`);
    for (const color of axisColors) {
      const ratio = contrast(color, '#ffffff');
      assert.ok(ratio >= 4.5, `${path} axis ${color} = ${ratio.toFixed(2)}`);
    }
  }
});
