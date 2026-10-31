// Tests de next/js/kit.js 1.0.0 — reloj común y avisos de La Guarida (RG-1).
// Correr: node --test tests/*.test.cjs
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const K = require('../next/js/kit.js');

const T = s => Date.parse(s);
const MIN = 60000, H = 60 * MIN, D = 24 * H;

test('reset diario: la próxima medianoche UTC', () => {
  assert.equal(K.nextDaily(T('2026-10-31T17:00:00Z')), T('2026-11-01T00:00:00Z'));
  assert.equal(K.nextDaily(T('2026-11-01T00:00:00Z')), T('2026-11-02T00:00:00Z'), 'justo a las 00:00 ya cuenta el siguiente');
  assert.equal(K.nextDaily(T('2026-12-31T23:59:00Z')), T('2027-01-01T00:00:00Z'), 'cruza el año');
});

test('reset semanal: lunes 07:30 UTC', () => {
  assert.equal(K.nextWeekly(T('2026-10-31T17:00:00Z')), T('2026-11-02T07:30:00Z'), 'sábado → lunes');
  assert.equal(K.nextWeekly(T('2026-11-02T07:29:00Z')), T('2026-11-02T07:30:00Z'), 'lunes antes de la hora → ese mismo lunes');
  assert.equal(K.nextWeekly(T('2026-11-02T07:30:00Z')), T('2026-11-09T07:30:00Z'), 'lunes a la hora → el lunes siguiente');
  assert.equal(K.nextWeekly(T('2026-11-01T23:00:00Z')), T('2026-11-02T07:30:00Z'), 'domingo → lunes');
});

test('duración en castellano', () => {
  assert.equal(K.dur(8 * H + 5 * MIN + 30000), '8 h 5 min');
  assert.equal(K.dur(D + 17 * H + 40 * MIN), '1 d 17 h');
  assert.equal(K.dur(42 * MIN), '42 min');
  assert.equal(K.dur(30000), 'menos de 1 min');
  assert.equal(K.dur(0), '—');
  assert.equal(K.dur(-5), '—');
  assert.equal(K.dur(NaN), '—');
});

test('«está cerca» con la regla de La Bóveda', () => {
  assert.equal(K.soon('daily', 59 * MIN), true);
  assert.equal(K.soon('daily', H), false);
  assert.equal(K.soon('weekly', 23 * H), true);
  assert.equal(K.soon('weekly', D), false);
  assert.equal(K.soon('season', 2 * D), true);
  assert.equal(K.soon('season', 3 * D), false);
  assert.equal(K.soon('daily', 0), false, 'vencido no brilla');
  assert.equal(K.soon('otro', 1), false);
});

test('relojes de la cabecera para un instante', () => {
  const now = T('2026-11-01T23:30:00Z');
  const c = K.clocks(now);
  assert.deepEqual(c.map(x => x.key), ['local', 'daily', 'weekly']);
  assert.equal(c[1].value, '30 min');
  assert.equal(c[1].soon, true);
  assert.equal(c[2].value, '8 h 0 min');
  assert.equal(c[2].soon, true);
  assert.match(c[0].value, /^\d\d:\d\d$/);
  const s = K.clocks(now, { seasonEnd: now + 34 * D });
  assert.equal(s[3].key, 'season');
  assert.equal(s[3].value, '34 d 0 h');
  assert.equal(K.clocks(now, { seasonEnd: now - 1 })[3].value, 'terminó');
});

test('reloj en HTML: escapa y marca el dorado', () => {
  const html = K.clockHTML({ id: 'cD', label: 'Diario <b>', value: '30 min', icon: 'x.png', soon: true, title: 'a"b' });
  assert.ok(html.includes('class="gk-clk is-soon"'));
  assert.ok(html.includes('Diario &lt;b&gt;'));
  assert.ok(html.includes('title="a&quot;b"'));
  assert.ok(html.includes('<img class="gk-clk__icon" src="x.png" alt=""'));
  assert.ok(!K.clockHTML({ label: 'L', value: '1' }).includes('<img'), 'sin ícono no hay <img>');
});

test('kit.js no usa las ventanitas del navegador ni la red', () => {
  const src = fs.readFileSync(path.join(__dirname, '../next/js/kit.js'), 'utf8').replace(/^\s*(\/\/|\/?\*).*$/gm, '');
  assert.equal(/\balert\(|\bprompt\(|window\.confirm|root\.confirm|fetch\(|XMLHttpRequest|localStorage/.test(src), false);
});
