// La Guarida: mi voz y el resumen de la Factory (BL-051, DEC-027).
// Corre con: node --test tests/
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const S = require(path.join(__dirname, '..', 'js', 'shiruvana.js'));

const STATUS = [
  '# STATUS',
  '',
  'Estado: EN CURSO',
  'Tarea actual: BL-051 — La Guarida como el `Centro de decisiones` y mi voz.',
  'Última actualización: 2026-10-22T04:50Z',
  '',
  '## Resumen de la sesión',
  '',
  '- Algo que no es un pendiente.',
  '',
  '## Esperando a Pablo',
  '',
  '- [RSK-019] Acción: Revocá el token de Twitch que está en `la-guarida/js/widgets.js`.',
  '- [BL-050] Validación: abrí producción con Ctrl+F5.',
  '- [FEAT-009] Info: esto es solo para que sepas.',
  '',
  '## Para tu información',
  '',
  '- [FEAT-002] Validada.',
  ''
].join('\n');

test('parseStatus: estado, tarea limpia y solo los pendientes de "Esperando a Pablo"', () => {
  const d = S.parseStatus(STATUS);
  assert.equal(d.estado, 'EN CURSO');
  assert.equal(d.tarea, 'BL-051 — La Guarida como el Centro de decisiones y mi voz.');
  assert.equal(d.actualizado, '2026-10-22T04:50Z');
  assert.deepEqual(d.pendientes.map(p => [p.id, p.clase]), [['RSK-019', 'accion'], ['BL-050', 'validacion'], ['FEAT-009', 'info']]);
  assert.equal(d.pendientes[0].texto, 'Revocá el token de Twitch que está en la-guarida/js/widgets.js.');
});

test('parseStatus: línea sin clase cuenta como acción; sin sección no hay pendientes', () => {
  const d = S.parseStatus('Estado: EN CURSO\n\n## Esperando a Pablo\n\n- [X-1] Mirar esto\n- Decisión: elegir\n');
  assert.deepEqual(d.pendientes.map(p => p.clase), ['accion', 'decision']);
  assert.equal(d.pendientes[0].texto, 'Mirar esto');
  assert.deepEqual(S.parseStatus('Estado: EN CURSO\n').pendientes, []);
  assert.deepEqual(S.parseStatus(null).pendientes, []);
});

test('frase: la misma lectura que el Centro de decisiones', () => {
  assert.equal(S.frase({ accion: 1, validacion: 1, decision: 0, total: 2 }), 'Te esperan 1 acción tuya y 1 validación.');
  assert.equal(S.frase({ accion: 0, validacion: 0, decision: 1, total: 1 }), 'Te espera 1 decisión para tomar.');
  assert.equal(S.frase({ accion: 2, validacion: 3, decision: 1, total: 6 }), 'Te esperan 1 decisión para tomar, 2 acciones tuyas y 3 validaciones.');
  assert.equal(S.frase({ accion: 0, validacion: 0, decision: 0, total: 0 }), 'Nada te espera de la Factory.');
});

test('estadoFactory: trabajando, bloqueada, en pausa y desconocido', () => {
  assert.equal(S.estadoFactory('EN CURSO').clave, 'trabajando');
  assert.equal(S.estadoFactory('BLOQUEADO por Pablo').tono, 'warning');
  assert.equal(S.estadoFactory('EN PAUSA').texto, 'en pausa');
  assert.equal(S.estadoFactory('').texto, 'sin datos');
});

test('chips: datos sin avatar; cuentan acciones, validaciones y el estado', () => {
  const html = S.chipsHTML({ datos: S.parseStatus(STATUS) });
  assert.match(html, /Sin decisiones pendientes/);
  assert.match(html, /1 acción tuya/);
  assert.match(html, /1 para validar/);
  assert.match(html, /Factory: trabajando/);
  assert.doesNotMatch(html, /<img/);
  assert.match(S.chipsHTML({ datos: null }), /Factory: sin datos/);
});

