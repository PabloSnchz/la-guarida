/*!
 * next/js/editor.js — Editor, avisos y «Deshacer» de La Guarida (1.0.0, 2026-10-31, RG-5)
 *
 * app.js, modal.js y data.js no se tocan (los sigue usando La Guarida de siempre). Acá:
 *  1. Borrar ya no pregunta con confirm(): borra y ofrece «Deshacer» durante 10 s.
 *     Solo para los confirm() de borrado («¿Eliminar …?»); cualquier otro sigue igual.
 *  2. Los alert() pasan a avisos del kit abajo a la derecha, que no frenan la página.
 *  3. Editor: al abrirse, el foco va al nombre; Enter guarda; al cerrarse, el foco vuelve
 *     a donde estaba. Ícono y emoji quedan plegados en «Ícono y emoji».
 * Las funciones puras se exportan para los tests.
 */
(function (root) {
  'use strict';

  var VERSION = '1.0.0';
  var DESHACER_MS = 10000;
  var CLAVES = ['favorites', 'categories', 'apps', 'games', 'widgets_left', 'widgets_right'];

  // Los confirm() de borrado de app.js y el aviso que los reemplaza.
  var BORRADOS = [
    [/^¿Eliminar este favorito\?/, 'Eliminé el favorito.'],
    [/^¿Eliminar esta categoría/, 'Eliminé la categoría y sus enlaces.'],
    [/^¿Eliminar este link\?/, 'Eliminé el enlace.'],
    [/^¿Eliminar este app\?/, 'Eliminé la app.'],
    [/^¿Eliminar este juego\?/, 'Eliminé el juego.']
  ];

  // Texto del aviso si es un borrado, o null si es otra pregunta.
  function deleteText(msg) {
    var m = String(msg == null ? '' : msg);
    for (var i = 0; i < BORRADOS.length; i++) if (BORRADOS[i][0].test(m)) return BORRADOS[i][1];
    return null;
  }

  // Tipo de aviso según cómo empieza el alert() original.
  function alertKind(msg) {
    var m = String(msg == null ? '' : msg).trim();
    if (/^(❌|⚠️|⚠)/.test(m)) return /^❌/.test(m) ? 'error' : 'warn';
    if (/^✅/.test(m)) return 'ok';
    if (/obligatori|Primero /i.test(m)) return 'warn';
    return 'info';
  }

  // El aviso sin el emoji del principio (el color ya dice qué tipo es).
  function alertText(msg) {
    return String(msg == null ? '' : msg).replace(/^\s*(❌|⚠️|⚠|✅|⏳|📥)\s*/, '').replace(/\s*\n+\s*/g, ' ').trim();
  }

  function snapshot(state) {
    var s = {};
    CLAVES.forEach(function (k) { s[k] = JSON.parse(JSON.stringify((state && state[k]) || [])); });
    return s;
  }

  // Devuelve el estado a la foto, sobre el MISMO objeto (Data.state lo usan todos los módulos).
  function restore(state, snap) {
    CLAVES.forEach(function (k) { state[k] = JSON.parse(JSON.stringify(snap[k] || [])); });
    return state;
  }

  var api = {
    VERSION: VERSION, DESHACER_MS: DESHACER_MS, CLAVES: CLAVES,
    deleteText: deleteText, alertKind: alertKind, alertText: alertText, snapshot: snapshot, restore: restore
  };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  if (!root || !root.document) return;

  var doc = root.document;
  function $(s) { return doc.querySelector(s); }
  function K() { return root.GNKit; }

  // ---- 1 y 2. confirm() y alert() ----
  var confirmOriginal = root.confirm;
  var alertOriginal = root.alert;

  // Un solo «Deshacer» vivo: si después se guarda cualquier otra cosa, deja de ofrecerse,
  // así deshacer nunca pisa algo que agregaste o cambiaste después de borrar.
  var pendiente = null;
  var restaurando = false;
  function cancelarDeshacer() { if (pendiente) { pendiente.close(); pendiente = null; } }

  root.confirm = function (msg) {
    var texto = deleteText(msg);
    if (!texto || !K() || !root.Data) return confirmOriginal.apply(root, arguments);
    cancelarDeshacer();
    var foto = snapshot(root.Data.state);
    // Después del save() del propio borrado, que app.js hace apenas devuelvo true.
    setTimeout(function () {
      pendiente = K().notify(texto, {
        kind: 'info', timeout: DESHACER_MS,
        action: { label: 'Deshacer', fn: function () {
          pendiente = null;
          restaurando = true;
          restore(root.Data.state, foto);
          root.Data.save();
          if (root.App && root.App.render) root.App.render();
          restaurando = false;
          K().notify('Listo, lo volví a poner.', { kind: 'ok' });
        } }
      });
    }, 0);
    return true;
  };

  function vigilarGuardado() {
    var D = root.Data;
    if (!D || !D.save || D.save.__ge) return;
    var save = D.save;
    D.save = function () { if (!restaurando) cancelarDeshacer(); return save.apply(D, arguments); };
    D.save.__ge = true;
  }

  root.alert = function (msg) {
    if (!K()) return alertOriginal.apply(root, arguments);
    K().notify(alertText(msg), { kind: alertKind(msg) });
  };

  // ---- 3. Editor ----
  var volverA = null;

  function alAbrirOCerrar(modal) {
    if (!modal.hidden) {
      volverA = doc.activeElement;
      var mas = $('#modal .ge-more'); if (mas) mas.open = false;
      var nombre = $('#modalName');
      if (nombre) setTimeout(function () { nombre.focus(); nombre.select(); }, 0);
    } else if (volverA && volverA.focus && doc.contains(volverA)) {
      volverA.focus();
      volverA = null;
    }
  }

  function init() {
    vigilarGuardado();
    var modal = $('#modal');
    if (!modal) return;
    if (root.MutationObserver) {
      new root.MutationObserver(function () { alAbrirOCerrar(modal); }).observe(modal, { attributes: true, attributeFilter: ['hidden'] });
    }
    modal.addEventListener('keydown', function (ev) {
      var t = ev.target;
      if (ev.key !== 'Enter' || !t || t.tagName !== 'INPUT' || t.type === 'checkbox') return;
      ev.preventDefault();
      var save = $('#modalSave'); if (save) save.click();
    });
  }

  root.GuaridaEditor = { version: VERSION, api: api };

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
  else init();
})(typeof window !== 'undefined' ? window : this);
