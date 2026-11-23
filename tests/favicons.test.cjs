// Tests de los íconos de Favoritos (FAV-1, js/data.js íconos 1.0.0 + css/cards.css 1.1.0).
// Pablo: «Shiruvana-dev y Shiruna-dev se ven iguales, GitHub no se ve, queda raro».
// Correr: node --test tests/*.test.cjs
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const D = require('../js/data.js').Data;
const svg = uri => decodeURIComponent(uri.replace(/^data:image\/svg\+xml,/, ''));
const css = read('css/cards.css').replace(/\/\*[\s\S]*?\*\//g, '');

test('versión y API pública', () => {
  assert.equal(D.ICONOS_VERSION, '1.0.0');
  for (const f of ['sitioPropio', 'iconoSitio', 'esFaviconWeb', 'decorarChips', 'getFaviconHTML']) assert.equal(typeof D[f], 'function', f);
});

test('sitioPropio: reconoce nuestros sitios y GitHub, y nada más', () => {
  const casos = {
    'https://pablosnchz.github.io/gw2-factory-dev/': 'dev',
    'https://pablosnchz.github.io/gw2-factory-dev': 'dev',
    'https://gw2-factory-dev.vercel.app/#metas': 'dev',
    'https://shiruna-gato-negro.github.io/gw2-factory-dev/': 'shiruna',
    'HTTPS://Shiruna-Gato-Negro.github.io/': 'shiruna',
    'https://pablosnchz.github.io/gw2-factory-dashboard/?v=1': 'centro',
    'https://github.com/PabloSnchz': 'github',
    'https://www.github.com': 'github',
    'https://pablosnchz.github.io/gw2-factory-devx/': '',
    'https://gist.github.com/x': '',
    'https://github.community': '',
    'https://pablosnchz.github.io/gw2-wallet-ligero/': '',
    'https://pablosnchz.github.io/la-guarida/': '',
    '': ''
  };
  for (const [u, k] of Object.entries(casos)) assert.equal(D.sitioPropio(u), k, u);
});

test('cuatro íconos distintos; el de mi DEV es la marca y el de Shiruna se distingue', () => {
  const ics = ['dev', 'shiruna', 'centro', 'github'].map(k => svg(D.iconoSitio(k)));
  assert.equal(new Set(ics).size, 4, 'ninguno repetido');
  for (const s of ics) assert.match(s, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 32 32">[\s\S]*<\/svg>$/);
  const marca = read('assets/brand/gato-negro.svg');
  const [dev, shiruna, centro] = ics;
  for (const c of ['#7B5CFF', '#F2B94B', '#0F1117']) assert.ok(dev.includes(c) && marca.includes(c), 'mi DEV usa ' + c + ' como la marca');
  const gato = /<path d="(M8 25V12[^"]+)"/;
  assert.equal(gato.exec(dev)[1], gato.exec(marca)[1], 'mismo gato que la marca');
  assert.equal(gato.exec(shiruna)[1], gato.exec(marca)[1]);
  assert.ok(shiruna.includes('#FF6FAE') && shiruna.includes('#2EC4B6'), 'Shiruna: marco rosa y ojos turquesa');
  assert.ok(!shiruna.includes('#7B5CFF') && !shiruna.includes('#F2B94B'), 'Shiruna no repite mis colores');
  assert.ok(centro.includes('#5A3DDB'), 'Centro de mando: disco violeta');
  assert.ok(/fill="#F0F3F6"/.test(ics[3]) && ics[3].includes('#24292F'), 'GitHub claro sobre oscuro');
  assert.equal(D.iconoSitio('otro'), '');
});

test('getFaviconHTML: nuestros sitios ganan a icon_url y emoji; icon_data los pisa', () => {
  const h = D.getFaviconHTML({ url: 'https://shiruna-gato-negro.github.io/gw2-factory-dev/', icon_url: 'assets/brand/gato-negro.svg', emoji: '⭐' }, 40, 'fav-icon');
  assert.match(h, /^<img class="fav-icon fi-llena" src="data:image\/svg\+xml,[^"]+" alt="" data-sitio="shiruna"/);
  assert.ok(!h.includes('gato-negro.svg') && !h.includes('⭐'));
  assert.ok(!/"[^"]*"[^"]*"/.test(h.match(/src="([^"]*)"/)[1]), 'el data URI no rompe las comillas');
  const propio = D.getFaviconHTML({ url: 'https://github.com/x', icon_data: 'data:image/png;base64,AAA' }, 40, 'fav-icon');
  assert.ok(propio.includes('src="data:image/png;base64,AAA"') && propio.includes('fi-llena') && !propio.includes('data-sitio'));
});

