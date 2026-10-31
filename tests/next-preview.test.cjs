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

test('misma estructura que La Guarida de siempre (todos los id)', () => {
  const n = new Set(ids(nextHtml));
  for (const id of ids(rootHtml)) assert.ok(n.has(id), 'next/ tiene #' + id);
});

test('carga los mismos módulos, en el mismo orden, después del kit', () => {
  const r = scripts(rootHtml);
  const n = scripts(nextHtml);
  assert.deepEqual(n.slice(0, 2), ['next/js/preview.js', 'next/js/kit.js']);
  assert.deepEqual(n.slice(2), r);
  assert.ok(nextHtml.includes('href="next/css/kit.css'), 'carga los estilos del kit');
});

test('la vista previa no se indexa y su marca vuelve a la raíz', () => {
  assert.ok(nextHtml.includes('<meta name="robots" content="noindex">'));
  assert.ok(nextHtml.includes('<a class="brand" href="next/"'), 'el gato lleva al inicio de la vista previa');
  const pv = read('next/js/preview.js');
  assert.ok(pv.includes("m.href = './'"), 'la marca «Vista previa» vuelve a La Guarida de siempre');
  assert.ok(/a\[href\^="#"\]/.test(pv), 'los enlaces #id se quedan en la vista previa');
});
