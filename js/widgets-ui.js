/*!
 * js/widgets-ui.js — Widgets de La Guarida sin ventanitas del navegador (1.1.0, 2026-10-31, RG-4 + RG-8)
 *
 * 1.1.0 (RG-8): quitar widgets. widgets.js nunca tuvo cómo borrarlos. En modo edición
 * cada widget muestra ✕ (igual que favoritos y enlaces); al tocarlo se quita al instante
 * y el aviso ofrece «Deshacer» 10 s. Si después guardás otra cosa, el Deshacer se cancela.
 * js/widgets.js no se toca (lo sigue usando La Guarida de siempre). Acá:
 *  1. «＋ Widget» abre un panel con los widgets disponibles (ícono, nombre y para qué sirve)
 *     en lugar del prompt() con números.
 *  2. Tocar una cuenta regresiva abre un panel con título y un selector de fecha, en lugar
 *     de dos prompt() y un alert(). Cada contador se edita a sí mismo (antes siempre se
 *     editaba el primero).
 *  3. La fecha del contador se muestra en hora local: widgets.js lee «2026-12-25» como
 *     medianoche UTC y en Argentina mostraba 24/12. El dato guardado no cambia de formato
 *     (YYYY-MM-DD), así La Guarida de siempre lo sigue leyendo igual.
 * Intercepto los clics en fase de captura, antes que los oyentes de widgets.js.
 * Las funciones puras se exportan para los tests.
 */
