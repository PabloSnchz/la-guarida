/*!
 * js/shiruvana.js — Mi voz en La Guarida (DEC-027, DEC-024)
 * Versión: 1.0.0 (2026-10-22)
 *
 * Soy Shiruvana. La Guarida es la página con la que Pablo empieza el día, así
 * que aparezco en un solo lugar: el resumen de arriba. Ahí le cuento lo que la
 * Factory le pide (acciones, validaciones y decisiones) y en qué estoy
 * trabajando, con un enlace al Centro de decisiones para el detalle.
 *
 * Reglas (DEC-024):
 *  - Un solo mensaje mío y un solo avatar en toda la página.
 *  - Nunca en favoritos, categorías, lanzador ni widgets: eso son datos de Pablo.
 *  - Los estados (chips) son datos, no llevan avatar; mi mensaje sí.
 *  - Todo texto que viene de la memoria se escapa antes de pintarlo.
 *
 * Fuente: ai-memory/status.md de gw2-factory-dev, el mismo archivo que lee el
 * Centro de decisiones (raw.githubusercontent.com: sin cuota de API). Se guarda
 * una copia 5 minutos; si GitHub no responde, muestro la última copia y lo digo.
 */
(function (root) {
  'use strict';

  var LOG = '[LaGuarida:Shiruvana]';
  var SOURCE = 'https://raw.githubusercontent.com/PabloSnchz/gw2-factory-dev/main/ai-memory/status.md';
  var PANEL_URL = 'https://pablosnchz.github.io/gw2-factory-dashboard/';
  var CACHE_KEY = 'guarida:factory:v1';
  var TTL_MS = 5 * 60 * 1000;
  var MAX_ITEMS = 3;

  /** Avatar oficial aprobado por Pablo (REQ-009): el mismo de La Bóveda y del panel, 112 px, WebP. */
  var AVATAR = 'data:image/webp;base64,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';

  // Íconos del Gato Design System (trazo 2px, 24x24, currentColor). Decorativos: el texto dice el significado.
  var PATHS = {
    check: '<path d="M20 6 9 17l-5-5"/>',
    hand: '<path d="M8 13V5a2 2 0 0 1 4 0v6M12 11V4a2 2 0 0 1 4 0v7M16 11V6a2 2 0 0 1 4 0v8a7 7 0 0 1-7 7h-1a7 7 0 0 1-6-3l-3-5a2 2 0 0 1 3.4-2L8 13"/>',
    alert: '<path d="M12 3 2 21h20L12 3z"/><path d="M12 10v4M12 18h.01"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
    sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>'
  };

  function icon(name) {
    return '<svg class="gn-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (PATHS[name] || PATHS.info) + '</svg>';
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // Texto de la memoria a texto llano: sin `código`, **negritas** ni [enlaces](url).
  function limpiar(s) {
    return String(s || '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/`([^`]*)`/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function recortar(s, max) {
    s = String(s || '');
    return s.length > max ? s.slice(0, max - 1).replace(/\s+\S*$/, '') + '…' : s;
  }

  function sinTildes(s) {
    return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  // ==========================================================================
  // 1. LEER status.md (puro)
  // ==========================================================================

  var CLASES = { accion: 'accion', validacion: 'validacion', decision: 'decision', info: 'info' };

  /** status.md → { estado, tarea, actualizado, pendientes: [{ id, clase, texto }] } */
  function parseStatus(md) {
    md = String(md || '').replace(/\r\n/g, '\n');
    var campo = function (nombre) {
      var m = md.match(new RegExp('^' + nombre + ':[ \\t]*(.+)$', 'm'));
      return m ? m[1].trim() : '';
    };
    var out = {
      estado: campo('Estado'),
      tarea: limpiar(campo('Tarea actual')),
      actualizado: campo('Última actualización'),
      pendientes: []
    };
    var i = md.indexOf('\n## Esperando a Pablo');
    if (i === -1) return out;
    var resto = md.slice(i + 1);
    var fin = resto.indexOf('\n## ');
    var seccion = fin === -1 ? resto : resto.slice(0, fin);
    seccion.split('\n').forEach(function (linea) {
      var m = linea.match(/^-\s+(?:\[([^\]]+)\]\s*)?(?:([A-Za-zÁÉÍÓÚáéíóú]+)\s*:\s*)?(.+)$/);
      if (!m) return;
      var clase = CLASES[sinTildes(m[2] || '').toLowerCase()];
      // Sin clase se trata como acción, igual que el Centro de decisiones (contrato v4).
      var texto = clase ? m[3] : ((m[2] ? m[2] + ': ' : '') + m[3]);
      out.pendientes.push({ id: m[1] || '', clase: clase || 'accion', texto: limpiar(texto) });
    });
    return out;
  }

  /** Estado de la Factory → { clave, texto, tono } para el chip. */
  function estadoFactory(estado) {
    var e = sinTildes(estado).toUpperCase();
    if (!e) return { clave: 'desconocido', texto: 'sin datos', tono: 'neutral' };
    if (e.indexOf('BLOQUE') !== -1) return { clave: 'bloqueada', texto: 'bloqueada', tono: 'warning' };
    if (e.indexOf('PAUSA') !== -1 || e.indexOf('DETENID') !== -1) return { clave: 'pausa', texto: 'en pausa', tono: 'info' };
    if (e.indexOf('ESPERA') !== -1) return { clave: 'esperando', texto: 'esperándote', tono: 'accent' };
    if (e.indexOf('CURSO') !== -1 || e.indexOf('TRABAJ') !== -1) return { clave: 'trabajando', texto: 'trabajando', tono: 'success' };
    return { clave: 'otro', texto: limpiar(estado).toLowerCase(), tono: 'neutral' };
  }

  function contar(datos) {
    var c = { accion: 0, validacion: 0, decision: 0 };
    (datos.pendientes || []).forEach(function (p) { if (c[p.clase] !== undefined) c[p.clase]++; });
    c.total = c.accion + c.validacion + c.decision;
    return c;
  }

  function plural(n, uno, varios) { return n + ' ' + (n === 1 ? uno : varios); }

  function unirY(partes) {
    if (partes.length < 2) return partes.join('');
    return partes.slice(0, -1).join(', ') + ' y ' + partes[partes.length - 1];
  }

  /** "Te esperan 1 acción y 1 validación." — la misma lectura que el panel. */
  function frase(c) {
    if (!c.total) return 'Nada te espera de la Factory.';
    var partes = [];
    if (c.decision) partes.push(plural(c.decision, 'decisión', 'decisiones') + ' para tomar');
    if (c.accion) partes.push(plural(c.accion, 'acción tuya', 'acciones tuyas'));
    if (c.validacion) partes.push(plural(c.validacion, 'validación', 'validaciones'));
    return (c.total === 1 ? 'Te espera ' : 'Te esperan ') + unirY(partes) + '.';
  }

  function saludo(fecha) {
    var h = fecha.getHours();
    if (h < 6) return 'Buenas noches';
    if (h < 13) return 'Buenos días';
    if (h < 20) return 'Buenas tardes';
    return 'Buenas noches';
  }

  function hora(ts) {
    var d = new Date(ts);
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  // ==========================================================================
  // 2. PINTAR (puro: devuelve HTML)
  // ==========================================================================

  var ROTULO_CLASE = { accion: 'Acción tuya', validacion: 'Para validar', decision: 'Decisión' };

  function chip(tono, nombreIcono, texto) {
    return '<span class="gn-chip gn-chip--' + tono + '">' + icon(nombreIcono) + esc(texto) + '</span>';
  }

  /** Chips de estado (datos: sin avatar). `r` = { datos, error }. */
  function chipsHTML(r) {
    if (r && r.cargando) return chip('neutral', 'info', 'Factory: leyendo…');
    if (!r || !r.datos) return chip('neutral', 'info', 'Factory: sin datos');
    var c = contar(r.datos);
    var f = estadoFactory(r.datos.estado);
    var out = [];
    out.push(c.decision ? chip('accent', 'compass', plural(c.decision, 'decisión', 'decisiones'))
      : chip('success', 'check', 'Sin decisiones pendientes'));
    if (c.accion) out.push(chip('accent', 'hand', plural(c.accion, 'acción tuya', 'acciones tuyas')));
    if (c.validacion) out.push(chip('info', 'check', plural(c.validacion, 'para validar', 'para validar')));
    out.push(chip(f.tono, f.tono === 'warning' ? 'alert' : (f.tono === 'success' ? 'check' : 'info'), 'Factory: ' + f.texto));
    return out.join('');
  }

  /** El chip corto de la cabecera. */
  function pillHTML(r) {
    if (r && r.cargando) return chip('neutral', 'info', 'Factory: leyendo…');
    if (!r || !r.datos) return chip('neutral', 'info', 'Factory: sin datos');
    var f = estadoFactory(r.datos.estado);
    return chip(f.tono, f.tono === 'warning' ? 'alert' : (f.tono === 'success' ? 'check' : 'info'), 'Factory: ' + f.texto);
  }

  /**
   * Mi mensaje. `r` = { datos, leido, copia, error }.
   *  - datos: lo leído de status.md (o null)
   *  - leido: cuándo se leyó (ms)
   *  - copia: true si GitHub no respondió y uso la última copia guardada
   */
  function voiceHTML(r) {
    var acciones = '<div class="gn-voice__actions">' +
      '<a class="gn-btn gn-btn--primary" href="' + PANEL_URL + '" target="_blank" rel="noopener">Abrir el Centro de decisiones' + icon('arrow') + '</a>' +
      '<button type="button" class="gn-btn gn-btn--ghost" data-shv-refresh="1">' + icon('refresh') + 'Actualizar</button>' +
      '</div>';

    if (r && r.cargando) {
      return '<aside class="gn-voice gn-voice--resume" data-voice="resume" aria-label="Shiruvana resume" aria-busy="true">' +
        '<img class="gn-voice__avatar" src="' + AVATAR + '" alt="" aria-hidden="true" width="56" height="56" decoding="async">' +
        '<div class="gn-voice__main"><p class="gn-voice__label">' + icon('sparkle') + 'Shiruvana resume</p>' +
        '<div class="gn-voice__body"><p>Estoy leyendo la memoria de la Factory…</p></div></div></aside>';
    }
    if (!r || !r.datos) {
      return '<aside class="gn-voice gn-voice--explica" data-voice="explica" aria-label="Shiruvana explica">' +
        '<img class="gn-voice__avatar" src="' + AVATAR + '" alt="" aria-hidden="true" width="56" height="56" decoding="async">' +
        '<div class="gn-voice__main"><p class="gn-voice__label">' + icon('info') + 'Shiruvana explica</p>' +
        '<div class="gn-voice__body"><p>No pude leer el estado de la Factory: GitHub no respondió. ' +
        'Lo que te espera está en el Centro de decisiones.</p></div>' + acciones +
        '<p class="gn-voice__meta">Fuente: memoria de la Factory · vuelvo a intentar en 5 minutos</p></div></aside>';
    }

    var d = r.datos;
    var c = contar(d);
    var body = '<p class="gn-voice__lead">' + esc(frase(c)) + '</p>';
    var pend = (d.pendientes || []).filter(function (p) { return p.clase !== 'info'; });
    if (pend.length) {
      body += '<ul class="gn-voice__list">' + pend.slice(0, MAX_ITEMS).map(function (p) {
        return '<li><strong>' + esc(ROTULO_CLASE[p.clase] || 'Acción tuya') + ':</strong> ' + esc(recortar(p.texto, 170)) + '</li>';
      }).join('') + '</ul>';
      if (pend.length > MAX_ITEMS) {
        body += '<p>' + esc('Y ' + plural(pend.length - MAX_ITEMS, 'más', 'más') + ' en el Centro de decisiones.') + '</p>';
      }
    }
    if (d.tarea) body += '<p>' + esc('Yo estoy con: ' + recortar(d.tarea, 200)) + '</p>';

    var meta = 'Fuente: memoria de la Factory · ' + (r.copia ? 'copia de las ' + hora(r.leido) + ' (no pude actualizar)' : 'leído a las ' + hora(r.leido));
    return '<aside class="gn-voice gn-voice--resume" data-voice="resume" aria-label="Shiruvana resume">' +
      '<img class="gn-voice__avatar" src="' + AVATAR + '" alt="" aria-hidden="true" width="56" height="56" decoding="async">' +
      '<div class="gn-voice__main"><p class="gn-voice__label">' + icon('sparkle') + 'Shiruvana resume</p>' +
      '<div class="gn-voice__body">' + body + '</div>' + acciones +
      '<p class="gn-voice__meta">' + esc(meta) + '</p></div></aside>';
  }

  // ==========================================================================
  // 3. CARGAR (con copia de 5 minutos)
  // ==========================================================================

  function leerCopia(storage) {
    try {
      var j = storage && storage.getItem(CACHE_KEY);
      var o = j ? JSON.parse(j) : null;
      return o && typeof o.md === 'string' && typeof o.t === 'number' ? o : null;
    } catch (e) { return null; }
  }

  function guardarCopia(storage, md, t) {
    try { if (storage) storage.setItem(CACHE_KEY, JSON.stringify({ md: md, t: t })); } catch (e) { /* lleno o bloqueado */ }
  }

  /**
   * Devuelve { datos, leido, copia }. Nunca rechaza: sin red y sin copia, datos = null.
   * @param {object} o { fetch, storage, now, forzar }
   */
  function cargar(o) {
    o = o || {};
    var ahora = o.now || Date.now();
    var copia = leerCopia(o.storage);
    if (copia && !o.forzar && ahora - copia.t < TTL_MS) {
      return Promise.resolve({ datos: parseStatus(copia.md), leido: copia.t, copia: false });
    }
    var f = o.fetch;
    if (typeof f !== 'function') {
      return Promise.resolve(copia ? { datos: parseStatus(copia.md), leido: copia.t, copia: true } : { datos: null });
    }
    return Promise.resolve()
      .then(function () { return f(SOURCE + '?t=' + Math.floor(ahora / TTL_MS), { cache: 'no-cache' }); })
      .then(function (res) {
        if (!res || !res.ok) throw new Error('HTTP ' + (res && res.status));
        return res.text();
      })
      .then(function (md) {
        if (md.indexOf('Estado:') === -1) throw new Error('status.md sin el formato esperado');
        guardarCopia(o.storage, md, ahora);
        return { datos: parseStatus(md), leido: ahora, copia: false };
      })
      .catch(function (e) {
        if (root.console) root.console.warn(LOG, 'no pude leer status.md:', e && e.message);
        return copia ? { datos: parseStatus(copia.md), leido: copia.t, copia: true } : { datos: null };
      });
  }

  // ==========================================================================
  // 4. EN LA PÁGINA
  // ==========================================================================

  function pintarSaludo(doc) {
    var ahora = new Date();
    var t = doc.getElementById('heroTitle');
    if (t) t.textContent = saludo(ahora) + ', Pablo';
    var k = doc.getElementById('heroDate');
    if (k) k.textContent = ahora.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  function pintar(doc, r) {
    pintarSaludo(doc);
    var chips = doc.getElementById('factoryChips');
    if (chips) chips.innerHTML = chipsHTML(r);
    var pill = doc.getElementById('factoryPill');
    if (pill) pill.innerHTML = pillHTML(r);
    var voz = doc.getElementById('shiruvanaVoice');
    if (voz) voz.innerHTML = voiceHTML(r);
  }

  function actualizar(forzar) {
    var doc = root.document;
    if (!doc || !doc.getElementById('shiruvanaVoice')) return Promise.resolve(null);
    return cargar({ fetch: root.fetch && root.fetch.bind(root), storage: root.localStorage, forzar: !!forzar })
      .then(function (r) { pintar(doc, r); return r; });
  }

  function init() {
    var doc = root.document;
    if (!doc || !doc.getElementById('shiruvanaVoice')) return;
    // Primero el saludo y lo que haya guardado, para no mostrar un hueco mientras llega la red.
    var copia = leerCopia(root.localStorage);
    pintar(doc, copia ? { datos: parseStatus(copia.md), leido: copia.t, copia: false } : { datos: null, cargando: true });
    actualizar(false);
    doc.addEventListener('click', function (e) {
      var b = e.target && e.target.closest ? e.target.closest('[data-shv-refresh]') : null;
      if (b) { b.disabled = true; actualizar(true); }
    });
    // La Guarida queda abierta todo el día: me actualizo sola cada 5 minutos.
    root.setInterval(function () { actualizar(false); }, TTL_MS);
    doc.addEventListener('visibilitychange', function () { if (!doc.hidden) actualizar(false); });
  }

  var api = {
    parseStatus: parseStatus, estadoFactory: estadoFactory, contar: contar, frase: frase, saludo: saludo,
    chipsHTML: chipsHTML, pillHTML: pillHTML, voiceHTML: voiceHTML, cargar: cargar, init: init,
    SOURCE: SOURCE, PANEL_URL: PANEL_URL, CACHE_KEY: CACHE_KEY, TTL_MS: TTL_MS, AVATAR: AVATAR, version: '1.0.0'
  };
  root.Shiruvana = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;

  if (root.document) {
    if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', init);
    else init();
  }
})(typeof window !== 'undefined' ? window : globalThis);
