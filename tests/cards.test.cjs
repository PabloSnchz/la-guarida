// Tests de las tarjetas (next/css/cards.css, RG-3).
// Correr: node --test tests/*.test.cjs
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const css = read('next/css/cards.css');
const html = read('next/index.html');
const header = read('next/css/header.css');
// Reglas sin comentarios: [selector, cuerpo]
const rules = [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(m => [m[1].trim(), m[2]]);

test('se carga después de styles.css y header.css (de donde salen los colores)', () => {
  const i = html.indexOf('next/css/cards.css');
  assert.ok(i > html.indexOf('next/css/header.css') && i > html.indexOf('css/styles.css'));
  for (const v of ['--gh-fav', '--gh-cat', '--gh-lan']) assert.ok(header.includes(v + ':'), v + ' definido en header.css');
});

test('un color por sección: cada panel usa el suyo y no el de otra', () => {
  const secc = { '#seccionFavoritos': '--gh-fav', '#seccionCategorias': '--gh-cat', '#launcherPanel': '--gh-lan' };
  for (const [sel, mine] of Object.entries(secc)) {
    const own = rules.filter(([s]) => s.split(',').every(x => x.trim().startsWith(sel)));
    assert.ok(own.some(([, b]) => b.includes(mine)), sel + ' usa ' + mine);
    for (const other of Object.values(secc)) if (other !== mine)
      assert.ok(!own.some(([, b]) => b.includes(other)), sel + ' no usa ' + other);
  }
});

test('los colores fijos nunca son color de texto, salvo en el theme oficial', () => {
  for (const [s, b] of rules) {
    const m = b.match(/(?:^|;)\s*color\s*:\s*([^;]+)/);
    if (!m) continue;
    const fijo = /#[0-9a-f]{3,8}\b|--gh-/i.test(m[1]);
    if (fijo) assert.ok(s.startsWith('body[data-theme="gato"]'), 'texto con color fijo fuera del theme oficial: ' + s);
  }
});

test('estado vacío: el gato «en construcción» existe y la ruta sale de next/css/', () => {
  const m = css.match(/url\("([^"]+)"\)/);
  assert.ok(m, 'tiene imagen');
  const file = path.normalize(path.join(ROOT, 'next/css', m[1]));
  assert.equal(path.relative(ROOT, file).split(path.sep).join('/'), 'assets/brand/gato-en-construccion-256.webp');
  assert.ok(fs.existsSync(file), 'el archivo está en el repo');
  assert.ok(css.includes(':not(:has(.fav-card))') && css.includes(':not(:has(.category-card))'), 'aparece solo sin tarjetas');
});

test('solo CSS: app.js no se toca y next/ no agrega scripts nuevos en RG-3', () => {
  const scripts = [...html.matchAll(/<script src="([^"?]+)/g)].map(m => m[1]);
  assert.deepEqual(scripts.slice(0, 3), ['next/js/preview.js', 'next/js/kit.js', 'next/js/header.js']);
  assert.equal(scripts.filter(s => s.startsWith('next/')).length, 3);
});
