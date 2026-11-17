// Tests de la escena (BL-091): la estética de mi sitio, solo con el theme Gato Negro.
// ESC-1 fondo, cápsula y paneles; ESC-2 mi globo con el gato y el consejo adentro;
// ESC-3 el gato reacciona y yo de cuerpo entero en los estados vacíos y en el buscador;
// ESC-4 la bienvenida del día; ESC-5 la paleta de mi sitio y mis poses sin fondo (recorte);
// ESC-6 la cabecera que se esfuma al bajar y un globo que no repite «Ctrl K».
// Correr: node --test tests/*.test.cjs
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const css = read('css/escena.css');
const js = read('js/escena.js');
const E = require('../js/escena.js');

// Reglas sueltas (fuera de @keyframes), con @media desarmado.
function reglas(src) {
  const sinComentarios = src.replace(/\/\*[\s\S]*?\*\//g, '');
  const sinKeyframes = sinComentarios.replace(/@keyframes[^{]+\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '');
  const sinMedia = sinKeyframes.replace(/@media[^{]+\{([\s\S]*?\})\s*\}/g, '$1');
  return [...sinMedia.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(m => ({ sel: m[1].trim(), body: m[2] }));
}
const regla = sel => reglas(css).find(r => r.sel === sel);

// Contraste WCAG
const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const over = (c, a, b) => c.map((v, i) => v * a + b[i] * (1 - a));
const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
// Peor caso del fondo (ESC-5, paleta de mi sitio): obsidiana + luz violeta + línea de la cuadrícula.
const BASE = over([255, 255, 255], 0.03, over([155, 130, 255], 0.18, hex('#0B0B10')));
const TEXTO = hex('#EDEDF2');
const MUTED = over(hex('#A6A6B8'), 0.8, TEXTO); // --gn-muted con la paleta de css/universo.css

test('chispas: tantas como se piden, con su índice, y con tope', () => {
  assert.equal(E.chispasHTML(3), '<i style="--i:0"></i><i style="--i:1"></i><i style="--i:2"></i>');
  assert.equal(E.chispasHTML(0), '');
  assert.equal(E.chispasHTML(-5), '');
  assert.equal((E.chispasHTML(500).match(/<i /g) || []).length, 40);
  assert.equal((E.chispasHTML(E.CHISPAS).match(/<i /g) || []).length, 14);
});

test('solo cambia el theme Gato Negro: toda regla cuelga de body[data-theme="gato"]', () => {
  const rs = reglas(css);
  assert.ok(rs.length >= 40, 'se leyeron las reglas (' + rs.length + ')');
  const sueltas = [];
  for (const r of rs) {
    for (const s of r.sel.split(',').map(x => x.trim())) {
      if (s.startsWith('body[data-theme="gato"]')) continue;
      assert.ok(/^\.esc-[a-z-]+$/.test(s) && /^\s*display:\s*none;\s*$/.test(r.body), 'regla sin scope: ' + s);
      sueltas.push(s);
    }
  }
  assert.deepEqual(sueltas, ['.esc-chispas', '.esc-globo', '.esc-portal-pose', '.esc-bienvenida'], 'lo único suelto es esconder lo nuevo');
});

test('la cabecera no gana backdrop-filter, filter ni transform (los menús fixed del celular siguen en su lugar)', () => {
  assert.ok(!/backdrop-filter/.test(css.replace(/\/\*[\s\S]*?\*\//g, '')));
  for (const r of reglas(css).filter(x => /\.app-header/.test(x.sel))) assert.ok(!/(filter|transform|will-change|contain)\s*:/.test(r.body), r.sel);
});

test('el fondo y las chispas no tapan ni atrapan clics', () => {
  const fondo = regla('body[data-theme="gato"]::before');
  assert.ok(fondo && /position:\s*fixed/.test(fondo.body) && /z-index:\s*-1/.test(fondo.body) && /pointer-events:\s*none/.test(fondo.body));
  const ch = regla('body[data-theme="gato"] .esc-chispas');
  assert.ok(ch && /position:\s*fixed/.test(ch.body) && /z-index:\s*-1/.test(ch.body) && /pointer-events:\s*none/.test(ch.body));
});

test('contraste: pestaña activa, paneles y cabecera sobre el punto más claro del fondo', () => {
  const tab = regla('body[data-theme="gato"] .app-tab[aria-current="true"]');
  const bg = /background:\s*(#[0-9A-Fa-f]{6})/.exec(tab.body)[1], fg = /color:\s*(#[0-9A-Fa-f]{6})/.exec(tab.body)[1];
  assert.ok(cr(hex(fg), hex(bg)) >= 7, 'pestaña activa ' + cr(hex(fg), hex(bg)).toFixed(2));
  const panel = over(hex('#15151D'), 0.9, BASE);
  assert.match(css, /\.gn-panel \{\s*background: rgba\(21, 21, 29, \.9\)/);
  assert.ok(cr(TEXTO, panel) >= 4.5, 'texto');
  assert.ok(cr(MUTED, panel) >= 4.5, 'texto secundario ' + cr(MUTED, panel).toFixed(2));
  const header = over(hex('#0B0B10'), 0.92, BASE);
  assert.match(css, /\.app-header \{ background: rgba\(11, 11, 16, \.92\); \}/);
  assert.ok(cr(MUTED, header) >= 4.5, 'pestañas sobre la cabecera');
});

test('cada panel con el color de su sección y entrando en orden', () => {
  ['seccionWidgets', 'seccionFavoritos', 'seccionCategorias', 'launcherPanel'].forEach((id, i) => {
    const r = regla('body[data-theme="gato"] #' + id);
    assert.ok(r, id);
    assert.match(r.body, /--esc-color:\s*#[0-9A-Fa-f]{6}/);
    assert.match(r.body, new RegExp('--esc-orden:\\s*' + (i + 1) + ';'));
  });
});

test('«reducir movimiento»: sin chispas, entradas ni saltos del gato', () => {
  const m = /@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?\})\s*\}/.exec(css);
  assert.ok(m);
  assert.match(m[1], /\.esc-chispas \{ display: none; \}/);
  assert.match(m[1], /\.gn-panel \{ animation: none; \}/);
  assert.match(m[1], /\.esc-globo \{ animation: none; \}/);
  assert.match(m[1], /\.esc-gato\.is-salta img \{ animation: none; \}/);
  assert.match(m[1], /\.esc-portal-pose \{ animation: none; \}/);
  assert.match(m[1], /\.esc-bienvenida \{ display: none; \}/);
});

// ---- ESC-2: el globo ----
test('el consejo va a mi globo solo con el theme Gato Negro', () => {
  assert.equal(E.dondeConsejo('gato'), 'globo');
  for (const t of ['boveda', 'nord', 'notion', '', null, undefined, 'random']) assert.equal(E.dondeConsejo(t), 'franja', String(t));
});

test('plegado: con consejo siempre abierto; sin consejo, como lo dejaste (la primera vez, abierto)', () => {
  assert.equal(E.plegadoInicial(null, false), false);
  assert.equal(E.plegadoInicial({}, false), false);
  assert.equal(E.plegadoInicial({ plegado: true }, false), true);
  assert.equal(E.plegadoInicial({ plegado: 'true' }, false), false, 'solo un true de verdad');
  assert.equal(E.plegadoInicial({ plegado: false }, false), false);
  assert.equal(E.plegadoInicial({ plegado: true }, true), false, 'un consejo lo abre');
});

test('lo que digo sin consejo: el saludo según la hora y un dato útil, sin repetir «Ctrl K»', () => {
  const a = h => E.lineaDelDia(new Date(2026, 10, 17, h, 30));
  assert.equal(a(4), 'Buenas noches, Pablo.');
  assert.equal(E.lineaDelDia(new Date(2026, 10, 17, 21, 0), 'Último backup: ayer.'), 'Buenas noches, Pablo. Último backup: ayer.');
  assert.equal(E.lineaDelDia(new Date(2026, 10, 17, 21, 0), ''), 'Buenas noches, Pablo.');
  assert.ok(!/Ctrl K/.test(js.replace(/\/\*[\s\S]*?\*\//g, '')), 'el buscador ya está a la vista');
  assert.equal(E.META_KEY, 'guarida:shiruvana:v1', 'la misma clave que lee header.js');
  assert.match(a(5), /^Buen día, Pablo\./);
  assert.match(a(11), /^Buen día/);
  assert.match(a(12), /^Buenas tardes/);
  assert.match(a(18), /^Buenas tardes/);
  assert.match(a(19), /^Buenas noches/);
});

test('el gato: cuatro frases que rotan y, al quinto toque, la queja', () => {
  assert.equal(E.fraseGato(0), '');
  assert.deepEqual([1, 2, 3, 4].map(E.fraseGato), E.FRASES);
  assert.equal(E.fraseGato(5), E.QUEJA);
  assert.equal(E.fraseGato(6), E.FRASES[0]);
  assert.equal(E.fraseGato(9), E.FRASES[3]);
  assert.equal(E.fraseGato(10), E.FRASES[0]);
});

test('el globo: gato con botón, mi cara, el lugar del consejo y el botón de plegar; todas las imágenes existen', () => {
  const h = E.globoHTML('Hola');
  assert.match(h, /<button type="button" class="esc-gato" aria-label="Tocar al gato robot">/);
  assert.match(h, /class="esc-gato-dice" aria-live="polite"/);
  assert.match(h, /<p class="esc-texto">Hola<\/p>/);
  assert.match(h, /<div class="esc-slot"><\/div>/);
  assert.match(h, /class="esc-plegar" aria-expanded="true" aria-label="Plegar mi globo"/);
  const srcs = [...h.matchAll(/src="([^"]+)"/g)].map(m => m[1]);
  assert.equal(srcs.length, 2);
  for (const s of srcs) assert.ok(fs.existsSync(path.join(ROOT, s)), s);
  for (const pose of ['sentado', 'festeja']) assert.ok(fs.existsSync(path.join(ROOT, 'assets/brand/gato/gato-' + pose + '.webp')), pose);
  assert.match(js, /gato\('festeja', fraseGato\(toques\)\)/);
});

test('el globo queda debajo del portal, del editor y de los avisos, y no tapa la página', () => {
  const g = regla('body[data-theme="gato"] .esc-globo');
  assert.match(g.body, /position: fixed;/);
  const z = +/z-index: (\d+)/.exec(g.body)[1];
  assert.ok(z < 9000, 'portal 9000, editor 10000, avisos 10002');
  assert.ok(z > 120, 'por encima de los menús y la cabecera');
  assert.match(regla('body[data-theme="gato"] .app-main').body, /padding-bottom: 150px;/);
  assert.match(regla('body[data-theme="gato"]:has(details.gn-menu[open]) .esc-globo').body, /display: none;/);
});

test('el consejo adentro del globo: sin posición propia y con su cara; el globo no repite la mía', () => {
  const t = regla('body[data-theme="gato"] .esc-slot .gn-toast');
  assert.match(t.body, /position: static;/);
  assert.match(t.body, /box-shadow: none;/);
  assert.match(regla('body[data-theme="gato"] .esc-slot .gn-toast[hidden]').body, /display: none;/);
  const sels = reglas(css).filter(r => /display: none;/.test(r.body)).map(r => r.sel).join('\n');
  for (const c of ['.esc-cara', '.esc-nombre', '.esc-texto']) assert.ok(sels.includes('.esc-globo.con-consejo ' + c), c);
});

test('contraste del globo: texto, mi nombre y lo que dice el gato', () => {
  const g = regla('body[data-theme="gato"] .esc-globo');
  assert.match(g.body, /background: rgba\(21, 21, 29, \.97\);/);
  const fondo = over(hex('#15151D'), 0.97, BASE);
  assert.ok(cr(TEXTO, fondo) >= 4.5, 'texto');
  const nombre = /color: (#[0-9A-Fa-f]{6})/.exec(regla('body[data-theme="gato"] .esc-nombre').body)[1];
  assert.ok(cr(hex(nombre), fondo) >= 4.5, 'nombre ' + cr(hex(nombre), fondo).toFixed(2));
  const d = regla('body[data-theme="gato"] .esc-gato-dice').body;
  assert.ok(cr(hex(/color: (#[0-9A-Fa-f]{6})/.exec(d)[1]), hex(/background: (#[0-9A-Fa-f]{6})/.exec(d)[1])) >= 7);
});

test('escena.js no sale a la red, guarda solo { plegado, bienvenida } en su clave y no repite el globo', () => {
  const codigo = js.replace(/\/\*[\s\S]*?\*\//g, '');
  assert.ok(!/fetch|XMLHttpRequest|sessionStorage|cookie/.test(codigo));
  assert.equal(E.KEY, 'guarida:escena:v1');
  assert.deepEqual([...codigo.matchAll(/localStorage\.(\w+)\(/g)].map(m => m[1]).sort(), ['getItem', 'setItem']);
  assert.match(codigo, /localStorage\.setItem\(KEY, JSON\.stringify\(v\)\)/);
  assert.deepEqual([...codigo.matchAll(/store\(([^)]*)\)/g)].map(m => m[1]).filter(a => a !== 'v'), ['g'], 'store solo desde anotar');
  assert.deepEqual([...codigo.matchAll(/anotar\((\{[^)]*\})\)/g)].map(m => m[1]), ['{ plegado: si }', '{ bienvenida: hoy }']);
  assert.match(codigo, /if \(\$\('\.esc-globo'\)\) return;/);
  assert.match(codigo, /if \(!\$\('\.esc-chispas'\)\)/);
  assert.match(codigo, /setAttribute\('aria-hidden', 'true'\)/);
});

test('el consejo sigue al theme y a shiruvana.js: observo data-theme, #ghTip y el hidden del consejo', () => {
  const codigo = js.replace(/\/\*[\s\S]*?\*\//g, '');
  assert.match(codigo, /observe\(doc\.body, \{ attributes: true, attributeFilter: \['data-theme'\] \}\)/);
  assert.match(codigo, /observe\(tip, \{ childList: true \}\)/);
  assert.match(codigo, /attributeFilter: \['hidden'\], subtree: true/);
  assert.match(codigo, /if \(hay && !antes\) plegar\(false, false\);/, 'un consejo nuevo abre el globo sin pisar lo guardado');
  assert.match(codigo, /if \(t && dest && t\.parentNode !== dest\) dest\.appendChild\(t\);/, 'sin mover de más (no hay bucle con #ghTip)');
});

// ---- ESC-3: el gato reacciona y yo de cuerpo entero ----
test('el gato reacciona: festeja lo que salió bien, camina inquieto con advertencias y errores', () => {
  assert.deepEqual(E.reaccion('guardado'), { pose: 'festeja', frase: '¡Guardado!' });
  assert.deepEqual(E.reaccion('backup'), { pose: 'festeja', frase: 'Backup a salvo.' });
  assert.equal(E.reaccion('ok').pose, 'festeja');
  assert.equal(E.reaccion('warn').pose, 'camina');
  assert.equal(E.reaccion('error').pose, 'camina');
  for (const x of ['info', '', undefined, 'toString', 'constructor', '__proto__']) assert.equal(E.reaccion(x), null, String(x));
  assert.equal(E.reaccion('info'), null, 'los avisos de borrado («Deshacer») son info: el gato no festeja un borrado');
  for (const r of Object.values(E.REACCIONES)) {
    assert.ok(fs.existsSync(path.join(ROOT, 'assets/brand/gato/gato-' + r.pose + '.webp')), r.pose);
    assert.ok(r.frase.length > 0 && r.frase.length <= 30, 'frase corta: ' + r.frase);
  }
});

test('tipo de aviso del kit por su clase', () => {
  assert.equal(E.tipoAviso('gk-toast gk-toast--ok'), 'ok');
  assert.equal(E.tipoAviso('gk-toast gk-toast--warn'), 'warn');
  assert.equal(E.tipoAviso('gk-toast--error gk-toast'), 'error');
  assert.equal(E.tipoAviso('gk-toast'), '');
  assert.equal(E.tipoAviso('xgk-toast--ok'), '');
  assert.equal(E.tipoAviso(undefined), '');
});

test('en el buscador: saludo con el buscador vacío y pienso cuando escribís; las poses existen', () => {
  assert.equal(E.posePortal(''), 'saluda');
  assert.equal(E.posePortal('   '), 'saluda');
  assert.equal(E.posePortal(null), 'saluda');
  assert.equal(E.posePortal('bov'), 'pensando');
  for (const p of ['saluda', 'pensando']) assert.ok(fs.existsSync(path.join(ROOT, E.CUERPO + p + '.webp')), p);
  assert.match(regla('body[data-theme="gato"] .gh-portal-fig').body, /display: none;/, 'el retrato de header.js se va solo con Gato Negro');
  const p = regla('body[data-theme="gato"] .esc-portal-pose').body;
  assert.ok(!/mix-blend|mask-image/.test(p), 'ESC-5: sin blend ni máscara (dejaban un rectángulo negro)');
  assert.match(p, /drop-shadow/);
  assert.match(p, /pointer-events: none;/);
  assert.match(css, /@media \(max-width: 1000px\) \{ body\[data-theme="gato"\] \.esc-portal-pose \{ display: none; \} \}/);
});

test('estados vacíos: mi pose sin fondo (el recorte) y un texto que dice qué hacer', () => {
  const casos = [
    ['body[data-theme="gato"] #favoritesGrid:not(:has(.fav-card))::before', 'cuerpo-sentada', /Favorito/],
    ['body[data-theme="gato"] #categoriesGrid:not(:has(.category-card))::before', 'cuerpo-saluda', /Categoría/],
    ['body[data-theme="gato"] .launcher-grid:not(:has(.launcher-item))::before', 'cuerpo-pensando', /«\+»/]
  ];
  const comun = reglas(css).find(r => r.sel.split(',').map(s => s.trim()).length === 3 && r.sel.includes('#favoritesGrid'));
  assert.ok(comun, 'regla común de los tres');
  assert.ok(!/mix-blend/.test(comun.body), 'sin blend');
  assert.match(comun.body, /grid-column: 1 \/ -1;/);
  for (const [sel, pose, texto] of casos) {
    const r = reglas(css).filter(x => x.sel === sel).map(x => x.body).join('\n');
    // La pose recortada por escena.js; sin recorte, nada (nunca el webp con fondo negro)
    assert.match(r, new RegExp('background-image: var\\(--esc-p-' + pose.replace('cuerpo-', '') + ', none\\);'), sel);
    assert.ok(!/url\(/.test(r), 'sin la imagen con fondo');
    assert.ok(E.POSES.includes(pose.replace('cuerpo-', '')), pose + ' se recorta');
    assert.ok(fs.existsSync(path.join(ROOT, E.CUERPO + pose.replace('cuerpo-', '') + '.webp')), pose + ' existe');
    assert.match(/content: "([^"]+)"/.exec(r)[1], texto);
  }
  assert.ok(cr(MUTED, over(hex('#15151D'), 0.9, BASE)) >= 4.5, 'el texto se lee');
});

test('el gato escucha sin tocar a nadie: «Guardar» con el editor cerrado, el backup y la región de avisos', () => {
  const codigo = js.replace(/\/\*[\s\S]*?\*\//g, '');
  assert.match(codigo, /if \(t\.closest\('#exportBtn'\)\) \{ reaccionar\('backup'\); return; \}/);
  assert.match(codigo, /if \(m && m\.hidden\) reaccionar\('guardado'\);/, 'solo si el editor se cerró (se guardó de verdad)');
  assert.match(codigo, /\}, true\);/, 'en captura: antes de que app.js re-dibuje');
  assert.match(codigo, /region\.getAttribute\('data-esc'\)\) return;/, 'escucha la región una sola vez');
  assert.match(codigo, /querySelectorAll\('\.gk-toasts, \.gn-portal'\)/);
  assert.ok(!/GNKit\.notify\s*=|root\.alert\s*=|root\.confirm\s*=/.test(codigo), 'no pisa nada del kit ni del editor');
});

// ---- ESC-4: la bienvenida del día ----
test('la bienvenida toca una vez por día, solo con Gato Negro y sin «reducir movimiento»', () => {
  const hoy = E.diaKey(new Date(2026, 10, 17, 9, 0));
  assert.equal(hoy, '2026-11-17');
  assert.equal(E.diaKey(new Date(2026, 0, 5, 23, 59)), '2026-1-5');
  assert.equal(E.tocaBienvenida(null, hoy, 'gato', false), true, 'la primera vez');
  assert.equal(E.tocaBienvenida({ plegado: true }, hoy, 'gato', false), true);
  assert.equal(E.tocaBienvenida({ bienvenida: '2026-11-16' }, hoy, 'gato', false), true, 'otro día');
  assert.equal(E.tocaBienvenida({ bienvenida: hoy }, hoy, 'gato', false), false, 'hoy ya la viste');
  assert.equal(E.tocaBienvenida(null, hoy, 'nord', false), false, 'otro theme');
  assert.equal(E.tocaBienvenida(null, hoy, 'gato', true), false, 'reducir movimiento');
  assert.ok(E.BIENVENIDA_MS >= 2500 && E.BIENVENIDA_MS <= 4000, 'unos 3 s');
});

test('la bienvenida: ojos, saludo de la hora y cómo pasarla; encima de todo y con buen contraste', () => {
  const h = E.bienvenidaHTML(new Date(2026, 10, 17, 21, 0));
  assert.match(h, /<div class="esc-ojos"><i><\/i><i><\/i><\/div>/);
  assert.match(h, /Buenas noches, Pablo/);
  assert.match(h, /Tocá para pasar/);
  assert.equal(E.saludo(new Date(2026, 10, 17, 8, 0)), 'Buen día');
  const b = regla('body[data-theme="gato"] .esc-bienvenida').body;
  assert.ok(+/z-index: (\d+)/.exec(b)[1] > 10002, 'por encima de los avisos del kit');
  assert.match(b, /position: fixed; inset: 0;/);
  assert.match(b, /animation: escApaga \.9s ease 2\.2s both;/, 'se apaga sola');
  const p = regla('body[data-theme="gato"] .esc-bv-pasar').body;
  assert.ok(cr(hex(/color: (#[0-9A-Fa-f]{6})/.exec(p)[1]), hex('#000000')) >= 7);
  const codigo = js.replace(/\/\*[\s\S]*?\*\//g, '');
  assert.match(codigo, /capa\.addEventListener\('click', cerrar\);/);
  assert.match(codigo, /doc\.addEventListener\('keydown', cerrar, true\);/);
  assert.match(codigo, /doc\.removeEventListener\('keydown', cerrar, true\);/, 'no deja oyentes colgados');
  assert.match(codigo, /setAttribute\('aria-hidden', 'true'\); \/\/ el saludo ya está en el h1/);
});

test('index.html carga la escena al final (y después el universo) y con versión', () => {
  const html = read('index.html');
  const links = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(m => m[1]);
  assert.equal(links[links.length - 2], 'css/escena.css?v=' + E.VERSION);
  assert.match(links[links.length - 1], /^css\/universo\.css\?v=\d+\.\d+\.\d+$/);
  const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]);
  assert.equal(scripts[scripts.length - 1], 'js/escena.js?v=' + E.VERSION);
  assert.match(css, new RegExp('\\(' + E.VERSION.replace(/\./g, '\\.') + ', '));
});

// ---- ESC-5: mis poses sin fondo ----
// Imagen de prueba: fondo negro, una figura clara con un hueco negro grande (entre brazo y
// cuerpo), una pupila negra de 1 px y ruido de compresión casi negro en el fondo.
function lienzo(w, h, pintar) {
  const d = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const p = (y * w + x) * 4, c = pintar(x, y);
    d[p] = c[0]; d[p + 1] = c[1]; d[p + 2] = c[2]; d[p + 3] = 255;
  }
  return d;
}
const A = (d, w, x, y) => d[(y * w + x) * 4 + 3];

test('recorte: el negro del borde y los huecos grandes se van; la figura, las pupilas y los colores quedan', () => {
  const w = 60, h = 60;
  const d = lienzo(w, h, (x, y) => {
    if (x === 30 && y === 12) return [0, 0, 0];                       // pupila
    if (x >= 10 && x < 50 && y >= 5 && y < 55) {
      if (x >= 20 && x < 40 && y >= 25 && y < 45) return [3, 2, 4];   // hueco grande encerrado
      return [200, 150, 90];
    }
    return [(x * 7) % 12, (y * 5) % 12, 6];                            // fondo con ruido < 14
  });
  const antes = Array.from(d);
  const fondo = E.recorte(d, w, h);
  assert.equal(A(d, w, 0, 0), 0, 'esquina');
  assert.equal(A(d, w, 5, 30), 0, 'fondo con ruido');
  assert.equal(A(d, w, 30, 35), 0, 'hueco grande: transparente');
  assert.equal(A(d, w, 30, 12), 255, 'la pupila sigue');
  assert.equal(A(d, w, 15, 15), 255, 'figura');
  assert.ok(A(d, w, 10, 30) < 255, 'el borde se suaviza');
  for (let i = 0; i < d.length; i++) if (i % 4 !== 3) assert.equal(d[i], antes[i], 'el color no cambia');
  assert.equal(fondo, w * h - 40 * 50 + 20 * 20, 'cuenta el fondo');
});

test('recorte: hueco chico encerrado queda; umbral y hueco configurables; alfa previo se respeta', () => {
  const w = 40, h = 40;
  const pinta = (x, y) => (x >= 5 && x < 35 && y >= 5 && y < 35 && !(x >= 18 && x < 20 && y >= 18 && y < 20)) ? [180, 180, 180] : [0, 0, 0];
  const d = lienzo(w, h, pinta);
  E.recorte(d, w, h);
  assert.equal(A(d, w, 19, 19), 255, '4 px de 1600 (< 0,4 %): es parte de la figura');
  const d2 = lienzo(w, h, pinta);
  E.recorte(d2, w, h, 14, 0.001);
  assert.ok(A(d2, w, 19, 19) < 128, 'con un hueco mínimo menor, se va (queda casi transparente por el suavizado)');
  const d3 = lienzo(w, h, (x, y) => (x > 10 && x < 30 && y > 10 && y < 30) ? [20, 20, 20] : [0, 0, 0]);
  E.recorte(d3, w, h, 30);
  assert.equal(A(d3, w, 20, 20), 0, 'con umbral 30, un gris 20 es fondo');
  const d4 = lienzo(w, h, pinta);
  d4[(20 * w + 8) * 4 + 3] = 40;
  E.recorte(d4, w, h);
  assert.equal(A(d4, w, 8, 20), 40, 'nunca sube el alfa que ya tenía');
  assert.equal(E.UMBRAL, 14);
  assert.equal(E.HUECO, 0.004);
  assert.deepEqual(E.POSES, ['sentada', 'saluda', 'pensando']);
  for (const p of E.POSES) assert.ok(fs.existsSync(path.join(ROOT, E.CUERPO + p + '.webp')), p);
});

test('recorte: figura que toca el borde y una imagen toda negra', () => {
  const w = 20, h = 20;
  const d = lienzo(w, h, (x) => x < 10 ? [0, 0, 0] : [255, 255, 255]);
  E.recorte(d, w, h);
  assert.equal(A(d, w, 2, 10), 0);
  assert.equal(A(d, w, 18, 10), 255, 'lo claro que toca el borde queda');
  const n = lienzo(8, 8, () => [0, 0, 0]);
  assert.equal(E.recorte(n, 8, 8), 64);
  for (let i = 3; i < n.length; i += 4) assert.equal(n[i], 0);
});

test('la barra del día: cuánto va del día, en %', () => {
  assert.equal(E.avanceDia(new Date(2026, 10, 17, 0, 0)), 0);
  assert.equal(E.avanceDia(new Date(2026, 10, 17, 12, 0)), 50);
  assert.equal(E.avanceDia(new Date(2026, 10, 17, 6, 0)), 25);
  assert.equal(E.avanceDia(new Date(2026, 10, 17, 23, 59)), 99.9);
});

test('ESC-5 en escena.js: recorto en canvas, sin red; las poses salen como --esc-p-<pose> y la entrada se marca una vez', () => {
  const codigo = js.replace(/\/\*[\s\S]*?\*\//g, '');
  assert.match(codigo, /getImageData\(0, 0, w, h\)/);
  assert.match(codigo, /recorte\(d\.data, w, h\)/);
  assert.match(codigo, /URLs\.createObjectURL\(b\)/);
  assert.match(codigo, /st\.setProperty\('--esc-p-' \+ p, 'url\("' \+ u \+ '"\)'\)/);
  assert.match(codigo, /classList\.add\('esc-p-' \+ p\)/);
  assert.match(codigo, /if \(doc\.body\.getAttribute\('data-theme'\) !== 'gato' \|\| !st \|\| !st\.setProperty\) return;/, 'solo con Gato Negro y si hay dónde ponerlas');
  assert.match(codigo, /if \(recortes\[url\]\) return recortes\[url\];/, 'una vez por imagen');
  assert.match(codigo, /classList\.add\('esc-listo'\)/);
  assert.match(codigo, /setProperty\('--esc-dia'/);
  assert.match(codigo, /fig\.hidden = true; \/\/ aparece cuando la pose ya no tiene fondo/);
});

test('recorte: el fondo se siembra en los cuatro bordes y se expande en las cuatro direcciones; el borde queda suave', () => {
  const w = 20, h = 20;
  // Blanco, con un bolsillo negro abierto solo a la izquierda (filas 5–14, x 0–9) y una
  // franja negra abierta solo abajo (filas 17–19, x 3–16). Con hueco 1 nada se va «por grande».
  const d = lienzo(w, h, (x, y) => ((y >= 5 && y < 15 && x < 10) || (y >= 17 && x >= 3 && x < 17)) ? [0, 0, 0] : [230, 230, 230]);
  E.recorte(d, w, h, 14, 1);
  assert.equal(A(d, w, 8, 10), 0, 'el bolsillo se vacía desde el borde izquierdo hacia la derecha');
  assert.equal(A(d, w, 10, 18), 0, 'la franja de abajo es fondo');
  // Un gris oscuro (25) no es negro: con el umbral de siempre, nada es fondo
  const g = lienzo(w, h, () => [25, 25, 25]);
  assert.equal(E.recorte(g, w, h), 0, 'el gris oscuro (pelo, sombras) queda');
  // Suavizado: entre el borde (0) y la figura (255) hay valores intermedios
  const e = lienzo(w, h, (x) => x < 6 ? [0, 0, 0] : [230, 230, 230]);
  E.recorte(e, w, h);
  const a = A(e, w, 7, 10);
  assert.ok(a > 0 && a < 255, 'alfa intermedio en el borde: ' + a);
  assert.equal(A(e, w, 12, 10), 255);
});

test('ESC-6: la cabecera toma su fondo recién cuando bajás', () => {
  assert.equal(E.bajo(0), false);
  assert.equal(E.bajo(4), false);
  assert.equal(E.bajo(5), true);
  assert.equal(E.bajo(undefined), false);
  assert.equal(E.bajo('120'), true);
  const codigo = js.replace(/\/\*[\s\S]*?\*\//g, '');
  assert.match(codigo, /root\.addEventListener\('scroll', marcarScroll, \{ passive: true \}\)/);
  assert.match(codigo, /classList\.toggle\('esc-bajo'/);
});
