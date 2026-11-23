// Tests de la fluidez de La Guarida (FLU-1: js/data.js fluidez 1.0.0 + css/cards.css 1.2.0).
// Pablo: «cuando scroleamos se siente pesado y hace saltitos».
// Correr: node --test tests/*.test.cjs
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const D = require('../js/data.js').Data;
const css = read('css/cards.css').replace(/\/\*[\s\S]*?\*\//g, '');

/** Ventana mínima: timers a mano, scroll y clases del body. */
function ventana() {
  const timers = [];
  const clases = new Set();
  const oyentes = {};
  const win = {
    timers, clases, oyentes,
    setTimeout(fn, ms) { timers.push({ fn, ms }); return timers.length; },
    clearTimeout(id) { if (id && timers[id - 1]) timers[id - 1].fn = null; },
    addEventListener(ev, fn, opt) { oyentes[ev] = { fn, opt }; },
    document: { body: { classList: { add: c => clases.add(c), remove: c => clases.delete(c) } } }
  };
  return win;
}

// El mismo reloj que arranca widgets.js en cada renderAll (copiado de su forma).
function relojDeWidgets(win) {
  win.setTimeout(function tick() {
    win.document.querySelectorAll && win.document.querySelectorAll('.widget--clock');
    win.setTimeout(tick, 1000);
  }, 1000);
}

test('versión y API', () => {
  assert.equal(D.FLUIDEZ_VERSION, '1.0.0');
  assert.equal(D.QUIETO_MS, 150);
  for (const f of ['esRelojWidgets', 'unSoloReloj', 'marcarScrolleo']) assert.equal(typeof D[f], 'function', f);
});

test('esRelojWidgets: solo el reloj de 1 s de widgets.js', () => {
  assert.equal(D.esRelojWidgets(function tick() { return '.widget--clock'; }, 1000), true);
  assert.equal(D.esRelojWidgets(function tick() { return '.widget--clock'; }, 500), false, 'otro intervalo');
  assert.equal(D.esRelojWidgets(function otro() { return '.widget--clock'; }, 1000), false, 'otro nombre');
  assert.equal(D.esRelojWidgets(function tick() { return 'nada'; }, 1000), false, 'otro trabajo');
  assert.equal(D.esRelojWidgets('tick', 1000), false);
  const widgets = read('js/widgets.js');
  assert.match(widgets, /setTimeout\(function tick\(\) \{\n\s*document\.querySelectorAll\('\.widget--clock'\)/, 'widgets.js sigue arrancando su reloj así');
  assert.match(widgets, /setTimeout\(tick, 1000\);\n\s*\}, 1000\);/);
});

test('unSoloReloj: con 5 dibujos queda un reloj andando, que sigue vuelta tras vuelta', () => {
  const win = ventana();
  assert.equal(D.unSoloReloj(win), true);
  assert.equal(D.unSoloReloj(win), false, 'no se envuelve dos veces');
  for (let i = 0; i < 5; i++) relojDeWidgets(win);
  assert.equal(win.timers.length, 1, 'los otros 4 relojes no arrancan');
  for (let v = 0; v < 3; v++) { const t = win.timers[win.timers.length - 1]; t.fn(); }
  assert.equal(win.timers.length, 4, 'el que anda se vuelve a programar cada segundo');
  relojDeWidgets(win);
  assert.equal(win.timers.length, 4, 'un dibujo nuevo tampoco suma reloj');
  const otros = [];
  win.setTimeout(function tick() { otros.push(1); }, 1000);
  win.setTimeout(() => {}, 1000);
  assert.equal(win.timers.length, 6, 'los demás timers pasan sin cambios');
  assert.equal(D.unSoloReloj({}), false, 'sin setTimeout no hace nada');
});

test('marcarScrolleo: gn-scrolleando mientras baja y 150 ms después; oyente pasivo', () => {
  const win = ventana();
  assert.equal(D.marcarScrolleo(win), true);
  const sc = win.oyentes.scroll;
  assert.deepEqual(sc.opt, { passive: true });
  sc.fn();
  assert.ok(win.clases.has('gn-scrolleando'));
  sc.fn(); sc.fn();
  const vivos = win.timers.filter(t => t.fn);
  assert.equal(vivos.length, 1, 'cada paso reinicia la espera');
  assert.equal(vivos[0].ms, 150);
  vivos[0].fn();
  assert.ok(!win.clases.has('gn-scrolleando'), 'quieta, vuelve todo');
  sc.fn();
  assert.ok(win.clases.has('gn-scrolleando'), 'y vuelve a marcar al bajar otra vez');
  assert.equal(D.marcarScrolleo({}), false);
});

test('en el navegador se instala sola al cargar data.js (antes que widgets.js)', () => {
  const win = ventana();
  win.window = win;
  vm.runInNewContext(read('js/data.js'), win);
  assert.ok(win.setTimeout.__gnUnReloj, 'reloj único instalado');
  assert.ok(win.oyentes.scroll, 'oyente de scroll instalado');
  const html = read('index.html');
  assert.ok(html.indexOf('js/data.js') < html.indexOf('js/widgets.js'), 'data.js carga antes que widgets.js');
});

test('cards.css: sin hover y con lo decorativo en pausa mientras baja', () => {
  const regla = sel => { const m = css.match(new RegExp(sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{([^}]*)\\}')); return m ? m[1] : ''; };
  assert.match(regla('body.gn-scrolleando .app-main'), /pointer-events: none/);
  assert.match(css, /body\[data-theme\]\.gn-scrolleando \.gn-panel::after,\s*body\[data-theme\]\.gn-scrolleando \.esc-chispas i \{ animation-play-state: paused; \}/,
    'más específico que las reglas de universo.css y escena.css, que cargan después');
  assert.match(regla('body[data-theme="gato"]::before'), /will-change: transform/);
});
