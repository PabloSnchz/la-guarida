/*!
 * js/escena.js — «GN Escena» en La Guarida (1.1.0, 2026-11-17, BL-091 ESC-2)
 *
 * 1.1.0 (ESC-2): mi globo en la esquina, con el gato robot sentado encima.
 *  - Con el theme Gato Negro, el consejo del día (el .gn-toast de shiruvana.js, que
 *    header.js deja en la franja #ghTip) pasa adentro de mi globo; con cualquier otro
 *    theme vuelve a la franja. Muevo el mismo nodo: sus botones siguen andando y no
 *    toco shiruvana.js ni header.js.
 *  - Sin consejo, el globo dice una línea según la hora y arranca plegado si lo
 *    plegaste antes (guarida:escena:v1, solo { plegado }). Si llega un consejo, se abre.
 *  - El gato: si lo tocás, festeja y dice algo; a la quinta, se queja.
 * 1.0.0 (ESC-1): chispas del fondo «Taller».
 * Qué se ve y qué no lo decide css/escena.css (solo con el theme Gato Negro).
 * No pide nada a la red. Las funciones puras se exportan para los tests.
 */
(function (root) {
  'use strict';

  var VERSION = '1.1.0';
  var CHISPAS = 14;
  var KEY = 'guarida:escena:v1';
  var CARA = 'assets/brand/shiruvana/shiruvana-';
  var GATO = 'assets/brand/gato/gato-';
  var FRASES = ['Prrr… bip.', 'Miau. Compilando.', 'Ojo ámbar: sistema estable.', 'Bip bip. Todo en orden.'];
  var QUEJA = 'Basta, que estoy trabajando.';

  function chispasHTML(n) {
    var cuantas = Math.max(0, Math.min(40, n | 0));
    var s = '';
    for (var i = 0; i < cuantas; i++) s += '<i style="--i:' + i + '"></i>';
    return s;
  }

  // El consejo va a mi globo solo con el theme Gato Negro.
  function dondeConsejo(theme) { return theme === 'gato' ? 'globo' : 'franja'; }

  // Plegado: si hay consejo, abierto siempre; si no, como lo dejaste (la primera vez, abierto).
  function plegadoInicial(guardado, hayConsejo) {
    if (hayConsejo) return false;
    return !!(guardado && guardado.plegado === true);
  }

  // Lo que digo cuando no hay consejo: el saludo de la hora y cómo encontrarme.
  function lineaDelDia(date) {
    var h = date.getHours();
    var saludo = h >= 5 && h < 12 ? 'Buen día' : (h >= 12 && h < 19 ? 'Buenas tardes' : 'Buenas noches');
    return saludo + ', Pablo. Ctrl K y te llevo a donde quieras.';
  }

  // El gato: cuatro frases que rotan; el quinto toque, la queja.
  function fraseGato(toques) {
    var n = toques | 0;
    if (n < 1) return '';
    if (n === 5) return QUEJA;
    return FRASES[(n > 5 ? n - 2 : n - 1) % FRASES.length];
  }

  function globoHTML(linea) {
    return '<button type="button" class="esc-gato" aria-label="Tocar al gato robot">' +
        '<img src="' + GATO + 'sentado.webp" alt="" width="320" height="320"></button>' +
      '<span class="esc-gato-dice" aria-live="polite"></span>' +
      '<img class="esc-cara" src="' + CARA + 'hola-cara-128.webp" alt="" width="44" height="44">' +
      '<div class="esc-dice">' +
        '<p class="esc-nombre">Shiruvana</p>' +
        '<p class="esc-texto">' + linea + '</p>' +
        '<div class="esc-slot"></div>' +
      '</div>' +
      '<button type="button" class="esc-plegar" aria-expanded="true" aria-label="Plegar mi globo" title="Plegar">⇲</button>';
  }

  var api = {
    VERSION: VERSION, CHISPAS: CHISPAS, KEY: KEY, FRASES: FRASES, QUEJA: QUEJA,
    chispasHTML: chispasHTML, dondeConsejo: dondeConsejo, plegadoInicial: plegadoInicial,
    lineaDelDia: lineaDelDia, fraseGato: fraseGato, globoHTML: globoHTML
  };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  if (!root || !root.document) return;

  var doc = root.document;
  function $(s) { return doc.querySelector(s); }
  function load() { try { return JSON.parse(root.localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
  function store(v) { try { root.localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* sin lugar: no es grave */ } }

  var globo = null, toques = 0, tGato = null;

  function plegar(si, guardar) {
    if (!globo) return;
    globo.classList.toggle('is-plegado', si);
    var b = globo.querySelector('.esc-plegar');
    b.setAttribute('aria-expanded', si ? 'false' : 'true');
    b.setAttribute('aria-label', si ? 'Abrir mi globo' : 'Plegar mi globo');
    b.title = si ? 'Abrir' : 'Plegar';
    b.textContent = si ? '⇱' : '⇲';
    if (guardar) store({ plegado: si });
  }

  function consejo() { return $('.gn-toast'); }
  function hayConsejo() { var t = consejo(); return !!(t && !t.hidden && t.textContent.trim()); }

  // Pone el consejo donde corresponde y deja el globo al día.
  function ubicar() {
    if (!globo) return;
    var t = consejo();
    var dest = dondeConsejo(doc.body.getAttribute('data-theme')) === 'globo' ? globo.querySelector('.esc-slot') : $('#ghTip');
    if (t && dest && t.parentNode !== dest) dest.appendChild(t);
    var hay = hayConsejo();
    var antes = globo.classList.contains('con-consejo');
    globo.classList.toggle('con-consejo', hay);
    if (hay && !antes) plegar(false, false);
  }

  function gato(pose, frase) {
    var img = globo.querySelector('.esc-gato img');
    var dice = globo.querySelector('.esc-gato-dice');
    var btn = globo.querySelector('.esc-gato');
    img.src = GATO + pose + '.webp';
    dice.textContent = frase || '';
    btn.classList.remove('is-salta');
    void btn.offsetWidth; // reinicia la animación
    btn.classList.add('is-salta');
    clearTimeout(tGato);
    tGato = setTimeout(function () { img.src = GATO + 'sentado.webp'; dice.textContent = ''; btn.classList.remove('is-salta'); }, 1800);
  }

  function crearGlobo() {
    globo = doc.createElement('aside');
    globo.className = 'esc-globo';
    globo.setAttribute('aria-label', 'Shiruvana');
    globo.innerHTML = globoHTML(lineaDelDia(new Date()));
    // Sin la imagen del gato, el globo queda sin gato (no con un ícono roto).
    globo.querySelector('.esc-gato img').onerror = function () { var b = globo.querySelector('.esc-gato'); if (b) b.hidden = true; };
    globo.querySelector('.esc-plegar').addEventListener('click', function () { plegar(!globo.classList.contains('is-plegado'), true); });
    globo.querySelector('.esc-gato').addEventListener('click', function () { toques++; gato('festeja', fraseGato(toques)); });
    doc.body.appendChild(globo);
    plegar(plegadoInicial(load(), false), false);
  }

  function init() {
    if (!$('.esc-chispas')) {
      var capa = doc.createElement('div');
      capa.className = 'esc-chispas';
      capa.setAttribute('aria-hidden', 'true');
      capa.innerHTML = chispasHTML(CHISPAS);
      doc.body.appendChild(capa);
    }
    if ($('.esc-globo')) return;
    crearGlobo();
    ubicar();
    if (!root.MutationObserver) return;
    // Cambio de theme: app.js escribe data-theme en <body>.
    new root.MutationObserver(ubicar).observe(doc.body, { attributes: true, attributeFilter: ['data-theme'] });
    // El consejo aparece a los 6 s (shiruvana.js) y header.js lo deja en #ghTip.
    var tip = $('#ghTip');
    if (tip) new root.MutationObserver(ubicar).observe(tip, { childList: true });
    // «Ahora no», la acción o Esc lo ocultan estando ya en el globo.
    new root.MutationObserver(ubicar).observe(globo.querySelector('.esc-slot'), { attributes: true, attributeFilter: ['hidden'], subtree: true });
  }

  root.GuaridaEscena = { version: VERSION, api: api };

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
  else init();
})(typeof window !== 'undefined' ? window : this);
