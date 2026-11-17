// Tests de los widgets sin ventanitas del navegador (js/widgets-ui.js, RG-4).
// Correr: node --test tests/*.test.cjs
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const W = require('../js/widgets-ui.js');

const TYPES = { clock: { label: 'Reloj', icon: 'i1' }, counter: { label: 'Contador', icon: 'i2' }, notes: { label: 'Notas', icon: 'i3' } };

test('configuración inicial igual a la de widgets.js', () => {
  assert.deepEqual(W.defaultConfig('counter'), { title: 'Cuenta regresiva', date: '' });
  assert.deepEqual(W.defaultConfig('notes'), { text: '' });
  assert.deepEqual(W.defaultConfig('clock'), { format: '24h', showDate: true });
  assert.deepEqual(W.defaultConfig('greeting'), { name: '' });
  assert.deepEqual(W.defaultConfig('gw2_news'), {});
});

test('el panel muestra cada widget con su descripción y cuántos ya tenés', () => {
  const items = W.pickerItems(TYPES, [{ type: 'counter' }, { type: 'counter' }, { type: 'notes' }]);
  assert.deepEqual(items.map(i => i.type), ['clock', 'counter', 'notes']);
  assert.equal(items[1].count, 2);
  assert.equal(items[0].count, 0);
  assert.ok(items.every(i => i.desc.length > 5), 'todos tienen descripción');
  const real = ['clock', 'greeting', 'notes', 'counter', 'all_resets', 'gw2_news', 'twitch', 'youtube'];
  for (const t of real) assert.ok(W.DESC[t], 'hay descripción para ' + t);
});

test('cada contador se edita a sí mismo (antes siempre se editaba el primero)', () => {
  const st = { widgets_left: [{ type: 'counter', config: { title: 'A' } }, { type: 'notes' }], widgets_right: [{ type: 'counter', config: { title: 'B' } }] };
  const all = W.combined(st);
  assert.equal(W.nthOfType(all, 'counter', 0).config.title, 'A');
  assert.equal(W.nthOfType(all, 'counter', 1).config.title, 'B', 'el de la derecha va después, como los dibuja widgets.js');
  assert.equal(W.nthOfType(all, 'counter', 2), null);
});

test('agregar un widget lo pone al final de la izquierda con su configuración', () => {
  const st = {};
  W.addWidget(st, 'counter');
  const w = W.addWidget(st, 'notes');
  assert.equal(st.widgets_left.length, 2);
  assert.deepEqual(w, { type: 'notes', position: 1, config: { text: '' } });
});

test('RG-8: quitar el widget que tocaste, aunque haya tipos que no se dibujan', () => {
  const known = { clock: 1, notes: 1, counter: 1 };
  const st = {
    widgets_left: [{ type: 'clock', position: 0 }, { type: 'viejo', position: 1 }, { type: 'notes', position: 2 }],
    widgets_right: [{ type: 'counter', position: 0, config: { title: 'B' } }]
  };
  const r = W.removeAt(st, 1, known); // el 2.º dibujado: notes (el «viejo» no se dibuja)
  assert.equal(r.widget.type, 'notes');
  assert.equal(r.side, 'widgets_left');
  assert.deepEqual(st.widgets_left.map(w => w.type), ['clock', 'viejo']);
  assert.deepEqual(st.widgets_left.map(w => w.position), [0, 1], 'posiciones renumeradas');
  const r2 = W.removeAt(st, 1, known); // ahora el 2.º dibujado es el contador de la derecha
  assert.equal(r2.widget.config.title, 'B');
  assert.equal(r2.side, 'widgets_right');
  assert.equal(W.removeAt(st, 5, known), null);
  assert.equal(W.removeAt({}, 0, known), null);
  const st2 = { widgets_left: [{ type: 'clock', position: 0 }, { type: 'notes', position: 1 }, { type: 'counter', position: 2 }] };
  W.removeAt(st2, 0, known);
  assert.deepEqual(st2.widgets_left.map(w => w.position), [0, 1], 'quitar el primero corre a los demás');
});

