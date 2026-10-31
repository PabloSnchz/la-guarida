/*!
 * js/header.js — Cabecera compacta de La Guarida (1.1.0, 2026-10-31, RG-2 + RG-3b)
 *
 * 1.1.0 (RG-3b): mi cara nueva (assets/brand/shiruvana/*-cara-128.webp) en el portal
 * cerrado (hola), el portal abierto (pensando) y el consejo (explica; ojo si es del backup).
 *
 * RG-0b, aprobada por Pablo: dos filas finas (marca, pestañas y herramientas;
 * saludo, portal y relojes), mi consejo del día como franja al pie de la cabecera
 * y el backup dentro de «⋯» con un punto dorado cuando conviene hacer uno.
 *  - Relojes: el reloj común del kit (js/kit.js), cada 30 s.
 *  - Temporada de la Cámara del Brujo: fin leído de /v2/wizardsvault (público, sin
 *    clave), una vez por día; se guarda solo { end, t } en guarida:temporada:v1.
 *    Si la API no responde o no trae fecha, el reloj de temporada no aparece.
 *  - Consejo: shiruvana.js crea su aviso flotante (.gn-toast) y acá lo muevo a la
 *    franja #ghTip, sin tocar shiruvana.js. Sigue siendo uno por día.
 *  - Backup: lee lastBackup y firstSeen de guarida:shiruvana:v1 (lo escribe shiruvana.js).
 * Las funciones puras se exportan para los tests.
 */
