/*!
 * js/shiruvana.js — Shiruvana, anfitriona de La Guarida (2.0.0, 2026-10-22)
 *
 * DEC-028 (reemplaza a DEC-027): La Guarida es un lanzador personal. Comparte
 * con el Centro de decisiones solo el lenguaje visual; acá no hay datos de la
 * Factory. Yo ayudo a llegar rápido a lo tuyo y a mantenerlo ordenado:
 *
 *   1. Portal «¿A dónde vamos?» (Ctrl+K o /): busca en favoritos, enlaces,
 *      apps, juegos, atajos y acciones. Abre cada resultado haciendo clic en el
 *      elemento real, así reusa la lógica de app.js (Chrome, launch:, edición).
 *   2. «Lo de siempre»: lo que más abrís en esta franja del día. Aprende solo
 *      en este navegador (guarida:uso:v1) y aparece con 10 aperturas o más.
 *   3. Consejos de orden: como mucho uno por día, nunca en modo edición, cada
 *      uno con su acción y «Ahora no» (30 días de silencio).
 *
 * No pide nada a la red. Las funciones puras se exportan para los tests.
 */
(function (root) {
  'use strict';

  var VERSION = '2.0.0';
  var USO_KEY = 'guarida:uso:v1';
  var META_KEY = 'guarida:shiruvana:v1';
  var OLD_FACTORY_KEY = 'guarida:factory:v1'; // copia de DEC-027: se borra
  var MIN_USOS = 10;
  var MAX_SIEMPRE = 5;
  var DIA = 24 * 60 * 60 * 1000;
  var SILENCIO_DIAS = 30;
  var BACKUP_DIAS = 30;
  var MAX_CLAVES = 300;
  var AVATAR = 'data:image/webp;base64,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';

  var KIND_ORDER = { fav: 0, link: 1, game: 2, app: 3, shortcut: 4, action: 5, theme: 6 };
  var GROUP_LABEL = { fav: 'Favoritos', game: 'Juegos', app: 'Apps', shortcut: 'Atajos', action: 'Acciones', theme: 'Themes' };

  // ====== Texto ======
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function norm(s) {
    return String(s == null ? '' : s).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function domain(url) {
    var m = /^[a-z][a-z0-9+.-]*:\/\/([^/?#]+)/i.exec(String(url || ''));
    return m ? m[1].replace(/^www\./i, '').toLowerCase() : '';
  }

  // Distancia de edición con transposición (Damerau, versión restringida).
  function editDistance(a, b) {
    var m = a.length, n = b.length, d = [], i, j;
    for (i = 0; i <= m; i++) { d[i] = [i]; }
    for (j = 0; j <= n; j++) { d[0][j] = j; }
    for (i = 1; i <= m; i++) {
      for (j = 1; j <= n; j++) {
        var cost = a[i - 1] === b[j - 1] ? 0 : 1;
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
          d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
        }
      }
    }
    return d[m][n];
  }

  // Puntaje de una consulta contra un texto: 0 = no coincide.
  function score(query, text) {
    var q = norm(query), t = norm(text);
    if (!q || !t) return 0;
    if (t === q) return 120;
    if (t.indexOf(q) === 0) return 100;
    var words = t.split(/[\s\-_.·/()]+/).filter(Boolean);
    var i;
    for (i = 0; i < words.length; i++) { if (words[i].indexOf(q) === 0) return 80; }
    if (t.indexOf(q) !== -1) return 60;
    // Errores de tipeo: con 4 letras o más, una diferencia contra una palabra o su comienzo.
    if (q.length >= 4) {
      for (i = 0; i < words.length; i++) {
        var w = words[i];
        if (w.length >= q.length && editDistance(q, w.slice(0, q.length)) <= 1) return 40;
        if (Math.abs(w.length - q.length) <= 1 && editDistance(q, w) <= 1) return 40;
      }
    }
    // Letras en orden («gwe» → «GW2 Efficiency»), solo con 3 letras o más.
    if (q.length >= 3) {
      var k = 0;
      for (i = 0; i < t.length && k < q.length; i++) { if (t[i] === q[k]) k++; }
      if (k === q.length) return 20;
    }
    return 0;
  }

  // ====== Índice de búsqueda ======
  // extras: { shortcuts: [{ id, label, url, emoji }], actions: [{ id, label, emoji, hint }], themes: [{ value, label }] }
  function buildIndex(state, extras) {
    var st = state || {};
    var ex = extras || {};
    var out = [];
    (st.favorites || []).forEach(function (f) {
      out.push({ kind: 'fav', key: 'fav:' + f.id, id: f.id, label: f.name, sub: domain(f.url), emoji: f.emoji || '⭐', url: f.url, group: GROUP_LABEL.fav });
    });
    (st.categories || []).forEach(function (c) {
      (c.links || []).forEach(function (l) {
        out.push({ kind: 'link', key: 'link:' + c.id + ':' + l.id, id: l.id, catId: c.id, label: l.name, sub: domain(l.url), emoji: l.emoji || c.emoji || '🔗', url: l.url, group: 'Enlaces · ' + (c.name || 'Sin nombre'), extra: c.name });
      });
    });
    (st.games || []).forEach(function (g) {
      out.push({ kind: 'game', key: 'game:' + g.id, id: g.id, label: g.name, sub: 'Juego', emoji: g.emoji || '🎮', group: GROUP_LABEL.game });
    });
    (st.apps || []).forEach(function (a) {
      out.push({ kind: 'app', key: 'app:' + a.id, id: a.id, label: a.name, sub: 'App', emoji: a.emoji || '🚀', group: GROUP_LABEL.app });
    });
    (ex.shortcuts || []).forEach(function (s) {
      out.push({ kind: 'shortcut', key: 'sc:' + s.id, id: s.id, label: s.label, sub: domain(s.url), emoji: s.emoji || '🔗', url: s.url, group: GROUP_LABEL.shortcut });
    });
    (ex.actions || []).forEach(function (a) {
      out.push({ kind: 'action', key: 'act:' + a.id, id: a.id, label: a.label, sub: a.hint || '', emoji: a.emoji || '⚡', group: GROUP_LABEL.action });
    });
    (ex.themes || []).forEach(function (t) {
      out.push({ kind: 'theme', key: 'theme:' + t.value, id: t.value, label: 'Theme ' + t.label, sub: 'Cambiar theme', emoji: '🎨', group: GROUP_LABEL.theme });
    });
    return out;
  }

  function search(index, query, limit) {
    var max = limit || 8;
    if (!norm(query)) return [];
    var hits = [];
    (index || []).forEach(function (e) {
      var s = Math.max(score(query, e.label), Math.floor(score(query, e.sub) / 2), Math.floor(score(query, e.extra) / 3));
      if (s > 0) hits.push({ e: e, s: s });
    });
    hits.sort(function (a, b) {
      return (b.s - a.s) || (KIND_ORDER[a.e.kind] - KIND_ORDER[b.e.kind]) || String(a.e.label).localeCompare(String(b.e.label));
    });
    return hits.slice(0, max).map(function (h) { return h.e; });
  }

  // ====== Uso ======
  // Franjas: mañana 05–12, tarde 12–19, noche 19–05 (hora local).
  function franja(date) {
    var h = date.getHours();
    if (h >= 5 && h < 12) return 'm';
    if (h >= 12 && h < 19) return 't';
    return 'n';
  }

  function emptyUso() { return { v: 1, total: 0, items: {} }; }

  function record(uso, key, date) {
    var u = (uso && uso.items) ? uso : emptyUso();
    var it = u.items[key] || { m: 0, t: 0, n: 0, last: 0 };
    it[franja(date)] += 1;
    it.last = date.getTime();
    u.items[key] = it;
    u.total = (u.total || 0) + 1;
    var keys = Object.keys(u.items);
    if (keys.length > MAX_CLAVES) {
      keys.sort(function (a, b) { return u.items[a].last - u.items[b].last; });
      keys.slice(0, keys.length - MAX_CLAVES).forEach(function (k) { delete u.items[k]; });
    }
    return u;
  }

  // Lo de siempre: primero lo que abrís en esta franja; después, lo más abierto.
  function deSiempre(uso, index, date, max) {
    var u = (uso && uso.items) ? uso : emptyUso();
    if ((u.total || 0) < MIN_USOS) return [];
    var f = franja(date);
    var byKey = {};
    (index || []).forEach(function (e) { byKey[e.key] = e; });
    var rows = Object.keys(u.items).filter(function (k) { return byKey[k]; }).map(function (k) {
      var it = u.items[k];
      var total = (it.m || 0) + (it.t || 0) + (it.n || 0);
      return { e: byKey[k], s: (it[f] || 0) * 3 + total, last: it.last || 0 };
    }).filter(function (r) { return r.s > 0; });
    rows.sort(function (a, b) { return (b.s - a.s) || (b.last - a.last); });
    return rows.slice(0, max || MAX_SIEMPRE).map(function (r) { return r.e; });
  }

  // ====== Consejos de orden ======
  function urlKey(url) {
    return String(url || '').trim().toLowerCase()
      .replace(/^[a-z][a-z0-9+.-]*:\/\//, '').replace(/^www\./, '').replace(/[#?].*$/, '').replace(/\/+$/, '');
  }

  function dayKey(ms) {
    var d = new Date(ms);
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }

  function tips(state, meta, now) {
    var st = state || {};
    var mt = meta || {};
    var out = [];
    var favs = st.favorites || [];
    var cats = st.categories || [];
    if (!favs.length) {
      out.push({ id: 'sin-favoritos', text: 'Todavía no tenés favoritos. Son tus accesos de un clic: soltá un enlace en Favoritos o agregá uno.', action: { label: 'Agregar favorito', kind: 'click', target: '#addFavoriteBtn' } });
    }
    cats.forEach(function (c) {
      if (!(c.links || []).length) {
        out.push({ id: 'vacia:' + c.id, text: 'La categoría «' + c.name + '» está vacía. Si ya no la usás, la saco.', action: { label: 'Eliminar categoría', kind: 'click', target: '[data-action="delete-cat"][data-id="' + c.id + '"]' } });
      }
    });
    var seen = {};
    var entries = [];
    favs.forEach(function (f) { entries.push({ name: f.name, url: f.url, sel: '#favoritesGrid .fav-card[data-id="' + f.id + '"]' }); });
    cats.forEach(function (c) { (c.links || []).forEach(function (l) { entries.push({ name: l.name, url: l.url, sel: '.category-link[data-cat-id="' + c.id + '"][data-link-id="' + l.id + '"]' }); }); });
    entries.forEach(function (e) {
      var k = urlKey(e.url);
      if (!k) return;
      if (seen[k] && seen[k].length === 1) {
        var a = seen[k][0];
        out.push({ id: 'repetido:' + k, text: '«' + a.name + '» y «' + e.name + '» llevan a la misma página. Te los marco para que elijas cuál dejar.', action: { label: 'Mostrar', kind: 'flash', targets: [a.sel, e.sel] } });
      }
      (seen[k] = seen[k] || []).push(e);
    });
    var tieneDatos = favs.length + entries.length > 0;
    if (tieneDatos) {
      if (mt.lastBackup) {
        var dias = Math.floor((now - mt.lastBackup) / DIA);
        if (dias > BACKUP_DIAS) {
          out.push({ id: 'backup', text: 'Tu último backup es de hace ' + dias + ' días. Si el navegador se limpia, perdés favoritos y categorías.', action: { label: 'Hacer backup', kind: 'click', target: '#exportBtn' } });
        }
      } else if (mt.firstSeen && now - mt.firstSeen > BACKUP_DIAS * DIA) {
        out.push({ id: 'backup', text: 'No vi ningún backup en más de ' + BACKUP_DIAS + ' días. Si el navegador se limpia, perdés favoritos y categorías.', action: { label: 'Hacer backup', kind: 'click', target: '#exportBtn' } });
      }
    }
    var snooze = mt.snooze || {};
    return out.filter(function (t) { return !(snooze[t.id] && snooze[t.id] > now); });
  }

  // Uno por día como mucho y nunca mientras editás.
  function pickTip(list, meta, now, editing) {
    if (editing) return null;
    if (meta && meta.lastTipDay === dayKey(now)) return null;
    return (list && list[0]) || null;
  }

  // ====== Pintado (HTML) ======
  function selectorFor(e) {
    if (e.kind === 'fav') return '#favoritesGrid .fav-card[data-id="' + e.id + '"]';
    if (e.kind === 'link') return '.category-link[data-cat-id="' + e.catId + '"][data-link-id="' + e.id + '"]';
    if (e.kind === 'app' || e.kind === 'game') return '.launcher-item[data-type="' + e.kind + '"][data-id="' + e.id + '"]';
    return '';
  }

  function keyFromElement(el) {
    if (!el || !el.classList) return '';
    var g = function (a) { return el.getAttribute(a); };
    if (el.classList.contains('fav-card')) return 'fav:' + g('data-id');
    if (el.classList.contains('category-link')) return 'link:' + g('data-cat-id') + ':' + g('data-link-id');
    if (el.classList.contains('launcher-item')) return g('data-type') + ':' + g('data-id');
    return '';
  }

  function sayText(query, n) {
    if (!norm(query)) return 'Escribí lo que buscás. Enter abre el primero; Esc cierra.';
    if (!n) return 'No encontré nada con «' + query + '». Probá con otra palabra o con el comienzo del nombre.';
    if (n === 1) return 'Encontré 1. Enter lo abre.';
    return 'Encontré ' + n + ' cosas. Enter abre la primera.';
  }

  function resultsHTML(groups) {
    var i = 0;
    return groups.map(function (g, gi) {
      var gid = 'gnPortalG' + gi;
      return '<div role="group" aria-labelledby="' + gid + '" class="gn-portal__group">' +
        '<div class="gn-portal__gl" id="' + gid + '">' + esc(g.label) + '</div>' +
        g.items.map(function (e) {
          var idx = i++;
          return '<div role="option" id="gnOpt' + idx + '" class="gn-portal__res" data-i="' + idx + '" aria-selected="' + (idx === 0 ? 'true' : 'false') + '">' +
            '<span class="gn-portal__emoji" aria-hidden="true">' + esc(e.emoji) + '</span>' +
            '<span class="gn-portal__label">' + esc(e.label) + '</span>' +
            (e.sub ? '<span class="gn-portal__sub">' + esc(e.sub) + '</span>' : '') +
            '</div>';
        }).join('') + '</div>';
    }).join('');
  }

  // Agrupa respetando el orden de los resultados.
  function groupResults(list) {
    var groups = [], byLabel = {};
    list.forEach(function (e) {
      if (!byLabel[e.group]) { byLabel[e.group] = { label: e.group, items: [] }; groups.push(byLabel[e.group]); }
      byLabel[e.group].items.push(e);
    });
    return groups;
  }

  function flat(groups) {
    var out = [];
    groups.forEach(function (g) { out = out.concat(g.items); });
    return out;
  }

  function chipsHTML(list) {
    return list.map(function (e, i) {
      return '<button type="button" class="gn-usual__chip" data-usual="' + i + '" title="' + esc(e.label) + '">' +
        '<span aria-hidden="true">' + esc(e.emoji) + '</span>' + esc(e.label) + '</button>';
    }).join('');
  }

  function tipHTML(t) {
    return '<img class="gn-toast__avatar" src="' + AVATAR + '" alt="" width="32" height="32">' +
      '<div class="gn-toast__main">' +
        '<p class="gn-toast__who">Shiruvana · consejo de orden</p>' +
        '<p class="gn-toast__text">' + esc(t.text) + '</p>' +
        '<div class="gn-toast__actions">' +
          '<button type="button" class="gn-btn gn-btn--ghost" data-tip="later">Ahora no</button>' +
          '<button type="button" class="gn-btn gn-btn--primary" data-tip="do">' + esc(t.action.label) + '</button>' +
        '</div>' +
      '</div>';
  }

  var api = {
    VERSION: VERSION, USO_KEY: USO_KEY, META_KEY: META_KEY, OLD_FACTORY_KEY: OLD_FACTORY_KEY, MIN_USOS: MIN_USOS,
    esc: esc, norm: norm, domain: domain, editDistance: editDistance, score: score,
    buildIndex: buildIndex, search: search, franja: franja, record: record, deSiempre: deSiempre,
    urlKey: urlKey, dayKey: dayKey, tips: tips, pickTip: pickTip, selectorFor: selectorFor,
    keyFromElement: keyFromElement, sayText: sayText, resultsHTML: resultsHTML, groupResults: groupResults,
    chipsHTML: chipsHTML, tipHTML: tipHTML
  };

  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  if (!root || !root.document) return;

  // ====== Navegador ======
  var doc = root.document;
  function $(s) { return doc.querySelector(s); }
  function load(k, def) { try { var r = root.localStorage.getItem(k); return r ? JSON.parse(r) : def; } catch (e) { return def; } }
  function store(k, v) { try { root.localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin espacio: no es grave */ } }
  function state() { return (root.Data && root.Data.state) || {}; }
  function editing() { return doc.body.classList.contains('edit-mode'); }

  var ACTIONS = [
    { id: 'edit', label: 'Modo edición', emoji: '✏️', hint: 'Ordenar, editar o borrar', target: '#editModeBtn' },
    { id: 'addfav', label: 'Agregar favorito', emoji: '⭐', hint: 'Acceso de un clic', target: '#addFavoriteBtn' },
    { id: 'addcat', label: 'Agregar categoría', emoji: '📁', hint: 'Grupo de enlaces', target: '#addCategoryBtn' },
    { id: 'export', label: 'Hacer backup', emoji: '💾', hint: 'Descarga tus datos', target: '#exportBtn' },
    { id: 'import', label: 'Restaurar backup', emoji: '📂', hint: 'Desde un archivo .json', target: '#importBtn' }
  ];

  function extras() {
    var shortcuts = [];
    Array.prototype.forEach.call(doc.querySelectorAll('a[data-portal]'), function (a, i) {
      shortcuts.push({ id: a.getAttribute('data-portal') || String(i), label: a.getAttribute('data-label') || a.textContent.trim(), url: a.href, emoji: a.getAttribute('data-emoji') || '🔗' });
    });
    var themes = [];
    var sel = $('#themeSelect');
    if (sel) {
      Array.prototype.forEach.call(sel.options, function (o) {
        if (o.value !== 'random') themes.push({ value: o.value, label: o.textContent.replace(/^[^A-Za-zÁÉÍÓÚáéíóúÑñ0-9]+/, '').trim() });
      });
    }
    return { shortcuts: shortcuts, actions: ACTIONS, themes: themes };
  }

  function index() { return buildIndex(state(), extras()); }

  var uso = load(USO_KEY, emptyUso());
  var meta = load(META_KEY, {});
  if (!meta.firstSeen) { meta.firstSeen = Date.now(); store(META_KEY, meta); }

  function anotar(key) {
    if (!key) return;
    uso = record(uso, key, new Date());
    store(USO_KEY, uso);
  }

  function flash(selectors) {
    var first = null;
    selectors.forEach(function (s) {
      var el = $(s);
      if (!el) return;
      first = first || el;
      el.classList.add('gn-flash');
      setTimeout(function () { el.classList.remove('gn-flash'); }, 4000);
    });
    if (first && first.scrollIntoView) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Abre una entrada del índice reusando el elemento real de la pantalla.
  function activar(e) {
    if (!e) return;
    if (e.kind === 'action') {
      var a = ACTIONS.filter(function (x) { return x.id === e.id; })[0];
      var btn = a && $(a.target);
      if (btn) btn.click();
      return;
    }
    if (e.kind === 'theme') {
      var sel = $('#themeSelect');
      if (sel) { sel.value = e.id; sel.dispatchEvent(new root.Event('change', { bubbles: true })); }
      return;
    }
    if (e.kind === 'shortcut') {
      anotar(e.key);
      root.open(e.url, '_blank', 'noopener');
      return;
    }
    var el = $(selectorFor(e));
    if (el) { el.click(); return; } // el clic lo anota el oyente de uso
    if (e.url) { anotar(e.key); root.open(e.url, '_blank', 'noopener'); }
  }

  // ---- Portal ----
  var portal, input, list, say, abiertoDesde = null, actuales = [], sel = 0;

  function construirPortal() {
    portal = doc.createElement('div');
    portal.className = 'gn-portal';
    portal.id = 'gnPortal';
    portal.hidden = true;
    portal.innerHTML =
      '<div class="gn-portal__dialog" role="dialog" aria-modal="true" aria-label="Portal de Shiruvana: buscá en tu Guarida">' +
        '<div class="gn-portal__in">' +
          '<img class="gn-portal__avatar" src="' + AVATAR + '" alt="" width="34" height="34">' +
          '<input id="gnPortalInput" class="gn-portal__input" type="text" role="combobox" aria-expanded="true" aria-controls="gnPortalList" aria-autocomplete="list" autocomplete="off" spellcheck="false" placeholder="¿A dónde vamos?" aria-label="¿A dónde vamos?">' +
          '<kbd class="gn-kbd">Esc</kbd>' +
        '</div>' +
        '<p id="gnPortalSay" class="gn-portal__say" aria-live="polite"></p>' +
        '<div id="gnPortalList" class="gn-portal__list" role="listbox" aria-label="Resultados"></div>' +
        '<div class="gn-portal__ft"><span><kbd class="gn-kbd">↑</kbd> <kbd class="gn-kbd">↓</kbd> moverse</span><span><kbd class="gn-kbd">Enter</kbd> abrir</span><span><kbd class="gn-kbd">Esc</kbd> cerrar</span><span class="gn-portal__note">Busco solo en tu Guarida, sin salir a internet</span></div>' +
      '</div>';
    doc.body.appendChild(portal);
    input = portal.querySelector('#gnPortalInput');
    list = portal.querySelector('#gnPortalList');
    say = portal.querySelector('#gnPortalSay');

    input.addEventListener('input', pintarResultados);
    input.addEventListener('keydown', function (ev) {
      if (ev.key === 'ArrowDown') { ev.preventDefault(); mover(1); }
      else if (ev.key === 'ArrowUp') { ev.preventDefault(); mover(-1); }
      else if (ev.key === 'Enter') { ev.preventDefault(); elegir(sel); }
      else if (ev.key === 'Escape') { ev.preventDefault(); cerrar(); }
      else if (ev.key === 'Tab') { ev.preventDefault(); } // el foco se queda en el portal
    });
    list.addEventListener('click', function (ev) {
      var opt = ev.target.closest ? ev.target.closest('[data-i]') : null;
      if (opt) elegir(parseInt(opt.getAttribute('data-i'), 10));
    });
    list.addEventListener('mousemove', function (ev) {
      var opt = ev.target.closest ? ev.target.closest('[data-i]') : null;
      if (opt) marcar(parseInt(opt.getAttribute('data-i'), 10));
    });
    portal.addEventListener('mousedown', function (ev) { if (ev.target === portal) cerrar(); });
  }

  function pintarResultados() {
    var q = input.value;
    var idx = index();
    var groups;
    if (norm(q)) {
      groups = groupResults(search(idx, q, 8));
    } else {
      groups = [];
      var siempre = deSiempre(uso, idx, new Date());
      if (siempre.length) groups.push({ label: 'Lo de siempre a esta hora', items: siempre });
      groups.push({ label: 'Acciones', items: idx.filter(function (e) { return e.kind === 'action'; }) });
    }
    actuales = flat(groups);
    list.innerHTML = resultsHTML(groups);
    say.textContent = sayText(q, actuales.length);
    marcar(0);
  }

  function marcar(i) {
    if (!actuales.length) { input.removeAttribute('aria-activedescendant'); sel = 0; return; }
    sel = (i + actuales.length) % actuales.length;
    Array.prototype.forEach.call(list.querySelectorAll('[data-i]'), function (o) {
      var on = parseInt(o.getAttribute('data-i'), 10) === sel;
      o.setAttribute('aria-selected', on ? 'true' : 'false');
      if (on && o.scrollIntoView) o.scrollIntoView({ block: 'nearest' });
    });
    input.setAttribute('aria-activedescendant', 'gnOpt' + sel);
  }

  function mover(d) { marcar(sel + d); }

  function elegir(i) {
    var e = actuales[i];
    if (!e) return;
    cerrar(true);
    activar(e);
  }

  function abrir() {
    if (!portal) construirPortal();
    if (!portal.hidden) { input.focus(); return; }
    abiertoDesde = doc.activeElement;
    portal.hidden = false;
    doc.body.classList.add('gn-portal-open');
    input.value = '';
    pintarResultados();
    input.focus();
  }

  function cerrar(sinVolver) {
    if (!portal || portal.hidden) return;
    portal.hidden = true;
    doc.body.classList.remove('gn-portal-open');
    if (!sinVolver && abiertoDesde && abiertoDesde.focus) abiertoDesde.focus();
    abiertoDesde = null;
  }

  function escribiendo(t) {
    if (!t) return false;
    var tag = (t.tagName || '').toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select' || !!t.isContentEditable;
  }

  function modalAbierto() {
    var m = $('#modal');
    return !!(m && !m.hidden);
  }

  // ---- Lo de siempre ----
  var siempreActual = [];
  function pintarSiempre() {
    var box = $('#usualChips');
    var row = $('#usualRow');
    if (!box || !row) return;
    siempreActual = deSiempre(uso, index(), new Date());
    box.innerHTML = chipsHTML(siempreActual);
    row.hidden = !siempreActual.length;
  }

  // ---- Consejo ----
  var toast = null, tipActual = null;
  function ocultarConsejo() { if (toast) { toast.hidden = true; toast.innerHTML = ''; } tipActual = null; }

  function mostrarConsejo() {
    var now = Date.now();
    var t = pickTip(tips(state(), meta, now), meta, now, editing() || modalAbierto());
    if (!t) return;
    if (!toast) {
      toast = doc.createElement('div');
      toast.className = 'gn-toast';
      toast.setAttribute('role', 'status');
      toast.hidden = true;
      doc.body.appendChild(toast);
      toast.addEventListener('click', function (ev) {
        var b = ev.target.closest ? ev.target.closest('[data-tip]') : null;
        if (!b || !tipActual) return;
        var tip = tipActual;
        if (b.getAttribute('data-tip') === 'later') {
          meta.snooze = meta.snooze || {};
          meta.snooze[tip.id] = Date.now() + SILENCIO_DIAS * DIA;
          store(META_KEY, meta);
          ocultarConsejo();
          return;
        }
        ocultarConsejo();
        if (tip.action.kind === 'flash') flash(tip.action.targets);
        else { var el = $(tip.action.target); if (el) el.click(); }
      });
    }
    tipActual = t;
    toast.innerHTML = tipHTML(t);
    toast.hidden = false;
    meta.lastTipDay = dayKey(now);
    store(META_KEY, meta);
  }

  function init() {
    try { root.localStorage.removeItem(OLD_FACTORY_KEY); } catch (e) { /* nada */ }

    Array.prototype.forEach.call(doc.querySelectorAll('.gn-avatar-slot'), function (img) { img.src = AVATAR; });

    var trigger = $('#portalTrigger');
    if (trigger) trigger.addEventListener('click', function () { abrir(); });

    doc.addEventListener('keydown', function (ev) {
      if ((ev.ctrlKey || ev.metaKey) && !ev.altKey && (ev.key === 'k' || ev.key === 'K')) {
        if (modalAbierto()) return;
        ev.preventDefault();
        abrir();
      } else if (ev.key === '/' && !ev.ctrlKey && !ev.metaKey && !escribiendo(ev.target) && !modalAbierto()) {
        ev.preventDefault();
        abrir();
      } else if (ev.key === 'Escape' && toast && !toast.hidden && (!portal || portal.hidden)) {
        ocultarConsejo();
      }
    });

    // Anoto lo que abrís (no lo que editás).
    doc.addEventListener('click', function (ev) {
      var t = ev.target;
      if (!t || !t.closest) return;
      if (t.closest('.edit-actions')) return;
      var u = t.closest('[data-usual]');
      if (u) { activar(siempreActual[parseInt(u.getAttribute('data-usual'), 10)]); return; }
      if (t.closest('#exportBtn')) { meta.lastBackup = Date.now(); store(META_KEY, meta); return; }
      if (editing()) return;
      var el = t.closest('.fav-card, .category-link, .launcher-item');
      if (el) anotar(keyFromElement(el));
    }, true);

    var edit = $('#editModeBtn');
    if (edit) edit.addEventListener('click', function () { setTimeout(function () { if (editing()) ocultarConsejo(); }, 0); });

    // Si cambian favoritos, categorías o el lanzador, recalculo «Lo de siempre».
    if (root.MutationObserver) {
      var mo = new root.MutationObserver(function () { pintarSiempre(); });
      ['#favoritesGrid', '#categoriesGrid', '#launcherAppsGrid', '#launcherGamesGrid'].forEach(function (s) {
        var el = $(s);
        if (el) mo.observe(el, { childList: true });
      });
    }
    pintarSiempre();
    setTimeout(mostrarConsejo, 6000);
  }

  root.Shiruvana = { version: VERSION, abrir: abrir, cerrar: cerrar, api: api };

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
  else init();
})(typeof window !== 'undefined' ? window : this);
