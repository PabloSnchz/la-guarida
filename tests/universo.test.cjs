// Tests de css/universo.css (BL-091 ESC-5): La Guarida en el universo de mi sitio.
// Solo con el theme Gato Negro, sin tocar la cabecera, con contraste y con mis poses
// asomándose solo cuando ya no tienen fondo. Correr: node --test tests/*.test.cjs
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const css = fs.readFileSync(path.join(ROOT, 'css/universo.css'), 'utf8');
const E = require('../js/escena.js');

function reglas(src) {
  const sinComentarios = src.replace(/\/\*[\s\S]*?\*\//g, '');
  const sinKeyframes = sinComentarios.replace(/@keyframes[^{]+\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '');
  const sinMedia = sinKeyframes.replace(/@media[^{]+\{([\s\S]*?\})\s*\}/g, '$1');
  return [...sinMedia.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(m => ({ sel: m[1].trim(), body: m[2] }));
}
const RS = reglas(css);
const regla = sel => RS.find(r => r.sel === sel);
const prop = (body, p) => { const m = new RegExp('(?:^|[;\\s])' + p + ':\\s*([^;]+);').exec(body); return m ? m[1].trim() : null; };

const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const over = (c, a, b) => c.map((v, i) => v * a + b[i] * (1 - a));
const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

const T = regla('body[data-theme="gato"]').body;
const tok = n => prop(T, '--' + n);
// Peor caso: el punto más claro del fondo (luz violeta + cuadrícula) bajo el panel más claro
const BASE = over([255, 255, 255], 0.03, over([155, 130, 255], 0.18, hex('#0B0B10')));
const PANEL = over([28, 28, 38], 0.94, BASE);           // arriba del degradé del panel
const TARJETA = over([21, 21, 29], 0.86, PANEL);        // tarjetas sobre el panel
const MUTED = over(hex(tok('muted')), 0.8, hex(tok('text')));

test('la paleta es la de mi sitio (pablosnchz.github.io/shiruvana)', () => {
  assert.deepEqual(
    ['bg', 'panel', 'panel-alt', 'border', 'text', 'muted', 'accent', 'accent-2', 'border-hover'].map(tok),
    ['#0B0B10', '#15151D', '#1C1C26', '#2A2A38', '#EDEDF2', '#A6A6B8', '#E8B34B', '#9B82FF', '#E8B34B']);
  assert.deepEqual(['esc-ambar', 'esc-violeta', 'esc-turquesa'].map(tok), ['#E8B34B', '#9B82FF', '#2EC4B6']);
});

test('solo cambia el theme Gato Negro: toda regla cuelga de body[data-theme="gato"]', () => {
  assert.ok(RS.length >= 80, 'se leyeron las reglas (' + RS.length + ')');
  for (const r of RS) for (const s of r.sel.split(/,(?![^(]*\))/).map(x => x.trim())) {
    assert.ok(s.startsWith('body[data-theme="gato"]'), 'regla sin scope: ' + s);
  }
});

test('la cabecera no gana backdrop-filter, filter, transform ni position (los menús fixed del celular siguen en su lugar)', () => {
  const sin = css.replace(/\/\*[\s\S]*?\*\//g, '');
  assert.ok(!/backdrop-filter/.test(sin));
  // La pollera ::after (ESC-6) es un pseudo-elemento: no mueve la cabecera ni sus menús.
  for (const r of RS.filter(x => /\.app-header|\.app-bar|\.gh-row|\.app-tools|\.gn-menu(?!__)/.test(x.sel) && !/::after/.test(x.sel))) {
    assert.ok(!/(^|[;\s])(filter|transform|will-change|contain|position)\s*:/.test(r.body), r.sel);
  }
});

test('contraste: texto, texto secundario, antetítulos y cifras sobre panel y tarjetas', () => {
  for (const fondo of [PANEL, TARJETA]) {
    assert.ok(cr(hex(tok('text')), fondo) >= 7, 'texto');
    assert.ok(cr(MUTED, fondo) >= 4.5, 'secundario ' + cr(MUTED, fondo).toFixed(2));
    for (const c of ['esc-ambar', 'esc-violeta', 'esc-turquesa']) assert.ok(cr(hex(tok(c)), fondo) >= 4.5, c + ' ' + cr(hex(tok(c)), fondo).toFixed(2));
  }
  // Los antetítulos usan el color de su sección
  for (const id of ['seccionWidgets', 'seccionFavoritos', 'seccionCategorias', 'launcherPanel']) {
    const r = regla('body[data-theme="gato"] #' + id).body;
    const c = prop(r, '--esc-color');
    assert.ok(cr(hex(c), PANEL) >= 4.5, id + ' ' + c);
    assert.match(prop(r, '--esc-ante'), /^"0\d · .+"$/, id);
  }
  assert.ok(cr(hex(tok('esc-ambar')), hex('#1C1C26')) >= 4.5, 'ámbar sobre el ícono');
});

test('tipografía de mi sitio: antetítulo espaciado, título y cifra en 800 con brillo', () => {
  const ante = regla('body[data-theme="gato"] .gn-panel__head::before').body;
  assert.equal(prop(ante, 'content'), 'var(--esc-ante, "")');
  assert.equal(prop(ante, 'letter-spacing'), '.22em');
  assert.equal(prop(ante, 'text-transform'), 'uppercase');
  assert.equal(prop(regla('body[data-theme="gato"] .gn-panel__title').body, 'font-weight'), '800');
  const cifra = regla('body[data-theme="gato"] .gn-count').body;
  assert.equal(prop(cifra, 'font-weight'), '800');
  assert.match(prop(cifra, 'text-shadow'), /rgba\(232, 179, 75/);
  const reloj = regla('body[data-theme="gato"] #widgetsLeft .widget-clock-time,\nbody[data-theme="gato"] #widgetsLeft .widget-counter-days').body;
  assert.equal(prop(reloj, 'color'), 'var(--esc-ambar)');
  assert.equal(prop(reloj, 'font-variant-numeric'), 'tabular-nums');
});

test('líneas de tiempo: los enlaces de cada categoría y las noticias cuelgan de una línea con puntos', () => {
  const linea = regla('body[data-theme="gato"] #seccionCategorias .category-links').body;
  assert.match(prop(linea, 'border-left'), /^2px solid/);
  const punto = regla('body[data-theme="gato"] #seccionCategorias .category-link::before').body;
  assert.equal(prop(punto, 'content'), '""');
  assert.equal(prop(punto, 'position'), 'absolute');
  // El punto queda centrado sobre la línea: padding 18 + borde 2 → centro en -19 px; 10 px de ancho → left -24
  assert.equal(prop(punto, 'left'), '-24px');
  assert.equal(prop(linea, 'padding-left'), '18px');
  assert.equal(prop(punto, 'width'), '10px');
  const noticias = regla('body[data-theme="gato"] #widgetsLeft .widget-news-list').body;
  assert.match(prop(noticias, 'border-left'), /^2px solid/);
  assert.ok(regla('body[data-theme="gato"] #widgetsLeft .widget-news-item::before'));
});

test('yo asomada: solo cuando la pose ya no tiene fondo, detrás del contenido y sin tapar el texto', () => {
  const base = regla('body[data-theme="gato"] .gn-panel::after').body;
  assert.equal(prop(base, 'content'), 'none', 'sin recorte, nada');
  assert.equal(prop(base, 'pointer-events'), 'none');
  assert.equal(prop(base, 'z-index'), '0');
  assert.equal(prop(regla('body[data-theme="gato"] .gn-panel > *').body, 'z-index'), '1', 'el contenido va arriba');
  const casos = { seccionFavoritos: 'saluda', seccionCategorias: 'pensando', launcherPanel: 'sentada' };
  for (const [id, p] of Object.entries(casos)) {
    const r = regla('body[data-theme="gato"].esc-p-' + p + ' #' + id + '::after');
    assert.ok(r, id);
    assert.equal(prop(r.body, '--esc-asoma'), 'var(--esc-p-' + p + ')');
    assert.ok(E.POSES.includes(p), p + ' la recorta escena.js');
  }
  assert.ok(!/url\("[^"]*cuerpo-/.test(css), 'nunca una pose con fondo negro');
  // El gato de Widgets ya viene sin fondo
  const g = regla('body[data-theme="gato"] #seccionWidgets::after').body;
  const u = /url\("([^"]+)"\)/.exec(g)[1];
  assert.ok(fs.existsSync(path.join(ROOT, 'css', u)), u);
  const pad = prop(regla('body[data-theme="gato"] .gn-panel__head,\nbody[data-theme="gato"] .gn-panel__desc').body, 'padding-right');
  assert.ok(parseInt(pad, 10) >= parseInt(prop(base, 'width'), 10) - 24, 'el texto deja lugar a la pose (' + pad + ')');
});

test('las líneas de color de css/cards.css no se duplican con el borde de arriba', () => {
  const r = RS.find(x => x.sel.includes('#seccionFavoritos::before') && x.sel.includes('#launcherPanel::before'));
  assert.ok(r);
  assert.equal(prop(r.body, 'height'), 'auto');
  assert.equal(prop(r.body, 'pointer-events'), 'none');
  assert.match(prop(regla('body[data-theme="gato"] .gn-panel').body, 'border-top'), /^3px solid var\(--esc-color/);
});

test('las tarjetas entran de a una solo al abrir (escena.js pone esc-listo)', () => {
  const r = RS.find(x => x.sel.includes(':not(.esc-listo) #seccionFavoritos .fav-card'));
  assert.ok(r);
  assert.equal(prop(r.body, 'animation'), 'var(--esc-sube)');
  assert.match(prop(T, '--esc-sube'), /^escSube /, 'usa la animación de css/escena.css');
  assert.match(fs.readFileSync(path.join(ROOT, 'css/escena.css'), 'utf8'), /@keyframes escSube/);
  for (let i = 1; i <= 8; i++) assert.ok(RS.some(x => x.sel.endsWith(':nth-child(' + i + ')') && prop(x.body, '--esc-i') === String(i - 1)), 'orden ' + i);
});

test('«reducir movimiento» y celular', () => {
  const m = /@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?\})\s*\}/.exec(css);
  assert.ok(m);
  assert.match(m[1], /\.gn-panel::after \{ animation: none; \}/);
  assert.match(m[1], /transform: none;/);
  const cel = /@media \(max-width: 760px\) \{([\s\S]*?\})\s*\}\s*\n/.exec(css);
  assert.ok(cel && /\.gn-panel::after/.test(cel[1]), 'la pose se achica en el celular');
});

test('index.html carga universo.css último, con la versión de su cabecera', () => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const links = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(m => m[1]);
  const v = /\((\d+\.\d+\.\d+), \d{4}-\d{2}-\d{2}, BL-091 ESC-\d+\)/.exec(css)[1];
  assert.equal(links[links.length - 1], 'css/universo.css?v=' + v);
});

