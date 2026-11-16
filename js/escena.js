/*!
 * js/escena.js — «GN Escena» en La Guarida (1.0.0, 2026-11-16, BL-091 ESC-1)
 *
 * Pone las chispas del fondo «Taller». Si se ven o no lo decide css/escena.css
 * (solo con el theme Gato Negro y sin «reducir movimiento»), así que cambiar de
 * theme no necesita nada de acá. No pide nada a la red ni guarda nada.
 * Las funciones puras se exportan para los tests.
 */
(function (root) {
  'use strict';

  var VERSION = '1.0.0';
  var CHISPAS = 14;

  function chispasHTML(n) {
    var cuantas = Math.max(0, Math.min(40, n | 0));
    var s = '';
    for (var i = 0; i < cuantas; i++) s += '<i style="--i:' + i + '"></i>';
    return s;
  }

  var api = { VERSION: VERSION, CHISPAS: CHISPAS, chispasHTML: chispasHTML };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  if (!root || !root.document) return;

  var doc = root.document;

  function init() {
    if (doc.querySelector('.esc-chispas')) return;
    var capa = doc.createElement('div');
    capa.className = 'esc-chispas';
    capa.setAttribute('aria-hidden', 'true');
    capa.innerHTML = chispasHTML(CHISPAS);
    doc.body.appendChild(capa);
  }

  root.GuaridaEscena = { version: VERSION, api: api };

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
  else init();
})(typeof window !== 'undefined' ? window : this);