(function (root) {
  'use strict';

  var VERSION = '1.1.0';
  var DIA = 24 * 60 * 60 * 1000;
  var BACKUP_DIAS = 30;
  var SEASON_KEY = 'guarida:temporada:v1';
  var META_KEY = 'guarida:shiruvana:v1';
  var SEASON_URL = 'https://api.guildwars2.com/v2/wizardsvault';
  var ICON = 'https://raw.githubusercontent.com/PabloSnchz/gw2-wallet-ligero/main/assets/icons/';
  // Los mismos íconos que usa La Bóveda publicada; la temporada va sin ícono (el nombre alcanza).
  var ICONS = { local: ICON + '841720.png', daily: ICON + '534745.png', weekly: ICON + '155064.png' };

  var K = (typeof module !== 'undefined' && module.exports && typeof require === 'function')
    ? require('./kit.js')
    : (root && root.GNKit && root.GNKit.api);

  // Fin de la temporada en ms, o null si la respuesta no lo trae bien.
  function seasonEnd(json) {
    if (!json || typeof json !== 'object') return null;
    // Igual que La Bóveda (wizards-vault.js): respuesta plana o anidada en «season».
    var end = json.end || (json.season && json.season.end);
    if (typeof end !== 'string') return null;
    var t = Date.parse(end);
    return isFinite(t) ? t : null;
  }

  function seasonFresh(cache, now) {
    return !!(cache && typeof cache.t === 'number' && now - cache.t >= 0 && now - cache.t < DIA);
  }

  function backupDue(meta, now) {
    var m = meta || {};
    if (m.lastBackup) return now - m.lastBackup > BACKUP_DIAS * DIA;
    return !!(m.firstSeen && now - m.firstSeen > BACKUP_DIAS * DIA);
  }

  function backupText(meta, now) {
    var m = meta || {};
    if (!m.lastBackup) return 'Todavía no descargaste ningún backup';
    var d = Math.floor((now - m.lastBackup) / DIA);
    if (d < 1) return 'Último backup: hoy';
    if (d === 1) return 'Último backup: ayer';
    return 'Último backup: hace ' + d + ' días';
  }

  // Mi cara según el momento (RG-3b, imágenes aprobadas por Pablo el 2026-10-31).
  // portal cerrado: saludo; portal abierto: pensando; consejo: explicando, o «ojo» si es del backup.
  var CARA = 'assets/brand/shiruvana/shiruvana-';
  function avatarSrc(donde, texto) {
    if (donde === 'consejo') return CARA + (/backup/i.test(texto || '') ? 'ojo' : 'explica') + '-cara-128.webp';
    if (donde === 'portal') return CARA + 'pensando-cara-128.webp';
    return CARA + 'hola-cara-128.webp';
  }

  // Relojes de la cabecera en HTML. La temporada solo si todavía no terminó.
  function clocksHTML(now, season) {
    var list = K.clocks(now, season && season > now ? { seasonEnd: season } : {});
    return list.map(function (c) {
      return K.clockHTML({ id: 'ghClk-' + c.key, label: c.label, title: c.title, value: c.value, soon: c.soon, icon: ICONS[c.key] });
    }).join('');
  }

  var api = {
    VERSION: VERSION, SEASON_KEY: SEASON_KEY, SEASON_URL: SEASON_URL, ICONS: ICONS,
    seasonEnd: seasonEnd, seasonFresh: seasonFresh, backupDue: backupDue, backupText: backupText, clocksHTML: clocksHTML,
    avatarSrc: avatarSrc
  };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  if (!root || !root.document) return;

  var doc = root.document;
  function $(s) { return doc.querySelector(s); }
  function load(k) { try { var r = root.localStorage.getItem(k); return r ? JSON.parse(r) : null; } catch (e) { return null; } }
  function store(k, v) { try { root.localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin lugar: se pide de nuevo mañana */ } }

  var season = null;

  function pintarRelojes() {
    var box = $('#ghClocks');
    if (box && K) box.innerHTML = clocksHTML(Date.now(), season);
  }

  function cargarTemporada() {
    var now = Date.now();
    var cache = load(SEASON_KEY);
    if (cache && cache.end) season = cache.end;
    if (seasonFresh(cache, now) || !root.fetch) return;
    root.fetch(SEASON_URL).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
      var end = seasonEnd(j);
      store(SEASON_KEY, { end: end, t: Date.now() });
      season = end;
      pintarRelojes();
    }).catch(function () { /* sin red: queda lo último que había */ });
  }

  function pintarBackup() {
    var meta = load(META_KEY) || {};
    var now = Date.now();
    var due = backupDue(meta, now);
    var dot = $('#ghDot'); if (dot) dot.hidden = !due;
    var info = $('#ghBackupInfo'); if (info) info.textContent = backupText(meta, now);
    var more = $('#ghMore'); if (more) more.setAttribute('aria-label', 'Más opciones' + (due ? ' (conviene hacer un backup)' : ''));
  }

  // El consejo de shiruvana.js pasa a la franja de la cabecera.
  function moverConsejo(node) {
    var slot = $('#ghTip');
    if (slot && node && node.classList && node.classList.contains('gn-toast') && node.parentNode !== slot) slot.appendChild(node);
  }

  // Cambia mi avatar viejo por la cara nueva; si la imagen no carga, vuelve el de antes.
  function ponerCara(img, src) {
    if (!img || img.getAttribute('data-cara') === src) return;
    var antes = img.src;
    img.onerror = function () { img.onerror = null; if (antes) img.src = antes; };
    img.setAttribute('data-cara', src);
    img.src = src;
  }

  function caras(node) {
    if (!node || !node.querySelector) return;
    var t = node.classList && node.classList.contains('gn-toast') ? node : null;
    if (t) ponerCara(t.querySelector('.gn-toast__avatar'), avatarSrc('consejo', t.textContent));
    ponerCara(node.querySelector('.gn-portal__avatar'), avatarSrc('portal'));
  }

  function alAgregar(node) { moverConsejo(node); caras(node); }

  function init() {
    pintarRelojes();
    cargarTemporada();
    pintarBackup();
    setInterval(pintarRelojes, 30000);

    // shiruvana.js pone su avatar en su propio init, que corre después de este.
    setTimeout(function () { ponerCara($('#portalTrigger .gn-avatar-slot'), avatarSrc('trigger')); }, 0);

    Array.prototype.forEach.call(doc.querySelectorAll('.gn-toast, .gn-portal'), alAgregar);
    if (root.MutationObserver) {
      new root.MutationObserver(function (list) {
        list.forEach(function (m) { Array.prototype.forEach.call(m.addedNodes, alAgregar); });
      }).observe(doc.body, { childList: true });
    }

    var menu = $('#ghMoreMenu');
    if (menu) menu.addEventListener('toggle', pintarBackup);
    var exp = $('#exportBtn');
    if (exp) exp.addEventListener('click', function () { setTimeout(pintarBackup, 0); });
  }

  root.GuaridaHeader = { version: VERSION, api: api };

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
  else init();
})(typeof window !== 'undefined' ? window : this);