// ---- ESC-6 ----
test('ESC-6: arriba de todo la cabecera no tiene fondo ni línea; al bajar se esfuma, sin corte', () => {
  const h = regla('body[data-theme="gato"] .app-header').body;
  assert.equal(prop(h, 'background'), 'transparent');
  assert.equal(prop(h, 'border-bottom-color'), 'transparent');
  assert.match(prop(regla('body[data-theme="gato"].esc-bajo .app-header').body, 'background'), /^rgba\(11, 11, 16, \.9\d\)$/);
  const p = regla('body[data-theme="gato"] .app-header::after').body;
  assert.equal(prop(p, 'top'), '100%');
  assert.equal(prop(p, 'pointer-events'), 'none');
  assert.equal(prop(p, 'opacity'), '0');
  assert.match(prop(p, 'background'), /linear-gradient\(rgba\(11, 11, 16, \.94\), rgba\(11, 11, 16, 0\)\)/, 'del fondo de la cabecera a nada');
  assert.equal(prop(regla('body[data-theme="gato"].esc-bajo .app-header::after').body, 'opacity'), '1');
  const m = /@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?\})\s*\}/.exec(css)[1];
  assert.match(m, /\.app-header::after \{ transition: none; \}/);
  // Las pestañas se leen sobre el fondo más claro, con cabecera transparente
  assert.ok(cr(MUTED, BASE) >= 4.5, 'pestañas sobre el escenario ' + cr(MUTED, BASE).toFixed(2));
});