(function (root) {
  'use strict';

  var VERSION = '1.1.0';
  var DESHACER_MS = 10000;
  var DIA = 24 * 60 * 60 * 1000;

  // Para qué sirve cada uno (los nombres e íconos salen de widgets.js).
  var DESC = {
    clock: 'Hora y fecha de tu PC.',
    greeting: 'Un saludo según la hora.',
    notes: 'Una libreta que se guarda sola.',
    counter: 'Días que faltan para una fecha.',
    all_resets: 'Reinicio diario y semanal de GW2.',
    gw2_news: 'Las últimas noticias de Guild Wars 2.',
    twitch: 'Seguidores y si estás en vivo.',
    youtube: 'Suscriptores y tu último video.'
  };

  // La misma configuración inicial que pone widgets.js.
  function defaultConfig(type) {
    if (type === 'counter') return { title: 'Cuenta regresiva', date: '' };
    if (type === 'notes') return { text: '' };
    if (type === 'clock') return { format: '24h', showDate: true };
    if (type === 'greeting') return { name: '' };
    return {};
  }

  // Lo que muestra el panel: [{ type, label, icon, desc, count }].
  function pickerItems(types, widgets) {
    var count = {};
    (widgets || []).forEach(function (w) { count[w.type] = (count[w.type] || 0) + 1; });
    return Object.keys(types || {}).map(function (t) {
      return { type: t, label: types[t].label, icon: types[t].icon, desc: DESC[t] || '', count: count[t] || 0 };
    });
  }

  // Widgets en el orden en que se dibujan (widgets.js junta izquierda + derecha).
  function combined(state) {
    var s = state || {};
    return [].concat(s.widgets_left || [], s.widgets_right || []);
  }

  // El k-ésimo widget de un tipo, o null.
  function nthOfType(list, type, k) {
    var n = -1;
    for (var i = 0; i < (list || []).length; i++) {
      if (list[i] && list[i].type === type && ++n === k) return list[i];
    }
    return null;
  }

  function addWidget(state, type) {
    if (!state.widgets_left) state.widgets_left = [];
    var w = { type: type, position: state.widgets_left.length, config: defaultConfig(type) };
    state.widgets_left.push(w);
    return w;
  }

  // Quita el k-ésimo widget DIBUJADO. widgets.js no dibuja los tipos que no conoce,
  // así que esos no cuentan para el índice. Devuelve { widget, side, index } o null.
  function removeAt(state, k, known) {
    var s = state || {};
    var lados = [['widgets_left', s.widgets_left || []], ['widgets_right', s.widgets_right || []]];
    var n = -1;
    for (var j = 0; j < lados.length; j++) {
      var list = lados[j][1];
      for (var i = 0; i < list.length; i++) {
        if (!list[i] || (known && !known[list[i].type])) continue;
        if (++n === k) {
          var w = list.splice(i, 1)[0];
          list.forEach(function (x, idx) { if (x) x.position = idx; });
          return { widget: w, side: lados[j][0], index: i };
        }
      }
    }
    return null;
  }

  // Lo vuelve a poner donde estaba.
  function putBack(state, removed) {
    if (!state || !removed) return;
    if (!state[removed.side]) state[removed.side] = [];
    var list = state[removed.side];
    list.splice(Math.min(removed.index, list.length), 0, removed.widget);
    list.forEach(function (x, idx) { if (x) x.position = idx; });
  }

  // Valida lo que se escribió en el panel del contador.
  function validCounter(title, date) {
    var t = String(title == null ? '' : title).trim() || 'Cuenta regresiva';
    var d = String(date == null ? '' : date).trim();
    if (d && !/^\d{4}-\d{2}-\d{2}$/.test(d)) return { ok: false, error: 'La fecha tiene que ser día, mes y año.' };
    if (d) {
      var p = d.split('-').map(Number);
      var x = new Date(p[0], p[1] - 1, p[2]);
      if (x.getFullYear() !== p[0] || x.getMonth() !== p[1] - 1 || x.getDate() !== p[2]) return { ok: false, error: 'Esa fecha no existe.' };
    }
    return { ok: true, config: { title: t, date: d } };
  }

  function dos(n) { return (n < 10 ? '0' : '') + n; }

  // Días que faltan hasta la medianoche LOCAL de esa fecha, y la fecha como dd/mm/aaaa.
  function counterView(date, now) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) return null;
    var p = date.split('-').map(Number);
    var target = new Date(p[0], p[1] - 1, p[2]).getTime();
    return { days: Math.max(0, Math.ceil((target - now) / DIA)), label: dos(p[2]) + '/' + dos(p[1]) + '/' + p[0] };
  }

  var api = {
    VERSION: VERSION, DESC: DESC, defaultConfig: defaultConfig, pickerItems: pickerItems, combined: combined,
    nthOfType: nthOfType, addWidget: addWidget, validCounter: validCounter, counterView: counterView,
    DESHACER_MS: DESHACER_MS, removeAt: removeAt, putBack: putBack
  };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  if (!root || !root.document) return;

  var doc = root.document;
  function $(s) { return doc.querySelector(s); }
  function state() { return (root.Data && root.Data.state) || {}; }
  function kit() { return root.GNKit; }
  function guardarYDibujar() {
    if (root.Data && root.Data.save) root.Data.save();
    if (root.Widgets && root.Widgets.renderAll) root.Widgets.renderAll();
  }
  function el(tag, cls, text) {
    var e = doc.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  // ---- 1. Panel «Agregar un widget» ----
  function abrirCatalogo() {
    var K = kit();
    var types = (root.Widgets && root.Widgets.WIDGET_TYPES) || {};
    if (!K) return;
    var elegido = null;
    var grid = el('div', 'gw-pick');
    pickerItems(types, combined(state())).forEach(function (it) {
      var b = el('button', 'gw-pick__item');
      b.type = 'button';
      var img = el('img', 'gw-pick__icon');
      img.src = it.icon; img.alt = ''; img.width = 28; img.height = 28;
      var txt = el('span', 'gw-pick__txt');
      txt.appendChild(el('b', '', it.label));
      txt.appendChild(el('span', '', it.desc));
      b.appendChild(img);
      b.appendChild(txt);
      if (it.count) b.appendChild(el('span', 'gw-pick__count', it.count === 1 ? 'ya tenés 1' : 'ya tenés ' + it.count));
      b.addEventListener('click', function () {
        elegido = it;
        var x = b.closest('.gk-sheet');
        var close = x && x.querySelector('[data-gk-v="__close"]');
        if (close) close.click();
      });
      grid.appendChild(b);
    });
    K.sheet({ title: 'Agregar un widget', body: grid, actions: [{ label: 'Cancelar', value: null }] }).then(function () {
      if (!elegido) return;
      addWidget(state(), elegido.type);
      guardarYDibujar();
      K.notify('Agregué «' + elegido.label + '» al final de Widgets.', { kind: 'ok' });
      var all = doc.querySelectorAll('#widgetsLeft .widget');
      var last = all[all.length - 1];
      if (last && last.scrollIntoView) last.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  // ---- 2. Panel de la cuenta regresiva ----
  function abrirContador(k) {
    var K = kit();
    var w = nthOfType(combined(state()), 'counter', k);
    if (!K || !w) return;
    var cfg = w.config || {};
    var form = el('div', 'gw-form');
    var l1 = el('label', 'gw-field');
    l1.appendChild(el('span', '', 'Qué esperás'));
    var title = el('input');
    title.type = 'text'; title.maxLength = 60; title.value = cfg.title || 'Cuenta regresiva';
    l1.appendChild(title);
    var l2 = el('label', 'gw-field');
    l2.appendChild(el('span', '', 'Fecha'));
    var date = el('input');
    date.type = 'date'; date.value = cfg.date || '';
    l2.appendChild(date);
    var err = el('p', 'gw-error');
    err.setAttribute('role', 'alert');
    form.appendChild(l1); form.appendChild(l2); form.appendChild(err);

    function pedir() {
      return K.sheet({
        title: 'Cuenta regresiva', body: form,
        actions: [{ label: 'Cancelar', value: null }, { label: 'Guardar', value: 'ok', primary: true }]
      }).then(function (v) {
        if (v !== 'ok') return;
        var r = validCounter(title.value, date.value);
        if (!r.ok) { err.textContent = r.error; return pedir(); }
        w.config = r.config;
        guardarYDibujar();
        K.notify(r.config.date ? 'Listo: «' + r.config.title + '» el ' + counterView(r.config.date, Date.now()).label + '.' : 'Guardé el título; falta la fecha.', { kind: 'ok' });
      });
    }
    pedir();
    setTimeout(function () { date.focus(); }, 0);
  }

  // ---- 3. Fecha del contador en hora local ----
  function corregirContadores() {
    var list = combined(state());
    Array.prototype.forEach.call(doc.querySelectorAll('#widgetsLeft [data-widget-type="counter"]'), function (node, k) {
      var w = nthOfType(list, 'counter', k);
      var v = w && w.config && counterView(w.config.date, Date.now());
      if (!v) return;
      var d = node.querySelector('.widget-counter-days'); if (d) d.textContent = String(v.days);
      var l = node.querySelector('.widget-counter-label'); if (l) l.textContent = v.days === 1 ? 'día restante' : 'días restantes';
      var f = node.querySelector('.widget-counter-date'); if (f) f.textContent = v.label;
      node.setAttribute('title', 'Tocá para cambiar el título o la fecha');
    });
  }

  // ---- 4. Quitar widgets (RG-8) ----
  function tipos() { return (root.Widgets && root.Widgets.WIDGET_TYPES) || {}; }

  function ponerBotones() {
    var types = tipos();
    var shown = combined(state()).filter(function (w) { return w && types[w.type]; });
    Array.prototype.forEach.call(doc.querySelectorAll('#widgetsLeft .widget'), function (node, k) {
      if (node.querySelector(':scope > .edit-actions')) return;
      var w = shown[k];
      var nombre = (w && types[w.type] && types[w.type].label) || 'widget';
      var box = el('div', 'edit-actions gw-del');
      var b = el('button', 'del-btn', '✕');
      b.type = 'button';
      b.setAttribute('data-gw-del', '');
      b.title = 'Quitar ' + nombre;
      b.setAttribute('aria-label', 'Quitar el widget ' + nombre);
      box.appendChild(b);
      node.appendChild(box);
    });
  }

  var deshacer = null;
  var reponiendo = false;
  function cancelarDeshacer() { if (deshacer) { deshacer.close(); deshacer = null; } }

  function quitar(node) {
    var K = kit();
    var nodes = Array.prototype.slice.call(doc.querySelectorAll('#widgetsLeft .widget'));
    var types = tipos();
    var r = removeAt(state(), nodes.indexOf(node), types);
    if (!r) return;
    cancelarDeshacer();
    guardarYDibujar();
    if (!K) return;
    var nombre = (types[r.widget.type] && types[r.widget.type].label) || 'widget';
    deshacer = K.notify('Eliminé el widget «' + nombre + '».', {
      kind: 'info', timeout: DESHACER_MS,
      action: { label: 'Deshacer', fn: function () {
        deshacer = null;
        reponiendo = true;
        putBack(state(), r);
        guardarYDibujar();
        reponiendo = false;
        K.notify('Listo, volví a poner «' + nombre + '».', { kind: 'ok' });
      } }
    });
  }

  // Cualquier otro guardado cancela el Deshacer (así nunca pisa algo posterior).
  function vigilarGuardado() {
    var D = root.Data;
    if (!D || !D.save || D.save.__gw) return;
    var save = D.save;
    D.save = function () { if (!reponiendo && deshacer) cancelarDeshacer(); return save.apply(D, arguments); };
    D.save.__gw = true;
  }

  function init() {
    doc.addEventListener('click', function (ev) {
      var t = ev.target;
      if (!t || !t.closest || !t.closest('#widgetsLeft')) return;
      var del = t.closest('[data-gw-del]');
      if (del) {
        ev.preventDefault(); ev.stopPropagation();
        quitar(del.closest('.widget'));
        return;
      }
      if (t.closest('.add-widget-btn')) {
        ev.preventDefault(); ev.stopPropagation();
        abrirCatalogo();
        return;
      }
      var c = t.closest('[data-widget-type="counter"]');
      if (c) {
        ev.preventDefault(); ev.stopPropagation();
        var all = Array.prototype.slice.call(doc.querySelectorAll('#widgetsLeft [data-widget-type="counter"]'));
        abrirContador(all.indexOf(c));
      }
    }, true);

    var box = $('#widgetsLeft');
    if (box && root.MutationObserver) new root.MutationObserver(corregirContadores).observe(box, { childList: true });
    corregirContadores();
    // Twitch y YouTube rehacen su tarjeta al cargar: por eso miro también adentro.
    // ponerBotones solo agrega donde falta, así que no se repite sin fin.
    if (box && root.MutationObserver) new root.MutationObserver(ponerBotones).observe(box, { childList: true, subtree: true });
    ponerBotones();
    // data.js carga después que este archivo: espero a que exista Data.save.
    setTimeout(vigilarGuardado, 0);
  }

  root.GuaridaWidgets = { version: VERSION, api: api, abrirCatalogo: abrirCatalogo };

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
  else init();
})(typeof window !== 'undefined' ? window : this);
