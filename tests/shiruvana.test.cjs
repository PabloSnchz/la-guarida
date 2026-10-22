// Tests de js/shiruvana.js 2.0.0 — Shiruvana anfitriona de La Guarida (DEC-028).
// Correr: node --test tests/*.test.cjs
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const S = require('../js/shiruvana.js');

const DIA = 24 * 60 * 60 * 1000;
const state = {
  favorites: [
    { id: 1, name: 'Wiki GW2', url: 'https://wiki.guildwars2.com/' },
    { id: 2, name: 'GW2 Efficiency', url: 'https://gw2efficiency.com', emoji: '🧮' },
    { id: 3, name: 'La Bóveda', url: 'https://pablosnchz.github.io/gw2-wallet-ligero/' }
  ],
  categories: [
    { id: 10, name: 'Streaming', emoji: '🎥', links: [{ id: 11, name: 'Twitch', url: 'https://www.twitch.tv' }] },
    { id: 20, name: 'Vacía', links: [] },
    { id: 30, name: 'Guild Wars 2', links: [{ id: 31, name: 'Wiki inglesa', url: 'http://www.wiki.guildwars2.com' }] }
  ],
  apps: [{ id: 101, name: 'Discord', emoji: '💬' }],
  games: [{ id: 201, name: 'Guild Wars 2', emoji: '⚔️' }]
};
const extras = {
  shortcuts: [{ id: 'anet', label: 'ANet Keys', url: 'https://account.arena.net/applications', emoji: '🔑' }],
  actions: [{ id: 'export', label: 'Hacer backup', emoji: '💾' }],
  themes: [{ value: 'nord', label: 'Nord' }]
};