test('ESC-6: el buscador es el protagonista: centrado, con lupa y sin mi cara; sin barra de relojes', () => {
  assert.equal(prop(regla('body[data-theme="gato"] .gh-clocks').body, 'display'), 'none');
  assert.equal(prop(regla('body[data-theme="gato"] .gn-portal-trigger__avatar').body, 'display'), 'none');
  const fila = RS.filter(x => x.sel === 'body[data-theme="gato"] .gh-row').map(x => prop(x.body, 'grid-template-columns'));
  assert.deepEqual(fila, ['minmax(0, 1fr) minmax(320px, 640px) minmax(0, 1fr)', 'minmax(0, 1fr)'], 'centrado; en pantallas medianas, una columna');
  const lupa = regla('body[data-theme="gato"] .gn-portal-trigger::before').body;
  assert.match(lupa, /data:image\/svg\+xml/);
  assert.match(lupa, /stroke='%23E8B34B'/, 'lupa ámbar');
  assert.ok(parseInt(prop(regla('body[data-theme="gato"] .gn-portal-trigger').body, 'min-height'), 10) >= 44, 'blanco táctil');
});

test('ESC-6: los reinicios del widget son cifras ámbar; «está cerca» brilla más', () => {
  assert.equal(prop(regla('body[data-theme="gato"] #widgetsLeft .reset-value,\nbody[data-theme="gato"] #widgetsLeft .gw-reset__value').body, 'color'), 'var(--esc-ambar)');
  assert.match(prop(regla('body[data-theme="gato"] #widgetsLeft .gw-reset.is-soon .gw-reset__value').body, 'text-shadow'), /rgba\(232, 179, 75, \.7\)/);
  assert.equal(prop(regla('body[data-theme="gato"] #widgetsLeft .gw-reset.is-soon .reset-label').body, 'color'), 'var(--esc-ambar)');
});
