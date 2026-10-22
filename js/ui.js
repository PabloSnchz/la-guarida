/*!
 * js/ui.js — La Guarida: cabecera, resumen y paneles (1.0.0, 2026-10-22)
 *
 * Lenguaje visual del Gato Design System (DEC-028), sin datos de la Factory:
 *  - saludo, fecha y contadores de TU Guarida (favoritos, enlaces, apps);
 *  - contador en el título de cada panel;
 *  - menús «＋ Agregar», «Backup» y «Ecosistema» (uno abierto a la vez,
 *    se cierran con Esc, con un clic afuera o al elegir algo);
 *  - navegación por secciones con la pestaña activa marcada.
 * Las funciones puras se exportan para los tests.
 */
(function (root) {
  'use strict';

  var VERSION = '1.0.0';

  function saludo(date) {
    var h = date.getHours();
    if (h >= 5 && h < 12) return 'Buen día';
    if (h >= 12 && h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  }

  function dos(n) { return (n < 10 ? '0' : '') + n; }

  var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

  function fecha(date) {
    return DIAS[date.getDay()] + ' ' + date.getDate() + ' de ' + MESES[date.getMonth()] + ' · ' + dos(date.getHours()) + ':' + dos(date.getMinutes());
  }

  function plural(n, uno, varios) { return n + ' ' + (n === 1 ? uno : varios); }

  function cuentas(state) {
    var st = state || {};
    var cats = st.categories || [];
    var links = 0;
    cats.forEach(function (c) { links += (c.links || []).length; });
    return {
      favoritos: (st.favorites || []).length,
      categorias: cats.length,
      enlaces: links,
      lanzador: (st.apps || []).length + (st.games || []).length
    };
  }

  function badgesHTML(c) {
    function b(n, uno, varios) { return '<span class="gn-badge"><b>' + n + '</b> ' + (n === 1 ? uno : varios) + '</span>'; }
    return b(c.favoritos, 'favorito', 'favoritos') +
      b(c.categorias, 'categoría', 'categorías') +
      b(c.enlaces, 'enlace', 'enlaces') +
      b(c.lanzador, 'app o juego', 'apps y juegos');
  }

  var api = { VERSION: VERSION, saludo: saludo, fecha: fecha, plural: plural, cuentas: cuentas, badgesHTML: badgesHTML };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  if (!root || !root.document) return;

  var doc = root.document;
  function $(s) { return doc.querySelector(s); }
  function $$(s) { return Array.prototype.slice.call(doc.querySelectorAll(s)); }
  function state() { return (root.Data && root.Data.state) || {}; }

  function pintarResumen() {
    var now = new Date();
    var t = $('#heroTitle'); if (t) t.textContent = saludo(now) + ', Pablo';
    var d = $('#heroDate'); if (d) d.textContent = fecha(now);
  }

  function pintarCuentas() {
    var c = cuentas(state());
    var b = $('#heroBadges'); if (b) b.innerHTML = badgesHTML(c);
    var set = function (id, txt, label) { var el = $(id); if (el) { el.textContent = txt; el.setAttribute('aria-label', label); } };
    set('#favCount', String(c.favoritos), plural(c.favoritos, 'favorito', 'favoritos'));
    set('#catCount', String(c.categorias), plural(c.categorias, 'categoría', 'categorías') + ', ' + plural(c.enlaces, 'enlace', 'enlaces'));
    set('#launcherCount', String(c.lanzador), plural(c.lanzador, 'app o juego', 'apps y juegos'));
    var w = $$('#widgetsLeft .widget').length;
    set('#widgetCount', String(w), plural(w, 'widget', 'widgets'));
  }

  // ---- Menús (details/summary) ----
  function cerrarMenus(excepto) {
    $$('details.gn-menu[open]').forEach(function (m) { if (m !== excepto) m.removeAttribute('open'); });
  }

  function cablearMenus() {
    $$('details.gn-menu').forEach(function (m) {
      m.addEventListener('toggle', function () { if (m.hasAttribute('open')) cerrarMenus(m); });
      m.addEventListener('click', function (ev) {
        var t = ev.target;
        if (t && t.closest && t.closest('.gn-menu__item')) setTimeout(function () { m.removeAttribute('open'); }, 0);
      });
    });
    doc.addEventListener('click', function (ev) {
      var t = ev.target;
      if (!t || !t.closest || !t.closest('details.gn-menu')) cerrarMenus(null);
    });
    doc.addEventListener('keydown', function (ev) {
      if (ev.key !== 'Escape') return;
      var abierto = $('details.gn-menu[open]');
      if (!abierto) return;
      abierto.removeAttribute('open');
      var s = abierto.querySelector('summary');
      if (s && s.focus) s.focus();
    });
  }

  // ---- Navegación por secciones ----
  function marcarTab(id) {
    $$('.app-nav [data-nav]').forEach(function (a) {
      if (a.getAttribute('data-nav') === id) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }

  function cablearNav() {
    $$('.app-nav [data-nav]').forEach(function (a) {
      a.addEventListener('click', function () { marcarTab(a.getAttribute('data-nav')); });
    });
    if (!root.IntersectionObserver) return;
    var io = new root.IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) marcarTab(e.target.id); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('.app-nav [data-nav]').forEach(function (a) {
      var s = doc.getElementById(a.getAttribute('data-nav'));
      if (s) io.observe(s);
    });
  }

  function init() {
    pintarResumen();
    pintarCuentas();
    cablearMenus();
    cablearNav();
    setInterval(pintarResumen, 30000);
    if (root.MutationObserver) {
      var mo = new root.MutationObserver(pintarCuentas);
      ['#favoritesGrid', '#categoriesGrid', '#launcherAppsGrid', '#launcherGamesGrid', '#widgetsLeft'].forEach(function (s) {
        var el = $(s);
        if (el) mo.observe(el, { childList: true });
      });
    }
  }

  root.GuaridaUI = { version: VERSION, api: api, refrescar: pintarCuentas };

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
  else init();
})(typeof window !== 'undefined' ? window : this);
