// Tests de js/ui.js 1.0.0 — resumen y contadores de La Guarida (DEC-028).
// Correr: node --test tests/*.test.cjs
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const UI = require('../js/ui.js');

test('saludo según la hora local', () => {
  const at = h => new Date(2026, 9, 22, h, 0);
  assert.deepEqual([4, 5, 11, 12, 18, 19, 23].map(h => UI.saludo(at(h))),
    ['Buenas noches', 'Buen día', 'Buen día', 'Buenas tardes', 'Buenas tardes', 'Buenas noches', 'Buenas noches']);
});

test('fecha en castellano con hora de dos dígitos', () => {
  assert.equal(UI.fecha(new Date(2026, 9, 22, 2, 5)), 'jueves 22 de octubre · 02:05');
  assert.equal(UI.fecha(new Date(2026, 0, 3, 14, 30)), 'sábado 3 de enero · 14:30');
});

test('cuentas de la Guarida, sin datos de la Factory', () => {
  const c = UI.cuentas({
    favorites: [{}, {}],
    categories: [{ links: [{}, {}, {}] }, { links: [] }, {}],
    apps: [{}], games: [{}, {}]
  });
  assert.deepEqual(c, { favoritos: 2, categorias: 3, enlaces: 3, lanzador: 3 });
  assert.deepEqual(UI.cuentas(undefined), { favoritos: 0, categorias: 0, enlaces: 0, lanzador: 0 });
});

test('badges con singular y plural', () => {
  const html = UI.badgesHTML({ favoritos: 1, categorias: 2, enlaces: 0, lanzador: 1 });
  assert.ok(html.includes('<b>1</b> favorito<'));
  assert.ok(html.includes('<b>2</b> categorías<'));
  assert.ok(html.includes('<b>0</b> enlaces<'));
  assert.ok(html.includes('<b>1</b> app o juego<'));
  assert.equal(UI.plural(3, 'widget', 'widgets'), '3 widgets');
  assert.equal(UI.plural(1, 'widget', 'widgets'), '1 widget');
});

test('ui.js no habla de la Factory ni usa la red', () => {
  const src = require('fs').readFileSync(require('path').join(__dirname, '../js/ui.js'), 'utf8');
  assert.equal(/fetch\(|XMLHttpRequest|status\.md|raw\.githubusercontent|decisi|validaci|backlog/i.test(src.replace(/^\s*(\/\/|\/?\*).*$/gm, '')), false);
});
