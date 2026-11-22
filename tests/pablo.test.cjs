// Tests de css/pablo.css (PAB-1): Pablo a mi lado en Favoritos, mirándome.
// Solo con el theme Gato Negro, solo cuando aparezco yo, yo arriba y él al costado,
// sin tapar el texto y cargado antes de css/universo.css. Correr: node --test tests/*.test.cjs
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const css = fs.readFileSync(path.join(ROOT, 'css/pablo.css'), 'utf8');
const sin = css.replace(/\/\*[\s\S]*?\*\//g, '');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

function reglas(src) {
  const plano = src.replace(/@media[^{]+\{([\s\S]*?\})\s*\}/g, '$1');
  return [...plano.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(m => ({ sel: m[1].trim(), body: m[2] }));
}
const prop = (body, p) => { const m = new RegExp('(?:^|[;\\s])' + p + ':\\s*([^;]+);').exec(body); return m ? m[1].trim() : null; };
const FIG = 'body[data-theme="gato"].esc-p-saluda #seccionFavoritos.gn-panel::after';
const base = () => reglas(sin.replace(/@media[^{]+\{[\s\S]*?\}\s*\}/g, ''));
const cel = () => { const m = /@media \(max-width: 760px\) \{([\s\S]*?\})\s*\}/.exec(sin); return m ? reglas(m[1]) : []; };

test('solo theme Gato Negro y solo cuando aparezco yo (mi pose ya sin fondo)', () => {
  const R = reglas(sin);
  assert.ok(R.length >= 4);
  for (const r of R) for (const s of r.sel.split(',').map(x => x.trim())) {
    assert.ok(s.startsWith('body[data-theme="gato"].esc-p-saluda #seccionFavoritos'), 'fuera de lugar: ' + s);
  }
});

test('yo arriba y Pablo al costado, mirándome; su imagen es la del Centro de mando', () => {
  const f = base().find(r => r.sel === FIG);
  assert.ok(f, 'la figura de Favoritos');
  const capas = prop(f.body, 'background').split(/,\s*(?![^()]*\))/).map(s => s.trim());
  assert.equal(capas.length, 2, 'dos capas: yo y Pablo');
  assert.match(capas[0], /^var\(--esc-asoma\) left /, 'mi pose es la primera capa (va arriba)');
  assert.match(capas[1], /^url\("https:\/\/pablosnchz\.github\.io\/gw2-factory-dashboard\/assets\/pablo\/pablo-holo\.webp"\) right 0 /, 'Pablo a mi derecha, mirándome');
  const alto = Number(/auto (\d+)px/.exec(capas[1])[1]);
  assert.ok(alto < 224, 'él un poco más chico que yo (mi pose a 150 px de ancho mide 224)');
  assert.match(capas[1], /top \d+px/, 'y un poco más atrás (más abajo)');
  assert.ok(!/content\s*:/.test(f.body), 'no se muestra solo: depende de que aparezca yo (universo.css)');
});

test('el texto les deja lugar a los dos', () => {
  const f = base().find(r => r.sel === FIG);
  const pad = base().find(r => r.sel.includes('.gn-panel__head') && r.sel.includes('.gn-panel__desc'));
  assert.ok(parseInt(prop(pad.body, 'padding-right'), 10) >= parseInt(prop(f.body, 'width'), 10) - 24);
});

test('celular: los dos más chicos, con lugar para el texto', () => {
  const C = cel();
  const f = C.find(r => r.sel === FIG);
  assert.ok(f, 'hay regla para el celular');
  assert.equal(prop(f.body, 'background-size').split(',').length, 2, 'dos capas');
  const pad = C.find(r => r.sel.includes('.gn-panel__head'));
  assert.ok(parseInt(prop(pad.body, 'padding-right'), 10) >= parseInt(prop(f.body, 'width'), 10) - 24);
  assert.ok(parseInt(prop(f.body, 'width'), 10) < 224, 'más chico que en la compu');
});

test('index.html la carga justo antes de css/universo.css, que sigue última', () => {
  const links = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(m => m[1]);
  const i = links.indexOf('css/pablo.css?v=1.0.0');
  assert.ok(i > 0, 'cargada con su versión');
  assert.equal(links[i + 1].split('?')[0], 'css/universo.css');
  assert.equal(i + 1, links.length - 1);
  assert.match(css, /\(1\.0\.0, \d{4}-\d{2}-\d{2}, PAB-1\)/, 'la versión del encabezado es la de index.html');
});