test('RG-8: «Deshacer» lo vuelve a poner en el mismo lugar', () => {
  const st = { widgets_left: [{ type: 'clock' }, { type: 'notes' }, { type: 'counter' }] };
  const r = W.removeAt(st, 1);
  W.putBack(st, r);
  assert.deepEqual(st.widgets_left.map(w => w.type), ['clock', 'notes', 'counter']);
  assert.deepEqual(st.widgets_left.map(w => w.position), [0, 1, 2]);
  assert.equal(W.DESHACER_MS, 10000);
});

test('RG-8: el ✕ se ve solo en modo edición y el aviso lleva el guiño', () => {
  const src = fs.readFileSync(path.join(__dirname, '../js/widgets-ui.js'), 'utf8');
  assert.ok(src.includes("el('div', 'edit-actions gw-del')"), 'usa .edit-actions, que styles.css muestra solo con .edit-mode');
  assert.ok(src.includes("'Eliminé el widget «'"), 'empieza con «Eliminé»: header.js le pone el guiño');
  assert.ok(/subtree: true/.test(src), 'vuelve a poner el ✕ cuando Twitch o YouTube rehacen su tarjeta');
  const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  assert.ok(html.includes('Para quitar uno, entrá en ✏️ Editar y tocá su ✕.'));
});

test('validación del contador', () => {
  assert.deepEqual(W.validCounter('  Cumple  ', '2026-12-25'), { ok: true, config: { title: 'Cumple', date: '2026-12-25' } });
  assert.deepEqual(W.validCounter('', ''), { ok: true, config: { title: 'Cuenta regresiva', date: '' } }, 'sin fecha se puede guardar');
  assert.equal(W.validCounter('X', '25/12/2026').ok, false);
  assert.equal(W.validCounter('X', '2026-02-30').ok, false, 'fecha que no existe');
  assert.equal(W.validCounter('X', '2028-02-29').ok, true, 'bisiesto');
});

test('la fecha del contador es la del día que elegiste, en hora local', () => {
  const now = new Date(2026, 11, 20, 10, 0).getTime(); // 20/12/2026 10:00 local
  assert.deepEqual(W.counterView('2026-12-25', now), { days: 5, label: '25/12/2026' });
  assert.deepEqual(W.counterView('2026-12-21', now), { days: 1, label: '21/12/2026' });
  // La noche anterior todavía falta 1 día (con medianoche UTC, en Argentina daba 0 desde las 21:00)
  assert.equal(W.counterView('2026-12-25', new Date(2026, 11, 24, 23, 0).getTime()).days, 1);
  assert.equal(W.counterView('2026-12-20', now).days, 0, 'hoy: 0, nunca negativo');
  assert.equal(W.counterView('2026-01-01', now).days, 0);
  assert.equal(W.counterView('', now), null);
});

test('sin ventanitas del navegador y sin credenciales en el código nuevo', () => {
  const src = fs.readFileSync(path.join(__dirname, '../js/widgets-ui.js'), 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
  assert.ok(!/\b(prompt|alert|confirm)\s*\(/.test(src), 'no usa prompt/alert/confirm');
  assert.ok(!/apiKey|accessToken|clientId|AIza/.test(src), 'no copia claves de widgets.js');
  assert.ok(src.includes("addEventListener('click'") && /}, true\);/.test(src), 'escucha en captura, antes que widgets.js');
});

test('ESC-6: la fila de temporada ya no se esconde; «está cerca» con el dorado del kit', () => {
  const css = fs.readFileSync(path.join(__dirname, '../css/widgets.css'), 'utf8');
  assert.ok(!css.includes('widget-reset-row:nth-child(3)'), 'la temporada vuelve, con la fecha real');
  assert.ok(css.includes('#widgetsLeft .gw-reset.is-soon .gw-reset__value { color: color-mix(in srgb, #E8B34B 45%, var(--text)); }'));
  assert.ok(css.includes('#widgetsLeft .gw-reset__value { color: var(--accent-2);'), 'como la .reset-value de siempre');
  const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  assert.ok(html.indexOf('css/widgets.css') > html.indexOf('css/styles.css'));
});

