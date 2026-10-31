// Tests de la vista previa next/ (RG-1): misma Guarida, mismos datos, lo nuevo en next/.
// Correr: node --test tests/*.test.cjs
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const rootHtml = read('index.html');
const nextHtml = read('next/index.html');
const ids = html => [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
const scripts = html => [...html.matchAll(/<script src="([^"?]+)/g)].map(m => m[1]);

test('<base href="../"> va antes de cualquier recurso relativo', () => {
  const base = nextHtml.indexOf('<base href="../">');
  assert.ok(base > 0, 'tiene <base>');
  const firstRes = nextHtml.search(/<(link|script|img)\b/);
  assert.ok(base < firstRes, 'el <base> está antes del primer link, script o img');
});

test('cada recurso relativo de next/ existe en el repo', () => {
  const refs = [...nextHtml.matchAll(/\s(?:src|href)="([^"#][^"]*)"/g)].map(m => m[1])
    .filter(u => !/^(https?:|data:|mailto:|\.\.\/$)/.test(u))
    .map(u => u.split('?')[0])
    .filter(u => u && u !== './' && u !== 'next/');
  assert.ok(refs.length >= 10, 'encontró los recursos');
  for (const r of refs) assert.ok(fs.existsSync(path.join(ROOT, r)), r + ' existe');
});

// RG-2: los badges del resumen se fueron (los números ya están en cada panel).
// ui.js los busca con «if (b)», así que sacarlos no rompe nada. Cualquier otro id es obligatorio.
const QUITADOS = new Set(['heroBadges']);

test('misma estructura que La Guarida de siempre (todos los id salvo los quitados a propósito)', () => {
  const n = new Set(ids(nextHtml));
  for (const id of ids(rootHtml)) if (!QUITADOS.has(id)) assert.ok(n.has(id), 'next/ tiene #' + id);
  for (const id of QUITADOS) assert.ok(!n.has(id), '#' + id + ' ya no está');
  const dup = ids(nextHtml).filter((id, i, a) => a.indexOf(id) !== i);
  assert.deepEqual(dup, [], 'ningún id repetido');
});

// Los módulos propios de next/, en orden: van antes que los de la raíz.
const PROPIOS = ['next/js/preview.js', 'next/js/kit.js', 'next/js/header.js', 'next/js/widgets-ui.js'];

test('carga los mismos módulos, en el mismo orden, después de los de next/', () => {
  const r = scripts(rootHtml);
  const n = scripts(nextHtml);
  assert.deepEqual(n.slice(0, PROPIOS.length), PROPIOS);
  assert.deepEqual(n.slice(PROPIOS.length), r);
  assert.ok(nextHtml.includes('href="next/css/kit.css'), 'carga los estilos del kit');
  assert.ok(nextHtml.indexOf('next/css/header.css') > nextHtml.indexOf('css/styles.css'), 'header.css va después de styles.css');
});

test('RG-2: cabecera de dos filas, sin resumen grande', () => {
  const header = nextHtml.slice(nextHtml.indexOf('<header'), nextHtml.indexOf('</header>'));
  assert.ok(!/class="hero[\s"]/.test(nextHtml), 'no queda el resumen grande');
  for (const id of ['heroTitle', 'heroDate', 'portalTrigger', 'ghClocks', 'ghTip', 'ghDot', 'ghBackupInfo', 'inicio'])
    assert.ok(header.includes('id="' + id + '"'), '#' + id + ' vive en la cabecera');
  const more = header.slice(header.indexOf('id="ghMoreMenu"'));
  for (const id of ['exportBtn', 'importBtn']) assert.ok(more.includes('id="' + id + '"'), '#' + id + ' está en «⋯»');
  assert.ok(more.includes('pablosnchz.github.io/bio/'), 'Link in Bio pasa a «⋯»');
  assert.ok(!nextHtml.includes('class="bio-badge"'), 'sin el badge suelto');
});

test('RG-2: «Lo de siempre» es la primera fila de Favoritos', () => {
  const fav = nextHtml.slice(nextHtml.indexOf('id="seccionFavoritos"'), nextHtml.indexOf('id="seccionCategorias"'));
  assert.ok(fav.indexOf('id="usualRow"') > 0, 'está dentro de Favoritos');
  assert.ok(fav.indexOf('id="usualRow"') < fav.indexOf('id="favoritesGrid"'), 'antes de las tarjetas');
});

test('la vista previa no se indexa y su marca vuelve a la raíz', () => {
  assert.ok(nextHtml.includes('<meta name="robots" content="noindex">'));
  assert.ok(nextHtml.includes('<a class="brand" href="next/"'), 'el gato lleva al inicio de la vista previa');
  const pv = read('next/js/preview.js');
  assert.ok(pv.includes("m.href = './'"), 'la marca «Vista previa» vuelve a La Guarida de siempre');
  assert.ok(/a\[href\^="#"\]/.test(pv), 'los enlaces #id se quedan en la vista previa');
});
