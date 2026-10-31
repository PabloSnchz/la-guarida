// Tests del editor, los avisos y «Deshacer» (js/editor.js, RG-5).
// Correr: node --test tests/*.test.cjs
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const E = require('../js/editor.js');

const ROOT = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');

test('reconoce los cinco confirm() de borrado de app.js y ningún otro', () => {
  assert.equal(E.deleteText('¿Eliminar este favorito?'), 'Eliminé el favorito.');
  assert.equal(E.deleteText('¿Eliminar esta categoría y todos sus links?'), 'Eliminé la categoría y sus enlaces.');
  assert.equal(E.deleteText('¿Eliminar este link?'), 'Eliminé el enlace.');
  assert.equal(E.deleteText('¿Eliminar este app?'), 'Eliminé la app.');
  assert.equal(E.deleteText('¿Eliminar este juego?'), 'Eliminé el juego.');
  assert.equal(E.deleteText('¿Seguro que querés salir?'), null);
  assert.equal(E.deleteText(null), null);
});

test('los textos de app.js siguen siendo los que reconozco', () => {
  const app = fs.existsSync(path.join(ROOT, 'js/app.js')) ? read('js/app.js') : '';
  if (!app) return; // en el taller local app.js es un archivo vacío
  const textos = [...app.matchAll(/confirm\('([^']+)'/g)].map(x => x[1]);
  assert.ok(textos.length >= 4, 'encontré los confirm() de app.js');
  for (const m of textos) {
    // «¿Eliminar este ' + (app o juego) + '?»: el texto se arma en dos partes
    const variantes = m.endsWith('?') ? [m] : [m + 'app?', m + 'juego?'];
    for (const v of variantes) assert.ok(E.deleteText(v), 'reconozco: ' + v);
  }
});

test('tipo y texto de cada alert()', () => {
  assert.equal(E.alertKind('❌ El archivo no tiene el formato correcto'), 'error');
  assert.equal(E.alertKind('⚠️ No se pudo guardar. Usá Backup para respaldar.'), 'warn');
  assert.equal(E.alertKind('✅ Datos importados correctamente'), 'ok');
  assert.equal(E.alertKind('El nombre es obligatorio'), 'warn');
  assert.equal(E.alertKind('Primero ingresá la URL'), 'warn');
  assert.equal(E.alertKind('⏳ Extrayendo ícono...'), 'info');
  assert.equal(E.alertText('📥 Extrayendo ícono de GW2...\n\nRevisá Downloads'), 'Extrayendo ícono de GW2... Revisá Downloads');
  assert.equal(E.alertText('✅ Datos importados correctamente'), 'Datos importados correctamente');
});

test('«Deshacer» vuelve exactamente a como estaba, sobre el mismo objeto', () => {
  const state = { favorites: [{ id: 1, name: 'A' }, { id: 2, name: 'B' }], categories: [{ id: 9, links: [{ id: 3 }] }], apps: [], games: [], widgets_left: [], widgets_right: [], theme: 'gato' };
  const foto = E.snapshot(state);
  const mismo = state;
  state.favorites = state.favorites.filter(f => f.id !== 1);
  state.categories[0].links.pop();
  E.restore(state, foto);
  assert.equal(state, mismo, 'mismo objeto: Data.state lo comparten todos los módulos');
  assert.deepEqual(state.favorites.map(f => f.id), [1, 2]);
  assert.equal(state.categories[0].links.length, 1, 'la foto es una copia profunda');
  assert.equal(state.theme, 'gato', 'no toca lo que no es dato');
  E.restore(state, foto); state.favorites.pop();
  assert.equal(foto.favorites.length, 2, 'restaurar no comparte arrays con la foto');
});

test('Deshacer dura 10 s y un guardado posterior lo cancela', () => {
  assert.equal(E.DESHACER_MS, 10000);
  const src = read('js/editor.js');
  assert.ok(/if \(!restaurando\) cancelarDeshacer\(\)/.test(src), 'cualquier otro guardado cancela el Deshacer pendiente');
  assert.ok(/confirmOriginal\.apply/.test(src), 'las preguntas que no son de borrado siguen con confirm()');
});

test('editor plegado: mismos id, lo opcional dentro de «Ícono y emoji»', () => {
  const html = read('index.html');
  const mas = html.slice(html.indexOf('<details class="ge-more">'), html.indexOf('</details>', html.indexOf('<details class="ge-more">')));
  for (const id of ['modalEmoji', 'modalIconUrl', 'modalAutoDetectFaviconBtn', 'modalDownloadFaviconBtn', 'modalExtractIconField'])
    assert.ok(mas.includes('id="' + id + '"'), '#' + id + ' plegado');
  for (const id of ['modalName', 'modalUrl', 'modalCommand', 'modalOpenChrome', 'modalSave'])
    assert.ok(!mas.includes('id="' + id + '"') && html.includes('id="' + id + '"'), '#' + id + ' a la vista');
  assert.ok(html.indexOf('js/editor.js') < html.indexOf('js/data.js'), 'editor.js antes que data.js');
});
