// Tests de la escena (BL-091 ESC-1): la estética de mi sitio, solo con el theme Gato Negro.
// Correr: node --test tests/*.test.cjs
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const css = read('css/escena.css');
const js = read('js/escena.js');
const E = require('../js/escena.js');

// Reglas sueltas (fuera de @keyframes), con @media desarmado.
function reglas(src) {
  const sinComentarios = src.replace(/\/\*[\s\S]*?\*\//g, '');
  const sinKeyframes = sinComentarios.replace(/@keyframes[^{]+\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '');
  const sinMedia = sinKeyframes.replace(/@media[^{]+\{([\s\S]*?\})\s*\}/g, '$1');
  return [...sinMedia.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(m => ({ sel: m[1].trim(), body: m[2] }));
}

// Contraste WCAG
const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const over = (c, a, b) => c.map((v, i) => v * a + b[i] * (1 - a));
const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

test('chispas: tantas como se piden, con su índice, y con tope', () => {
  assert.equal(E.chispasHTML(3), '<i style="--i:0"></i><i style="--i:1"></i><i style="--i:2"></i>');
  assert.equal(E.chispasHTML(0), '');
  assert.equal(E.chispasHTML(-5), '');
  assert.equal((E.chispasHTML(500).match(/<i /g) || []).length, 40);
  assert.equal((E.chispasHTML(E.CHISPAS).match(/<i /g) || []).length, 14);
});

test('solo cambia el theme Gato Negro: toda regla cuelga de body[data-theme="gato"]', () => {
  const rs = reglas(css);
  assert.ok(rs.length >= 15, 'se leyeron las reglas (' + rs.length + ')');
  for (const r of rs) {
    for (const s of r.sel.split(',').map(x => x.trim())) {
      const libre = s === '.esc-chispas' && /^\s*display:\s*none;\s*$/.test(r.body);
      assert.ok(s.startsWith('body[data-theme="gato"]') || libre, 'regla sin scope: ' + s);
    }
  }
});

test('la cabecera no gana backdrop-filter, filter ni transform (los menús fixed del celular siguen en su lugar)', () => {
  assert.ok(!/backdrop-filter/.test(css.replace(/\/\*[\s\S]*?\*\//g, '')));
  for (const r of reglas(css).filter(x => /\.app-header/.test(x.sel))) assert.ok(!/(filter|transform|will-change|contain)\s*:/.test(r.body), r.sel);
});

test('el fondo y las chispas no tapan ni atrapan clics', () => {
  const fondo = reglas(css).find(r => r.sel === 'body[data-theme="gato"]::before');
  assert.ok(fondo && /position:\s*fixed/.test(fondo.body) && /z-index:\s*-1/.test(fondo.body) && /pointer-events:\s*none/.test(fondo.body));
  const ch = reglas(css).find(r => r.sel === 'body[data-theme="gato"] .esc-chispas');
  assert.ok(ch && /position:\s*fixed/.test(ch.body) && /z-index:\s*-1/.test(ch.body) && /pointer-events:\s*none/.test(ch.body));
});

test('contraste: la pestaña activa y el texto de los paneles sobre el punto más claro del fondo', () => {
  const tab = reglas(css).find(r => r.sel === 'body[data-theme="gato"] .app-tab[aria-current="true"]');
  const bg = /background:\s*(#[0-9A-Fa-f]{6})/.exec(tab.body)[1], fg = /color:\s*(#[0-9A-Fa-f]{6})/.exec(tab.body)[1];
  assert.ok(cr(hex(fg), hex(bg)) >= 7, 'pestaña activa ' + cr(hex(fg), hex(bg)).toFixed(2));
  // Peor caso: fondo del theme + luz violeta + línea de la cuadrícula, y el panel al 90 %.
  const base = over([255, 255, 255], 0.03, over([168, 150, 255], 0.16, hex('#0F1117')));
  const panel = over(hex('#1A1F2B'), 0.9, base);
  assert.match(css, /\.gn-panel \{\s*background: rgba\(26, 31, 43, \.9\)/);
  assert.ok(cr(hex('#F4F6FA'), panel) >= 4.5, 'texto');
  const muted = over(hex('#8E96A3'), 0.8, hex('#F4F6FA')); // --gn-muted
  assert.ok(cr(muted, panel) >= 4.5, 'texto secundario ' + cr(muted, panel).toFixed(2));
  const header = over(hex('#0F1117'), 0.9, base);
  assert.match(css, /\.app-header \{ background: rgba\(15, 17, 23, \.9\); \}/);
  assert.ok(cr(muted, header) >= 4.5, 'pestañas sobre la cabecera');
});

test('cada panel con el color de su sección y entrando en orden', () => {
  const orden = ['seccionWidgets', 'seccionFavoritos', 'seccionCategorias', 'launcherPanel'];
  orden.forEach((id, i) => {
    const r = reglas(css).find(x => x.sel === 'body[data-theme="gato"] #' + id);
    assert.ok(r, id);
    assert.match(r.body, /--esc-color:\s*#[0-9A-Fa-f]{6}/);
    assert.match(r.body, new RegExp('--esc-orden:\\s*' + (i + 1) + ';'));
  });
});

test('«reducir movimiento»: sin chispas ni entradas', () => {
  const m = /@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?\})\s*\}/.exec(css);
  assert.ok(m);
  assert.match(m[1], /\.esc-chispas \{ display: none; \}/);
  assert.match(m[1], /\.gn-panel \{ animation: none; \}/);
});

test('escena.js no sale a la red ni guarda nada, y no repite la capa', () => {
  const codigo = js.replace(/\/\*[\s\S]*?\*\//g, '');
  assert.ok(!/fetch|XMLHttpRequest|localStorage|sessionStorage|cookie/.test(codigo));
  assert.match(codigo, /if \(doc\.querySelector\('\.esc-chispas'\)\) return;/);
  assert.match(codigo, /setAttribute\('aria-hidden', 'true'\)/);
});

test('index.html carga la escena al final y con versión', () => {
  const html = read('index.html');
  const links = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(m => m[1]);
  assert.equal(links[links.length - 1], 'css/escena.css?v=' + E.VERSION);
  const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]);
  assert.equal(scripts[scripts.length - 1], 'js/escena.js?v=' + E.VERSION);
  assert.match(css, new RegExp('\\(' + E.VERSION.replace(/\./g, '\\.') + ', '));
});