// ---- ESC-6: reinicios con el reloj de la cabecera ----
const K = require('../js/kit.js');
const HORA = 60 * 60 * 1000, DIA = 24 * HORA;
const NOW = Date.UTC(2026, 9, 31, 18, 0); // sábado 31/10/2026 18:00 UTC

test('ESC-6: reinicios diario y semanal con el reloj del kit; la temporada solo si sigue abierta', () => {
  const sin = W.resetRows(NOW, null, K);
  assert.deepEqual(sin.map(r => r.key), ['daily', 'weekly'], 'sin «Local»: ya está el reloj de la PC');
  assert.deepEqual(sin.map(r => r.label), ['Diario', 'Semanal']);
  assert.equal(sin[0].value, K.dur(K.nextDaily(NOW) - NOW));
  assert.equal(sin[0].value, '6 h 0 min');
  assert.equal(sin[1].value, K.dur(K.nextWeekly(NOW) - NOW));
  assert.ok(sin.every(r => r.soon === false && r.title));
  const con = W.resetRows(NOW, NOW + 2 * DIA, K);
  assert.deepEqual(con.map(r => r.key), ['daily', 'weekly', 'season']);
  assert.equal(con[2].label, 'Temporada');
  assert.equal(con[2].soon, true, 'menos de 3 días: dorado');
  assert.equal(W.resetRows(NOW, NOW + 10 * DIA, K)[2].soon, false);
  assert.deepEqual(W.resetRows(NOW, NOW - 1000, K).map(r => r.key), ['daily', 'weekly'], 'temporada terminada: no se muestra');
  assert.equal(W.resetRows(Date.UTC(2026, 9, 31, 23, 30), null, K)[0].soon, true, 'diario con menos de 1 h');
  assert.deepEqual(W.resetRows(NOW, null, null), [], 'sin kit, nada');
});

test('ESC-6: las filas del widget, escapadas y sin la clase que pisa widgets.js', () => {
  const html = W.resetsHTML([{ key: 'daily', label: 'Diario', title: 'Reset <diario>', value: '6 h 0 min', soon: true }, { key: 'weekly', label: 'Semanal', title: 'S', value: '1 d 13 h', soon: false }], K.esc);
  assert.equal(html,
    '<div class="widget-reset-row gw-reset gw-reset--daily is-soon" title="Reset &lt;diario&gt;"><span class="reset-label">Diario</span><span class="gw-reset__value">6 h 0 min</span></div>' +
    '<div class="widget-reset-row gw-reset gw-reset--weekly" title="S"><span class="reset-label">Semanal</span><span class="gw-reset__value">1 d 13 h</span></div>');
  assert.ok(!/class="[^"]*\breset-value\b/.test(html), 'widgets.js actualiza cada segundo las .reset-value con su temporada fija');
  assert.equal(W.resetsHTML([], K.esc), '');
  assert.equal(W.resetsHTML(null, K.esc), '');
});

test('ESC-6: la temporada sale de lo que guardó header.js de la API', () => {
  assert.equal(W.SEASON_KEY, 'guarida:temporada:v1');
  assert.equal(W.seasonFromCache(JSON.stringify({ end: 1790000000000, t: 1 })), 1790000000000);
  assert.equal(W.seasonFromCache(JSON.stringify({ end: null, t: 1 })), null, 'la API no trajo fecha');
  assert.equal(W.seasonFromCache(JSON.stringify({ end: '2026-12-02' })), null);
  assert.equal(W.seasonFromCache('{roto'), null);
  assert.equal(W.seasonFromCache(null), null);
  assert.match(W.DESC.all_resets, /temporada/);
});

test('ESC-6: el widget se pinta al dibujarse y cada 30 s, sin tocar lo que no cambió', () => {
  const src = fs.readFileSync(path.join(__dirname, '../js/widgets-ui.js'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.match(src, /if \(list\.innerHTML !== html\) list\.innerHTML = html;/);
  assert.match(src, /new root\.MutationObserver\(pintarResets\)\.observe\(box, \{ childList: true \}\)/, 'sin subtree: pintar no se dispara a sí mismo');
  assert.match(src, /root\.setInterval\(pintarResets, 30000\)/);
  assert.match(src, /querySelectorAll\('#widgetsLeft \.widget--resets \.widget-resets-list'\)/);
});
