/*!
 * next/js/kit.js — Kit de La Guarida: reloj común y avisos (1.0.0, 2026-10-31, RG-1)
 *
 * Restyle de La Guarida (RG-0b, aprobado por Pablo el 2026-10-31):
 *  - Reloj común: la misma lógica que el reloj de La Bóveda (BL-078), en versión
 *    compacta para la cabecera de la Guarida. Reset diario 00:00 UTC, semanal
 *    lunes 07:30 UTC; dorado («está cerca») con menos de 1 h para el diario y
 *    menos de 24 h para el semanal. Sin red y sin guardar nada.
 *  - Avisos y paneles propios para reemplazar alert(), confirm() y prompt()
 *    (RG-4 y RG-5): no frenan la página y siguen el theme.
 * En RG-1 el kit está cargado pero nadie lo usa todavía: la vista previa se ve
 * igual que La Guarida de siempre. Las funciones puras se exportan para los tests.
 */
(function (root) {
  'use strict';

  var VERSION = '1.0.0';
  var MIN = 60 * 1000;
  var HORA = 60 * MIN;
  var DIA = 24 * HORA;

  // ====== Reloj ======
  function nextDaily(now) {
    var d = new Date(now);
    return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1);
  }

  function nextWeekly(now) {
    var d = new Date(now);
    var base = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 7, 30);
    var t = base + ((1 - d.getUTCDay() + 7) % 7) * DIA;
    return t > now ? t : t + 7 * DIA;
  }

  // «8 h 5 min», «1 d 17 h», «42 min», «menos de 1 min».
  function dur(ms) {
    if (!isFinite(ms) || ms <= 0) return '—';
    var m = Math.floor(ms / MIN);
    if (m < 1) return 'menos de 1 min';
    var d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60), mi = m % 60;
    if (d) return d + ' d ' + h + ' h';
    if (h) return h + ' h ' + mi + ' min';
    return mi + ' min';
  }

  // Regla de «está cerca» de La Bóveda; la temporada avisa con menos de 3 días.
  var CERCA = { daily: HORA, psna: HORA, weekly: DIA, season: 3 * DIA };
  function soon(kind, ms) {
    return ms > 0 && ms < (CERCA[kind] || 0);
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // Un reloj compacto: ícono 18 px, nombre (se oculta en pantallas angostas) y valor.
  function clockHTML(o) {
    var c = o || {};
    return '<span class="gk-clk' + (c.soon ? ' is-soon' : '') + '"' + (c.id ? ' id="' + esc(c.id) + '"' : '') +
      ' title="' + esc(c.title || c.label) + '">' +
      (c.icon ? '<img class="gk-clk__icon" src="' + esc(c.icon) + '" alt="" width="18" height="18">' : '') +
      '<span class="gk-clk__label">' + esc(c.label) + '</span>' +
      '<b class="gk-clk__value">' + esc(c.value) + '</b></span>';
  }

  // Los relojes de la cabecera, calculados para un instante.
  function clocks(now, opts) {
    var o = opts || {};
    var dd = nextDaily(now) - now;
    var dw = nextWeekly(now) - now;
    var local = new Date(now);
    var out = [
      { key: 'local', label: 'Local', title: 'Hora local', value: dos(local.getHours()) + ':' + dos(local.getMinutes()), soon: false },
      { key: 'daily', label: 'Diario', title: 'Reset diario: todos los días 00:00 UTC', value: dur(dd), soon: soon('daily', dd) },
      { key: 'weekly', label: 'Semanal', title: 'Reset semanal: lunes 07:30 UTC', value: dur(dw), soon: soon('weekly', dw) }
    ];
    if (o.seasonEnd) {
      var ds = o.seasonEnd - now;
      out.push({ key: 'season', label: 'Temporada', title: 'Fin de la temporada de la Cámara del Brujo', value: ds > 0 ? dur(ds) : 'terminó', soon: soon('season', ds) });
    }
    return out;
  }

  function dos(n) { return (n < 10 ? '0' : '') + n; }

  var api = {
    VERSION: VERSION, nextDaily: nextDaily, nextWeekly: nextWeekly, dur: dur, soon: soon,
    esc: esc, clockHTML: clockHTML, clocks: clocks
  };

  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  if (!root || !root.document) return;

  // ====== Avisos y paneles (DOM) ======
  var doc = root.document;
  var region = null;

  function ensureRegion() {
    if (region) return region;
    region = doc.createElement('div');
    region.className = 'gk-toasts';
    region.setAttribute('aria-live', 'polite');
    doc.body.appendChild(region);
    return region;
  }

  // Aviso que no frena la página. kind: info | ok | warn | error. Los de error quedan hasta cerrarlos.
  function notify(text, opts) {
    var o = opts || {};
    var kind = o.kind || 'info';
    var el = doc.createElement('div');
    el.className = 'gk-toast gk-toast--' + kind;
    el.setAttribute('role', kind === 'error' ? 'alert' : 'status');
    el.innerHTML = '<span class="gk-toast__text"></span>' +
      (o.action ? '<button type="button" class="gk-btn gk-btn--primary" data-gk="act"></button>' : '') +
      '<button type="button" class="gk-btn gk-btn--ghost" data-gk="close" aria-label="Cerrar">✕</button>';
    el.querySelector('.gk-toast__text').textContent = text;
    if (o.action) el.querySelector('[data-gk="act"]').textContent = o.action.label;
    function close() { if (el.parentNode) el.parentNode.removeChild(el); }
    el.addEventListener('click', function (ev) {
      var b = ev.target.closest ? ev.target.closest('[data-gk]') : null;
      if (!b) return;
      if (b.getAttribute('data-gk') === 'act' && o.action && o.action.fn) o.action.fn();
      close();
    });
    ensureRegion().appendChild(el);
    var t = o.timeout != null ? o.timeout : (kind === 'error' ? 0 : 6000);
    if (t) setTimeout(close, t);
    return { close: close };
  }

  // Panel modal propio. actions: [{ label, value, primary }]. Devuelve una promesa con el value elegido (null si se cierra).
  function sheet(o) {
    var opts = o || {};
    return new Promise(function (resolve) {
      var prev = doc.activeElement;
      var wrap = doc.createElement('div');
      wrap.className = 'gk-sheet';
      wrap.innerHTML = '<div class="gk-sheet__card" role="dialog" aria-modal="true" aria-labelledby="gkSheetTitle">' +
        '<div class="gk-sheet__head"><h3 id="gkSheetTitle" class="gk-sheet__title"></h3>' +
        '<button type="button" class="gk-btn gk-btn--ghost" data-gk-v="__close" aria-label="Cerrar">✕</button></div>' +
        '<div class="gk-sheet__body"></div><div class="gk-sheet__foot"></div></div>';
      wrap.querySelector('.gk-sheet__title').textContent = opts.title || '';
      var body = wrap.querySelector('.gk-sheet__body');
      if (opts.body && opts.body.nodeType) body.appendChild(opts.body);
      else body.textContent = opts.text || '';
      var foot = wrap.querySelector('.gk-sheet__foot');
      (opts.actions || []).forEach(function (a, i) {
        var b = doc.createElement('button');
        b.type = 'button';
        b.className = 'gk-btn ' + (a.primary ? 'gk-btn--primary' : 'gk-btn--ghost') + (a.danger ? ' gk-btn--danger' : '');
        b.textContent = a.label;
        b.setAttribute('data-gk-v', String(i));
        foot.appendChild(b);
      });
      function done(v) {
        doc.removeEventListener('keydown', onKey, true);
        if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
        if (prev && prev.focus) prev.focus();
        resolve(v);
      }
      function onKey(ev) {
        if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); done(null); }
      }
      wrap.addEventListener('click', function (ev) {
        if (ev.target === wrap) { done(null); return; }
        var b = ev.target.closest ? ev.target.closest('[data-gk-v]') : null;
        if (!b) return;
        var k = b.getAttribute('data-gk-v');
        done(k === '__close' ? null : opts.actions[Number(k)].value);
      });
      doc.addEventListener('keydown', onKey, true);
      doc.body.appendChild(wrap);
      var first = foot.querySelector('.gk-btn--primary') || foot.querySelector('button');
      if (first) first.focus();
    });
  }

  // Confirmación propia: promesa con true o false.
  function ask(text, o) {
    var opts = o || {};
    return sheet({
      title: opts.title || 'Confirmar',
      text: text,
      actions: [
        { label: opts.cancel || 'Cancelar', value: false },
        { label: opts.ok || 'Aceptar', value: true, primary: true, danger: !!opts.danger }
      ]
    }).then(function (v) { return v === true; });
  }

  root.GNKit = {
    version: VERSION, api: api, notify: notify, sheet: sheet, ask: ask,
    clockHTML: clockHTML, clocks: clocks
  };
})(typeof window !== 'undefined' ? window : this);