test('voz: un solo avatar, rótulo visible, pendientes escapados y enlace al panel', () => {
  const md = STATUS.replace('abrí producción', 'abrí <img src=x onerror=alert(1)> producción');
  const html = S.voiceHTML({ datos: S.parseStatus(md), leido: Date.UTC(2026, 9, 22, 4, 50) });
  assert.equal((html.match(/<img/g) || []).length, 1, 'un solo avatar');
  assert.match(html, /alt="" aria-hidden="true"/);
  assert.match(html, /Shiruvana resume/);
  assert.match(html, /Te esperan 1 acción tuya y 1 validación\./);
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.doesNotMatch(html, /esto es solo para que sepas/, 'Info no es un pendiente');
  assert.match(html, /Yo estoy con: BL-051/);
  assert.match(html, new RegExp('href="' + S.PANEL_URL.replace(/[.]/g, '\\.') + '"'));
  assert.match(html, /data-shv-refresh="1"/);
});

test('voz: más de 3 pendientes muestra 3 y cuántos faltan', () => {
  const lines = ['Estado: EN CURSO', '', '## Esperando a Pablo', ''];
  for (let i = 1; i <= 5; i++) lines.push('- [A-' + i + '] Acción: tarea ' + i);
  const html = S.voiceHTML({ datos: S.parseStatus(lines.join('\n')), leido: 0 });
  assert.equal((html.match(/<li>/g) || []).length, 3);
  assert.match(html, /Y 2 más en el Centro de decisiones\./);
});

test('voz: sin datos lo explica, cargando no dice que falló', () => {
  assert.match(S.voiceHTML({ datos: null }), /Shiruvana explica[\s\S]*No pude leer el estado de la Factory/);
  const cargando = S.voiceHTML({ datos: null, cargando: true });
  assert.match(cargando, /Estoy leyendo la memoria de la Factory/);
  assert.doesNotMatch(cargando, /No pude/);
});

function memoria() {
  const m = new Map();
  return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), m };
}

test('cargar: lee status.md, guarda copia y la usa 5 minutos sin volver a pedir', async () => {
  const storage = memoria();
  let pedidos = 0;
  const fetch = (url) => { pedidos++; assert.ok(url.startsWith(S.SOURCE)); return Promise.resolve({ ok: true, text: () => Promise.resolve(STATUS) }); };
  const r1 = await S.cargar({ fetch, storage, now: 1000000 });
  assert.equal(r1.datos.estado, 'EN CURSO');
  assert.equal(r1.copia, false);
  const r2 = await S.cargar({ fetch, storage, now: 1000000 + 60000 });
  assert.equal(pedidos, 1, 'dentro de los 5 minutos usa la copia');
  assert.equal(r2.datos.pendientes.length, 3);
  await S.cargar({ fetch, storage, now: 1000000 + S.TTL_MS + 1 });
  assert.equal(pedidos, 2, 'vencida, vuelve a pedir');
});

test('cargar: si GitHub falla usa la última copia y lo marca; sin copia, datos null', async () => {
  const storage = memoria();
  storage.setItem(S.CACHE_KEY, JSON.stringify({ md: STATUS, t: 5 }));
  const falla = () => Promise.reject(new TypeError('Failed to fetch'));
  const r = await S.cargar({ fetch: falla, storage, now: 5 + S.TTL_MS + 1 });
  assert.equal(r.copia, true);
  assert.equal(r.datos.estado, 'EN CURSO');
  const vacio = await S.cargar({ fetch: () => Promise.resolve({ ok: false, status: 404 }), storage: memoria(), now: 1 });
  assert.equal(vacio.datos, null);
  const raro = await S.cargar({ fetch: () => Promise.resolve({ ok: true, text: () => Promise.resolve('<html>') }), storage: memoria(), now: 1 });
  assert.equal(raro.datos, null, 'una página que no es status.md no se toma como estado');
});

test('saludo según la hora', () => {
  const h = (n) => S.saludo(new Date(2026, 9, 22, n, 0));
  assert.equal(h(3), 'Buenas noches');
  assert.equal(h(9), 'Buenos días');
  assert.equal(h(12), 'Buenos días');
  assert.equal(h(13), 'Buenas tardes');
  assert.equal(h(15), 'Buenas tardes');
  assert.equal(h(22), 'Buenas noches');
});
