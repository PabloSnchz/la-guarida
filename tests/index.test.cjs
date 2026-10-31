// Tests de index.html (RG-6): La Guarida con el diseño 3.0, ya sin vista previa.
// Correr: node --test tests/*.test.cjs
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const html = read('index.html');
const ids = h => [...h.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
const scripts = h => [...h.matchAll(/<script src="([^"?]+)/g)].map(m => m[1]);

// Los id que buscan app.js, modal.js, data.js, widgets.js, ui.js, shiruvana.js y los módulos nuevos.
const REQUERIDOS = [
  'contenido', 'themeSelect', 'themeStylesheet', 'editModeBtn', 'addFavoriteBtn', 'addCategoryBtn', 'exportBtn', 'importBtn', 'importFile',
  'inicio', 'heroTitle', 'heroDate', 'portalTrigger', 'usualRow', 'usualChips',
  'seccionWidgets', 'widgetCount', 'widgetsLeft', 'seccionFavoritos', 'favCount', 'favoritesGrid',
  'seccionCategorias', 'catCount', 'categoriesGrid', 'launcherPanel', 'launcherCount', 'launcherGamesGrid', 'launcherAppsGrid',
  'modal', 'modalTitle', 'modalName', 'modalUrlField', 'modalUrl', 'modalCommandField', 'modalCommand', 'modalExtractIconField',
  'modalExtractIconBtn', 'modalEmoji', 'modalIconUrl', 'modalOpenChromeField', 'modalOpenChrome', 'modalAutoDetectFaviconBtn',
  'modalDownloadFaviconBtn', 'modalCancel', 'modalSave',
  'ghMoreMenu', 'ghMore', 'ghDot', 'ghBackupInfo', 'ghClocks', 'ghTip'
];

test('ya no es una vista previa', () => {
  assert.ok(!html.includes('<base'), 'sin <base>');
  assert.ok(!html.includes('noindex'), 'se puede indexar como antes');
  assert.ok(!/next\//.test(html), 'no carga nada de next/');
  assert.ok(html.includes('<a class="brand" href="./" aria-label="La Guarida, inicio">'));
  assert.ok(html.includes('<title>🐈‍⬛ La Guarida — Página de Inicio</title>'));
  assert.ok(!scripts(html).includes('js/preview.js'));
});

test('están todos los id que usan los módulos, sin repetidos', () => {
  const n = new Set(ids(html));
  for (const id of REQUERIDOS) assert.ok(n.has(id), '#' + id);
  const dup = ids(html).filter((id, i, a) => a.indexOf(id) !== i);
  assert.deepEqual(dup, []);
  assert.ok(!n.has('heroBadges'), 'los badges del resumen se fueron en RG-2');
});

test('módulos en orden: los del diseño 3.0 antes que los de siempre', () => {
  assert.deepEqual(scripts(html), [
    'js/kit.js', 'js/header.js', 'js/widgets-ui.js', 'js/editor.js',
    'js/data.js', 'js/widgets.js', 'js/drag-drop.js', 'js/modal.js', 'js/app.js', 'js/shiruvana.js', 'js/ui.js'
  ]);
  const css = [...html.matchAll(/<link rel="stylesheet" href="([^"?]+)/g)].map(m => m[1]);
  assert.deepEqual(css, ['css/styles.css', 'css/themes/gato.css', 'css/kit.css', 'css/header.css', 'css/cards.css', 'css/widgets.css', 'css/editor.css']);
});

test('cada recurso relativo existe en el repo', () => {
  const refs = [...html.matchAll(/\s(?:src|href)="([^"#][^"]*)"/g)].map(m => m[1])
    .filter(u => !/^(https?:|data:|mailto:)/.test(u)).map(u => u.split('?')[0]).filter(u => u && u !== './');
  assert.ok(refs.length >= 15);
  for (const r of refs) assert.ok(fs.existsSync(path.join(ROOT, r)), r + ' existe');
});

test('cabecera de dos filas, «⋯» con backup y «Lo de siempre» en Favoritos', () => {
  const header = html.slice(html.indexOf('<header'), html.indexOf('</header>'));
  assert.ok(!/class="hero[\s"]/.test(html));
  for (const id of ['heroTitle', 'heroDate', 'portalTrigger', 'ghClocks', 'ghTip', 'ghDot', 'inicio']) assert.ok(header.includes('id="' + id + '"'), id);
  const more = header.slice(header.indexOf('id="ghMoreMenu"'));
  for (const id of ['exportBtn', 'importBtn']) assert.ok(more.includes('id="' + id + '"'), id);
  assert.ok(more.includes('pablosnchz.github.io/bio/'));
  const fav = html.slice(html.indexOf('id="seccionFavoritos"'), html.indexOf('id="seccionCategorias"'));
  assert.ok(fav.indexOf('id="usualRow"') > 0 && fav.indexOf('id="usualRow"') < fav.indexOf('id="favoritesGrid"'));
});

test('next/ solo queda como redirección a la raíz', () => {
  const n = read('next/index.html');
  assert.ok(n.includes('<meta http-equiv="refresh" content="0; url=../">'));
  assert.ok(n.includes("location.replace('../' + location.hash)"));
  assert.ok(!/<script src=|<link rel="stylesheet"/.test(n), 'no carga nada');
  for (const d of ['next/js', 'next/css']) {
    const p = path.join(ROOT, d);
    assert.ok(!fs.existsSync(p) || fs.readdirSync(p).length === 0, d + ' vacía');
  }
});

test('ningún archivo de la app apunta a next/', () => {
  for (const d of ['js', 'css']) for (const f of fs.readdirSync(path.join(ROOT, d)).filter(x => /\.(js|css)$/.test(x))) {
    const s = read(d + '/' + f).replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
    assert.ok(!/["'(]\.?\.?\/?next\//.test(s), d + '/' + f);
  }
});
