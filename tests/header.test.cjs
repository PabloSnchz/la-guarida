// Tests de la cabecera compacta (js/header.js, RG-2).
// Correr: node --test tests/*.test.cjs
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const H = require('../js/header.js');

const DIA = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 9, 31, 18, 0); // sábado 31/10/2026 18:00 UTC

test('fin de temporada: respuesta plana o anidada, y nada si no hay fecha válida', () => {
  assert.equal(H.seasonEnd({ title: 'T', end: '2026-12-02T17:00:00Z' }), Date.UTC(2026, 11, 2, 17));
  assert.equal(H.seasonEnd({ season: { end: '2026-12-02T17:00:00Z' } }), Date.UTC(2026, 11, 2, 17));
  assert.equal(H.seasonEnd(null), null);
  assert.equal(H.seasonEnd({ title: 'T' }), null);
  assert.equal(H.seasonEnd({ end: 'mañana' }), null);
  assert.equal(H.seasonEnd({ end: 1234 }), null);
});

test('la temporada se pide a la API como mucho una vez por día', () => {
  assert.equal(H.seasonFresh({ end: 1, t: NOW - DIA + 60000 }, NOW), true);
  assert.equal(H.seasonFresh({ end: 1, t: NOW - DIA }, NOW), false);
  assert.equal(H.seasonFresh({ end: 1, t: NOW + 60000 }, NOW), false, 'un reloj adelantado no la congela');
  assert.equal(H.seasonFresh(null, NOW), false);
  assert.equal(H.SEASON_KEY, 'guarida:temporada:v1');
  assert.equal(H.SEASON_URL, 'https://api.guildwars2.com/v2/wizardsvault');
});

test('punto dorado del backup: más de 30 días, igual que el consejo de Shiruvana', () => {
  assert.equal(H.backupDue({ lastBackup: NOW - 30 * DIA }, NOW), false);
  assert.equal(H.backupDue({ lastBackup: NOW - 31 * DIA }, NOW), true);
  assert.equal(H.backupDue({ firstSeen: NOW - 31 * DIA }, NOW), true, 'nunca hizo backup y ya pasó un mes');
  assert.equal(H.backupDue({ firstSeen: NOW - 2 * DIA }, NOW), false, 'recién llegado');
  assert.equal(H.backupDue(null, NOW), false);
});

test('texto del último backup', () => {
  assert.equal(H.backupText({}, NOW), 'Todavía no descargaste ningún backup');
  assert.equal(H.backupText({ lastBackup: NOW - 3600000 }, NOW), 'Último backup: hoy');
  assert.equal(H.backupText({ lastBackup: NOW - DIA - 1 }, NOW), 'Último backup: ayer');
  assert.equal(H.backupText({ lastBackup: NOW - 12 * DIA }, NOW), 'Último backup: hace 12 días');
});

test('relojes: local, diario y semanal con ícono; temporada solo si sigue abierta', () => {
  const sin = H.clocksHTML(NOW, null);
  assert.equal((sin.match(/class="gk-clk[ "]/g) || []).length, 3);
  assert.ok(sin.includes('id="ghClk-daily"') && sin.includes('id="ghClk-weekly"') && sin.includes('id="ghClk-local"'));
  assert.equal((sin.match(/class="gk-clk__icon"/g) || []).length, 3, 'los tres con ícono');
  assert.ok(sin.includes(H.ICONS.daily));
  const con = H.clocksHTML(NOW, NOW + 2 * DIA);
  assert.ok(con.includes('id="ghClk-season"'));
  assert.ok(/id="ghClk-season"[^>]*>/.test(con) && con.includes('gk-clk is-soon" id="ghClk-season"'), 'menos de 3 días: dorado');
  assert.ok(!H.clocksHTML(NOW, NOW - 1000).includes('ghClk-season'), 'temporada terminada: no se muestra');
});

test('mi cara según el momento, y cada imagen existe en el repo', () => {
  const fs = require('fs');
  const path = require('path');
  const P = 'assets/brand/shiruvana/shiruvana-';
  assert.equal(H.avatarSrc('trigger'), P + 'hola-cara-128.webp');
  assert.equal(H.avatarSrc('portal'), P + 'pensando-cara-128.webp');
  assert.equal(H.avatarSrc('consejo', 'La categoría «X» está vacía.'), P + 'explica-cara-128.webp');
  assert.equal(H.avatarSrc('consejo', 'Tu último backup es de hace 40 días. Hacer backup'), P + 'ojo-cara-128.webp');
  for (const s of [H.avatarSrc('trigger'), H.avatarSrc('portal'), H.avatarSrc('consejo', ''), H.avatarSrc('consejo', 'backup')])
    assert.ok(fs.existsSync(path.join(__dirname, '..', s)), s + ' existe');
});

test('RG-7: las siete poses existen en el repo, cara y retrato', () => {
  const fs = require('fs');
  const path = require('path');
  assert.deepEqual(H.POSES, ['hola', 'pensando', 'explica', 'ojo', 'festeja', 'guino', 'con-gato']);
  for (const p of H.POSES) for (const s of [H.caraSrc(p), H.retratoSrc(p)])
    assert.ok(fs.existsSync(path.join(__dirname, '..', s)), s + ' existe');
});

test('RG-7: el portal cambia de pose según lo que encuentro', () => {
  assert.equal(H.portalPose('', 0), 'con-gato');
  assert.equal(H.portalPose('   ', 5), 'con-gato', 'solo espacios: todavía no buscás nada');
  assert.equal(H.portalPose('wiki', 3), 'pensando');
  assert.equal(H.portalPose('zzzz', 0), 'explica');
});

test('RG-7: cada aviso con su cara, y las siete se usan en algún momento', () => {
  assert.equal(H.avisoPose('info', 'Eliminé el favorito.'), 'guino');
  assert.equal(H.avisoPose('ok', 'Listo, lo volví a poner.'), 'festeja');
  assert.equal(H.avisoPose('ok', 'Datos importados correctamente'), 'festeja');
  assert.equal(H.avisoPose('warn', 'El nombre es obligatorio'), 'ojo');
  assert.equal(H.avisoPose('error', 'El archivo no tiene el formato correcto'), 'ojo');
  assert.equal(H.avisoPose('info', 'Extrayendo ícono...'), 'explica');
  const usadas = new Set([
    'hola', // barra del portal cerrado (avatarSrc('trigger'))
    H.portalPose('', 0), H.portalPose('a', 1), H.portalPose('a', 0),
    H.avisoPose('info', 'Eliminé'), H.avisoPose('ok', ''), H.avisoPose('warn', '')
  ]);
  assert.deepEqual([...usadas].sort(), [...H.POSES].sort());
});

test('los íconos vienen de La Bóveda publicada', () => {
  for (const k of ['local', 'daily', 'weekly'])
    assert.ok(H.ICONS[k].startsWith('https://raw.githubusercontent.com/PabloSnchz/gw2-wallet-ligero/main/assets/icons/'), k);
});
