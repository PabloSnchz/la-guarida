// Tests de los widgets sin ventanitas del navegador (next/js/widgets-ui.js, RG-4).
// Correr: node --test tests/*.test.cjs
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const W = require('../next/js/widgets-ui.js');

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
  const src = fs.readFileSync(path.join(__dirname, '../next/js/widgets-ui.js'), 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
  assert.ok(!/\b(prompt|alert|confirm)\s*\(/.test(src), 'no usa prompt/alert/confirm');
  assert.ok(!/apiKey|accessToken|clientId|AIza/.test(src), 'no copia claves de widgets.js');
  assert.ok(src.includes("addEventListener('click'") && /}, true\);/.test(src), 'escucha en captura, antes que widgets.js');
});

test('la fila de temporada del widget queda oculta (la cabecera ya la muestra bien)', () => {
  const css = fs.readFileSync(path.join(__dirname, '../next/css/widgets.css'), 'utf8');
  assert.ok(css.includes('.widget--resets .widget-reset-row:nth-child(3) { display: none; }'));
  const html = fs.readFileSync(path.join(__dirname, '../next/index.html'), 'utf8');
  assert.ok(html.indexOf('next/css/widgets.css') > html.indexOf('css/styles.css'));
});