test('getFaviconHTML: favicons de la web llevan fi-web; imágenes elegidas, fi-llena', () => {
  const web = D.getFaviconHTML({ url: 'https://www.reddit.com/r/Guildwars2/' }, 40, 'fav-icon');
  assert.match(web, /^<img class="fav-icon fi-web" src="https:\/\/icon\.horse\/icon\/www\.reddit\.com"/);
  assert.ok(web.includes('google.com/s2/favicons') && web.includes('class="fav-emoji"'), 'conserva los respaldos');
  assert.match(D.getFaviconHTML({ url: 'https://x.com', icon_url: 'https://www.google.com/s2/favicons?domain=x.com&sz=64' }, 40, 'fav-icon'), /class="fav-icon fi-web"/);
  assert.match(D.getFaviconHTML({ url: 'https://x.com', icon_url: 'https://x.com/favicon.ico' }, 40, 'fav-icon'), /class="fav-icon fi-web"/);
  assert.match(D.getFaviconHTML({ url: 'https://copilotstudio.microsoft.com/x', icon_url: 'assets/brand/shiruvana/shiruvana-hola-cara-128.webp' }, 40, 'fav-icon'), /class="fav-icon fi-llena"/);
  assert.match(D.getFaviconHTML({ url: 'https://x.com', emoji: '🎮' }, 40, 'fav-icon'), /^<span class="fav-emoji"/, 'el emoji elegido se respeta');
  assert.match(D.getFaviconHTML({ name: 'sin url' }, 20, 'link-icon'), /^<span class="link-emoji"[^>]*>🔗<\/span>$/);
  assert.match(D.getFaviconHTML({ url: 'https://x.com' }, 20), /^<img class="fi-web"/, 'sin clase base no deja espacios');
});

/** DOM mínimo para los chips de «Lo de siempre». */
function chip(title) {
  const attrs = { title };
  const span = { className: '', innerHTML: '⭐' };
  return {
    span,
    getAttribute: k => (k in attrs ? attrs[k] : null),
    setAttribute: (k, v) => { attrs[k] = v; },
    querySelector: s => (s === 'span[aria-hidden]' ? span : null)
  };
}

test('decorarChips: cambia el emoji por el ícono real, una sola vez, y deja lo desconocido', () => {
  D.state.favorites = [{ id: 1, name: 'Shiruna-dev', url: 'https://shiruna-gato-negro.github.io/gw2-factory-dev/' }, { id: 2, name: 'Github', url: 'https://github.com/PabloSnchz' }];
  D.state.categories = [{ id: 10, name: 'Buscar', emoji: '↔️', links: [{ id: 11, name: 'Google', url: 'https://www.google.com' }] }];
  D.state.apps = [{ id: 101, name: 'Discord', emoji: '💬', icon_url: 'assets/icons/launcher/discord.png' }];
  D.state.games = [];
  const chips = [chip('Shiruna-dev'), chip('Google'), chip('Discord'), chip('No existe')];
  const box = { querySelectorAll: s => (s === '.gn-usual__chip' ? chips : []) };
  assert.equal(D.decorarChips(box), 3);
  assert.equal(chips[0].span.className, 'gn-usual__ico');
  assert.match(chips[0].span.innerHTML, /class="gn-usual__img fi-llena"[^>]*data-sitio="shiruna"/);
  assert.match(chips[1].span.innerHTML, /class="gn-usual__img fi-web" src="https:\/\/icon\.horse\/icon\/www\.google\.com"/, 'Google con su favicon, no con ↔️');
  assert.match(chips[2].span.innerHTML, /assets\/icons\/launcher\/discord\.png/);
  assert.equal(chips[3].span.innerHTML, '⭐', 'lo que no encuentro queda como estaba');
  assert.equal(D.decorarChips(box), 0, 'no lo hace dos veces');
  assert.equal(D.decorarChips(null), 0);
});

test('cards.css: mismo tamaño para todos, disco claro para favicons, aro redondo con Gato Negro', () => {
  const regla = sel => { const m = css.match(new RegExp(sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{([^}]*)\\}')); return m ? m[1] : ''; };
  assert.match(regla('#seccionFavoritos .fav-card img.fav-icon'), /width: 44px !important; height: 44px !important/);
  assert.match(regla('#seccionFavoritos .fav-card img.fi-web'), /background: #F4F4F7 !important/);
  assert.match(regla('#seccionFavoritos .fav-card img.fi-llena'), /padding: 0; object-fit: cover !important/);
  assert.match(regla('body[data-theme="gato"] #seccionFavoritos .fav-card img.fav-icon'), /border-radius: 50% !important/);
  assert.match(regla('.gn-usual__ico img'), /width: 18px !important; height: 18px !important/);
  assert.match(regla('.gn-usual__ico img.fi-web'), /background: #F4F4F7/);
});