test('sin datos de la Factory: no lee status.md ni usa la red', () => {
  const src = require('fs').readFileSync(require('path').join(__dirname, '../js/shiruvana.js'), 'utf8');
  assert.equal(/fetch\(|XMLHttpRequest|status\.md|raw\.githubusercontent/.test(src.replace(/^\s*(\/\/|\*).*$/gm, '')), false);
  assert.equal(S.OLD_FACTORY_KEY, 'guarida:factory:v1');
  assert.equal(S.VERSION, '2.0.0');
});

test('norm quita acentos y mayúsculas; esc escapa HTML', () => {
  assert.equal(S.norm('  La BÓVEDA  '), 'la boveda');
  assert.equal(S.esc('<a href="x">\'&'), '&lt;a href=&quot;x&quot;&gt;&#39;&amp;');
});

test('score: exacto > comienzo > palabra > contiene > error de tipeo > letras en orden', () => {
  assert.equal(S.score('wiki gw2', 'Wiki GW2'), 120);
  assert.equal(S.score('wik', 'Wiki GW2'), 100);
  assert.equal(S.score('gw2', 'Wiki GW2'), 80);
  assert.equal(S.score('iki', 'Wiki GW2'), 60);
  assert.equal(S.score('wkii', 'Wiki GW2'), 40, 'transposición');
  assert.equal(S.score('discrd', 'Discord'), 40, 'letra de menos');
});

test('score: letras en orden y sin coincidencia', () => {
  assert.equal(S.score('gwe', 'GW2 Efficiency'), 20, 'g-w-e en orden');
  assert.equal(S.score('boveda', 'La Bóveda'), 80);
  assert.equal(S.score('xyz', 'Discord'), 0);
  assert.equal(S.score('abcd', 'Abxy'), 0, 'dos errores ya no es un error de tipeo');
  assert.equal(S.score('wk', 'Wiki'), 0, 'dos letras no alcanzan para letras en orden');
  assert.equal(S.score('', 'Wiki'), 0);
});

test('buildIndex arma claves estables para cada tipo', () => {
  const idx = S.buildIndex(state, extras);
  const keys = idx.map(e => e.key);
  assert.deepEqual(keys, ['fav:1', 'fav:2', 'fav:3', 'link:10:11', 'link:30:31', 'game:201', 'app:101', 'sc:anet', 'act:export', 'theme:nord']);
  const link = idx.find(e => e.key === 'link:10:11');
  assert.equal(link.group, 'Enlaces · Streaming');
  assert.equal(link.sub, 'twitch.tv');
  assert.equal(link.emoji, '🎥', 'sin emoji propio usa el de la categoría');
});

test('search ordena por puntaje y tipo, limita y no busca vacío', () => {
  const idx = S.buildIndex(state, extras);
  assert.deepEqual(S.search(idx, '   '), []);
  const r = S.search(idx, 'guild');
  assert.equal(r[0].key, 'game:201', '«Guild Wars 2» empieza con guild: gana al enlace que solo coincide por categoría');
  assert.ok(r.some(e => e.key === 'link:30:31'), 'el enlace aparece por su categoría');
  assert.equal(S.search(idx, 'wiki')[0].key, 'fav:1', 'a igual puntaje, favoritos primero');
  assert.equal(S.search(idx, 'a', 2).length, 2);
  assert.equal(S.search(idx, 'nord')[0].key, 'theme:nord');
  assert.deepEqual(S.search(idx, 'streaming').map(e => e.key), ['link:10:11'], 'un enlace se encuentra por el nombre de su categoría');
});

test('franja del día: mañana 05–12, tarde 12–19, noche 19–05', () => {
  const at = h => new Date(2026, 9, 22, h, 30);
  assert.deepEqual([4, 5, 11, 12, 18, 19, 23].map(h => S.franja(at(h))), ['n', 'm', 'm', 't', 't', 'n', 'n']);
});

test('Lo de siempre: necesita 10 aperturas y prefiere lo de esta franja', () => {
  const idx = S.buildIndex(state, extras);
  const manana = new Date(2026, 9, 22, 9, 0);
  const noche = new Date(2026, 9, 22, 22, 0);
  let u;
  for (let i = 0; i < 4; i++) u = S.record(u, 'game:201', noche);
  for (let i = 0; i < 3; i++) u = S.record(u, 'fav:2', manana);
  u = S.record(u, 'fav:999', manana); // ya no existe
  assert.equal(u.total, 8);
  assert.deepEqual(S.deSiempre(u, idx, manana), [], 'con menos de 10 aperturas no inventa');
  u = S.record(u, 'link:10:11', manana);
  u = S.record(u, 'link:10:11', manana);
  assert.equal(u.total, 10);
  assert.deepEqual(S.deSiempre(u, idx, manana).map(e => e.key), ['fav:2', 'link:10:11', 'game:201']);
  assert.deepEqual(S.deSiempre(u, idx, noche).map(e => e.key), ['game:201', 'fav:2', 'link:10:11']);
  assert.equal(S.deSiempre(u, idx, noche, 1).length, 1);
});

test('consejos: sin favoritos, categoría vacía, repetidos y backup', () => {
  const now = Date.UTC(2026, 9, 22, 12);
  const ids = S.tips(state, { firstSeen: now - 31 * DIA }, now).map(t => t.id);
  assert.deepEqual(ids, ['vacia:20', 'repetido:wiki.guildwars2.com', 'backup']);
  const rep = S.tips(state, {}, now).find(t => t.id.startsWith('repetido'));
  assert.deepEqual(rep.action.targets, ['#favoritesGrid .fav-card[data-id="1"]', '.category-link[data-cat-id="30"][data-link-id="31"]']);
  assert.ok(rep.text.includes('«Wiki GW2» y «Wiki inglesa»'));
  const vacio = S.tips({ favorites: [], categories: [] }, { firstSeen: now - 90 * DIA }, now);
  assert.deepEqual(vacio.map(t => t.id), ['sin-favoritos'], 'sin datos no pide backup');
});

test('consejos: backup reciente no avisa; viejo sí; «Ahora no» silencia', () => {
  const now = Date.UTC(2026, 9, 22, 12);
  const base = { favorites: [{ id: 1, name: 'A', url: 'https://a.com' }], categories: [] };
  assert.deepEqual(S.tips(base, { firstSeen: now - 10 * DIA }, now), []);
  assert.deepEqual(S.tips(base, { lastBackup: now - 30 * DIA }, now), []);
  const viejo = S.tips(base, { lastBackup: now - 45 * DIA }, now);
  assert.equal(viejo[0].id, 'backup');
  assert.ok(viejo[0].text.includes('hace 45 días'));
  assert.deepEqual(S.tips(base, { lastBackup: now - 45 * DIA, snooze: { backup: now + DIA } }, now), []);
  assert.equal(S.tips(base, { lastBackup: now - 45 * DIA, snooze: { backup: now - 1 } }, now).length, 1, 'el silencio vence');
});

test('pickTip: uno por día y nunca editando', () => {
  const now = Date.UTC(2026, 9, 22, 12);
  const list = [{ id: 'a' }, { id: 'b' }];
  assert.equal(S.pickTip(list, {}, now, false).id, 'a');
  assert.equal(S.pickTip(list, {}, now, true), null);
  assert.equal(S.pickTip(list, { lastTipDay: S.dayKey(now) }, now, false), null);
  assert.equal(S.pickTip(list, { lastTipDay: S.dayKey(now - DIA) }, now, false).id, 'a');
  assert.equal(S.pickTip([], {}, now, false), null);
});

test('selectores y claves coinciden con el HTML de app.js', () => {
  assert.equal(S.selectorFor({ kind: 'fav', id: 3 }), '#favoritesGrid .fav-card[data-id="3"]');
  assert.equal(S.selectorFor({ kind: 'link', id: 11, catId: 10 }), '.category-link[data-cat-id="10"][data-link-id="11"]');
  assert.equal(S.selectorFor({ kind: 'game', id: 201 }), '.launcher-item[data-type="game"][data-id="201"]');
  assert.equal(S.selectorFor({ kind: 'action', id: 'x' }), '');
  const el = (cls, attrs) => ({ classList: { contains: c => c === cls }, getAttribute: a => attrs[a] });
  assert.equal(S.keyFromElement(el('fav-card', { 'data-id': '3' })), 'fav:3');
  assert.equal(S.keyFromElement(el('category-link', { 'data-cat-id': '10', 'data-link-id': '11' })), 'link:10:11');
  assert.equal(S.keyFromElement(el('launcher-item', { 'data-type': 'app', 'data-id': '101' })), 'app:101');
  assert.equal(S.keyFromElement(el('otra', {})), '');
});

test('pintado: resultados accesibles, textos y escapes', () => {
  const groups = S.groupResults([
    { group: 'Favoritos', label: 'A<b>', emoji: '⭐', sub: 'a.com' },
    { group: 'Apps', label: 'B', emoji: '💬', sub: '' },
    { group: 'Favoritos', label: 'C', emoji: '⭐', sub: '' }
  ]);
  assert.deepEqual(groups.map(g => g.label + ':' + g.items.length), ['Favoritos:2', 'Apps:1']);
  const html = S.resultsHTML(groups);
  assert.equal((html.match(/role="option"/g) || []).length, 3);
  assert.equal((html.match(/aria-selected="true"/g) || []).length, 1);
  assert.ok(html.includes('A&lt;b&gt;'));
  assert.ok(html.includes('id="gnOpt2"'));
  assert.equal(S.sayText('', 0), 'Escribí lo que buscás. Enter abre el primero; Esc cierra.');
  assert.equal(S.sayText('zz', 0).startsWith('No encontré nada con «zz»'), true);
  assert.equal(S.sayText('w', 1), 'Encontré 1. Enter lo abre.');
  assert.equal(S.sayText('w', 4), 'Encontré 4 cosas. Enter abre la primera.');
  const tip = S.tipHTML({ text: '<x>', action: { label: 'Hacer' } });
  assert.ok(tip.includes('&lt;x&gt;') && tip.includes('data-tip="later"') && tip.includes('Ahora no'));
  assert.ok(S.chipsHTML([{ label: 'Wiki', emoji: '📖' }]).includes('data-usual="0"'));
});
