// Revisión de los 19 themes (RG-5): el texto del diseño 3.0 se lee en todos.
// Mide el contraste WCAG con los colores reales de css/themes/*.css; 4,5:1 es el mínimo para texto chico.
// Correr: node --test tests/*.test.cjs
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DIR = path.join(ROOT, 'css/themes');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const themes = fs.readdirSync(DIR).filter(f => f.endsWith('.css')).map(f => {
  const css = fs.readFileSync(path.join(DIR, f), 'utf8');
  const v = k => { const m = css.match(new RegExp('--' + k + ':\\s*([^;]+);')); return m && m[1].trim(); };
  return { name: f.replace('.css', ''), bg: v('bg'), panel: v('panel'), alt: v('panel-alt'), text: v('text'), muted: v('muted') };
});

function parse(c) {
  if (c[0] === '#') return [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16)).concat(1);
  const m = c.replace(/\s/g, '').match(/^rgba?\(([\d.]+),([\d.]+),([\d.]+)(?:,([\d.]+))?\)$/);
  return [+m[1], +m[2], +m[3], m[4] == null ? 1 : +m[4]];
}
const over = (c, b) => [0, 1, 2].map(i => c[i] * c[3] + b[i] * (1 - c[3])).concat(1);
const mix = (a, p, b) => [0, 1, 2].map(i => a[i] * p + b[i] * (1 - p)).concat(1); // color-mix(in srgb, a p, b)
const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const GOLD = parse('#E8B34B');
const MIN = 4.5;

function each(fn) {
  const malos = [];
  for (const t of themes) {
    const bg = parse(t.bg);
    const c = { bg, panel: over(parse(t.panel), bg), alt: over(parse(t.alt), bg), text: over(parse(t.text), bg), muted: over(parse(t.muted), bg) };
    const r = fn(c);
    if (r < MIN) malos.push(t.name + ' ' + r.toFixed(2) + ':1');
  }
  return malos;
}

test('están los 19 themes y todos definen los colores que usa el diseño 3.0', () => {
  assert.equal(themes.length, 19);
  for (const t of themes) for (const k of ['bg', 'panel', 'alt', 'text', 'muted']) assert.ok(t[k], t.name + ' define ' + k);
});

test('reloj «está cerca»: 45 % de dorado con el texto, legible en todos', () => {
  assert.ok(read('css/kit.css').includes('.gk-clk.is-soon .gk-clk__value { color: color-mix(in srgb, #E8B34B 45%, var(--text)); }'));
  assert.deepEqual(each(c => cr(mix(GOLD, 0.45, c.text), c.bg)), []);
  assert.ok(each(c => cr(parse('#F2C46B'), c.bg)).length > 0, 'el dorado puro de antes fallaba en algún theme');
});

test('etiqueta del reloj: 45 % apagado, legible en todos', () => {
  assert.ok(read('css/kit.css').includes('color: color-mix(in srgb, var(--muted) 45%, var(--text)); font-size: .78rem;'));
  assert.deepEqual(each(c => cr(mix(c.muted, 0.45, c.text), c.bg)), []);
});

test('«Lo de siempre»: 45 % de ámbar sobre el panel, legible en todos', () => {
  assert.ok(read('css/header.css').includes('color: color-mix(in srgb, var(--gh-fav) 45%, var(--text));'));
  assert.deepEqual(each(c => cr(mix(GOLD, 0.45, c.text), c.panel)), []);
});

test('botón principal: blanco sobre el violeta del Gato Design System', () => {
  assert.ok(read('css/kit.css').includes('.gk-btn--primary { background: #5A3DDB; border-color: #5A3DDB; color: #FFFFFF;'));
  assert.ok(cr(parse('#FFFFFF'), parse('#5A3DDB')) >= MIN);
});

test('error del contador: texto del theme sobre el panel, el rojo va en la barra', () => {
  assert.ok(read('css/widgets.css').includes('border-left: 3px solid #D94A4A; font-size: .8125rem; color: var(--text); }'));
  assert.deepEqual(each(c => cr(c.text, c.alt)), []);
});

test('avisos y paneles opacos aunque el theme sea translúcido, y por encima del editor', () => {
  const kit = read('css/kit.css');
  assert.ok((kit.match(/background: var\(--gn-float, var\(--panel\)\)/g) || []).length >= 2);
  const z = sel => +kit.match(new RegExp(sel.replace('.', '\\.') + ' \\{[^}]*z-index: (\\d+)'))[1];
  assert.ok(z('.gk-toasts') > 10000 && z('.gk-sheet') > 10000, 'el editor (#modal) usa z-index 10000');
});
