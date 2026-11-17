/*!
 * js/escena.js — «GN Escena» en La Guarida (1.5.0, 2026-11-17, BL-091 ESC-6)
 *
 * 1.5.0 (ESC-6): cabecera que se esfuma y un globo que dice algo útil.
 *  - body.esc-bajo cuando bajás de la página: la cabecera, transparente arriba de todo,
 *    toma su fondo y lo esfuma hacia abajo (css/universo.css). Sin transform en la cabecera.
 *  - Sin consejo, el globo ya no repite «Ctrl K» (el buscador está a la vista): dice el
 *    saludo y cuándo fue tu último backup (el mismo texto de header.js).
 * 1.4.0 (ESC-5, restyle «universo Shiruvana»): mis poses sin fondo y la barra del día.
 *  - Mis poses de cuerpo entero tienen fondo negro. Ahora las recorto en el navegador
 *    (canvas): lo negro que toca el borde y los huecos negros grandes quedan
 *    transparentes, con el borde suavizado. Mientras no están listas no se ven (nunca un
 *    rectángulo negro). Quedan en body como --esc-p-<pose> (con la clase esc-p-<pose>)
 *    para css/universo.css y css/escena.css, y en el buscador como src de mi pose.
 *  - --esc-dia: cuánto va del día (0–100 %), para la barra ámbar del saludo, como la
 *    barra EVOLVING de mi sitio. Se actualiza cada minuto.
 *  - body.esc-listo a los 2 s: las tarjetas entran de a una solo al abrir, no cada vez
 *    que app.js vuelve a dibujar.
 * 1.3.0 (ESC-4): la bienvenida del día. La primera vez que abrís La Guarida cada día
 * (con el theme Gato Negro y sin «reducir movimiento»): pantalla negra, los ojos ámbar
 * del gato que se abren y el saludo de la hora. Dura unos 3 s y se pasa con un toque o
 * cualquier tecla. Guardo el día en guarida:escena:v1 ({ plegado, bienvenida }).
 * 1.2.0 (ESC-3): el gato reacciona y aparezco de cuerpo entero en momentos.
 *  - El gato festeja cuando guardás algo en el editor, cuando descargás un backup y
 *    con los avisos que salieron bien; camina inquieto con advertencias y errores.
 *    Escucho, no toco: el clic en «Guardar» (y que el editor se cierre), el clic en
 *    «Descargar backup» y los avisos que llegan a la región del kit (.gk-toasts).
 *  - En el buscador (Ctrl K) estoy de cuerpo entero al costado: saludo mientras está
 *    vacío y pienso cuando escribís. Reemplaza el retrato de header.js solo con Gato Negro.
 *  - Los estados vacíos (sin favoritos, sin categorías, lanzador vacío) los dibuja
 *    css/escena.css con mis poses de cuerpo entero.
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

  var VERSION = '1.5.0';
  var CHISPAS = 14;
  var KEY = 'guarida:escena:v1';
  var CARA = 'assets/brand/shiruvana/shiruvana-';
  var CUERPO = 'assets/brand/shiruvana/cuerpo-';
  var GATO = 'assets/brand/gato/gato-';
  var FRASES = ['Prrr… bip.', 'Miau. Compilando.', 'Ojo ámbar: sistema estable.', 'Bip bip. Todo en orden.'];
  var QUEJA = 'Basta, que estoy trabajando.';
  var POSES = ['sentada', 'saluda', 'pensando'];
  var UMBRAL = 14;     // «negro»: el canal más alto por debajo de esto
  var HUECO = 0.004;   // huecos negros encerrados más grandes que esta fracción también son fondo

  // Cómo reacciona el gato a lo que pasa en La Guarida (null: no reacciona).
  var REACCIONES = {
    guardado: { pose: 'festeja', frase: '¡Guardado!' },
    backup: { pose: 'festeja', frase: 'Backup a salvo.' },
    ok: { pose: 'festeja', frase: '¡Bip!' },
    warn: { pose: 'camina', frase: 'Ojo con eso.' },
    error: { pose: 'camina', frase: 'Algo falló, mirá el aviso.' }
  };

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

  // El saludo de la hora (mañana 05–12, tarde 12–19, noche 19–05).
  function saludo(date) {
    var h = date.getHours();
    return h >= 5 && h < 12 ? 'Buen día' : (h >= 12 && h < 19 ? 'Buenas tardes' : 'Buenas noches');
  }

  // Lo que digo cuando no hay consejo: el saludo de la hora y un dato útil (si lo hay).
  function lineaDelDia(date, dato) { return saludo(date) + ', Pablo.' + (dato ? ' ' + dato : ''); }

  // ¿Ya bajaste de la página? (la cabecera toma su fondo)
  function bajo(y) { return (+y || 0) > 4; }

  // El día local, para la bienvenida (una por día).
  function diaKey(date) { return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate(); }

  // ¿Toca la bienvenida? Solo con Gato Negro, sin «reducir movimiento» y si hoy no la viste.
  function tocaBienvenida(guardado, hoy, theme, reducido) {
    if (theme !== 'gato' || reducido) return false;
    return !(guardado && guardado.bienvenida === hoy);
  }

  function bienvenidaHTML(date) {
    return '<div class="esc-ojos"><i></i><i></i></div>' +
      '<p class="esc-bv-saludo">' + saludo(date) + ', Pablo</p>' +
      '<p class="esc-bv-pasar">La Guarida está lista. Tocá para pasar.</p>';
  }

  // El gato: cuatro frases que rotan; el quinto toque, la queja.
  function fraseGato(toques) {
    var n = toques | 0;
    if (n < 1) return '';
    if (n === 5) return QUEJA;
    return FRASES[(n > 5 ? n - 2 : n - 1) % FRASES.length];
  }

  function reaccion(evento) { return Object.prototype.hasOwnProperty.call(REACCIONES, evento) ? REACCIONES[evento] : null; }

  // Tipo de un aviso del kit por su clase (gk-toast--ok, --warn, --error, --info).
  function tipoAviso(className) {
    var m = /(?:^|\s)gk-toast--(\w+)/.exec(String(className || ''));
    return m ? m[1] : '';
  }

  // Mi pose en el buscador: saludo con el buscador vacío, pienso cuando escribís.
  function posePortal(query) { return String(query == null ? '' : query).trim() ? 'pensando' : 'saluda'; }

  // ---- ESC-5: recorte del fondo negro (puro: trabaja sobre los píxeles RGBA) ----
  // Lo negro conectado al borde es fondo; los huecos negros encerrados grandes (entre el
  // brazo y el cuerpo) también; los chicos (pupilas, contornos) no. Después el borde se
  // achica un píxel y se suaviza. Escribe el alfa en data y devuelve cuántos píxeles son fondo.
  function recorte(data, w, h, umbral, hueco) {
    var T = umbral == null ? UMBRAL : umbral, H = hueco == null ? HUECO : hueco;
    var n = w * h, est = new Uint8Array(n), pila = new Int32Array(n), top = 0, i, p;
    for (i = 0; i < n; i++) { p = i * 4; if (Math.max(data[p], data[p + 1], data[p + 2]) < T) est[i] = 1; }
    function meter(j, marca) { if (est[j] === 1) { est[j] = marca; pila[top++] = j; } }
    function expandir(marca, junta) {
      var c = 0;
      while (top > 0) {
        var j = pila[--top], x = j % w; c++;
        if (junta) junta.push(j);
        if (x > 0) meter(j - 1, marca);
        if (x < w - 1) meter(j + 1, marca);
        if (j >= w) meter(j - w, marca);
        if (j < n - w) meter(j + w, marca);
      }
      return c;
    }
    // 1) el fondo que toca el borde (2)
    for (i = 0; i < w; i++) { meter(i, 2); meter(n - w + i, 2); }
    for (i = 0; i < h; i++) { meter(i * w, 2); meter(i * w + w - 1, 2); }
    expandir(2);
    // 2) huecos encerrados: grandes → fondo (2); chicos → parte de la figura (3)
    var lim = H * n;
    for (i = 0; i < n; i++) {
      if (est[i] !== 1) continue;
      var junta = [];
      meter(i, 3);
      if (expandir(3, junta) > lim) for (var k = 0; k < junta.length; k++) est[junta[k]] = 2;
    }
    // 3) alfa: figura 255, fondo 0; achico un píxel y suavizo dos veces
    var a = new Uint8Array(n), fondo = 0;
    for (i = 0; i < n; i++) { if (est[i] === 2) fondo++; else a[i] = 255; }
    a = vecinos(a, w, h, true);
    a = vecinos(vecinos(a, w, h, false), w, h, false);
    for (i = 0; i < n; i++) { p = i * 4 + 3; if (a[i] < data[p]) data[p] = a[i]; }
    return fondo;
  }

  // 3×3 alrededor de cada píxel: el mínimo (achica) o el promedio (suaviza).
  function vecinos(a, w, h, minimo) {
    var out = new Uint8Array(a.length);
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var m = 255, s = 0, c = 0;
        for (var dy = -1; dy <= 1; dy++) {
          var yy = y + dy; if (yy < 0 || yy >= h) continue;
          for (var dx = -1; dx <= 1; dx++) {
            var xx = x + dx; if (xx < 0 || xx >= w) continue;
            var v = a[yy * w + xx]; if (v < m) m = v; s += v; c++;
          }
        }
        out[y * w + x] = minimo ? m : Math.round(s / c);
      }
    }
    return out;
  }

  // Cuánto va del día, en %, con un decimal (para la barra del saludo).
  function avanceDia(date) { return Math.round((date.getHours() * 60 + date.getMinutes()) / 1440 * 1000) / 10; }

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
    VERSION: VERSION, CHISPAS: CHISPAS, KEY: KEY, FRASES: FRASES, QUEJA: QUEJA, REACCIONES: REACCIONES, CUERPO: CUERPO,
    chispasHTML: chispasHTML, dondeConsejo: dondeConsejo, plegadoInicial: plegadoInicial,
    lineaDelDia: lineaDelDia, fraseGato: fraseGato, globoHTML: globoHTML,
    saludo: saludo, diaKey: diaKey, tocaBienvenida: tocaBienvenida, bienvenidaHTML: bienvenidaHTML, BIENVENIDA_MS: 3200,
    reaccion: reaccion, tipoAviso: tipoAviso, posePortal: posePortal,
    POSES: POSES, UMBRAL: UMBRAL, HUECO: HUECO, recorte: recorte, avanceDia: avanceDia, bajo: bajo, META_KEY: 'guarida:shiruvana:v1'
  };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  if (!root || !root.document) return;

  var doc = root.document;
  function $(s) { return doc.querySelector(s); }
  function leer(k) { try { return JSON.parse(root.localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
  function load() { return leer(KEY); }
  function store(v) { try { root.localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* sin lugar: no es grave */ } }
  // Suma un dato a lo guardado sin pisar lo demás.
  function anotar(parche) {
    var g = load();
    if (!g || typeof g !== 'object') g = {};
    for (var k in parche) if (Object.prototype.hasOwnProperty.call(parche, k)) g[k] = parche[k];
    store(g);
  }

  var globo = null, toques = 0, tGato = null;

  // ---- ESC-5: mis poses sin fondo (una vez por imagen; null si no se puede) ----
  var recortes = {};
  function sinFondo(url) {
    if (recortes[url]) return recortes[url];
    recortes[url] = new Promise(function (listo) {
      var Img = root.Image, URLs = root.URL, cv = doc.createElement('canvas');
      if (!Img || !URLs || !URLs.createObjectURL || !cv || !cv.getContext || !cv.toBlob) { listo(null); return; }
      var im = new Img();
      im.onload = function () {
        try {
          var w = im.naturalWidth || im.width, h = im.naturalHeight || im.height;
          cv.width = w; cv.height = h;
          var cx = cv.getContext('2d');
          cx.drawImage(im, 0, 0);
          var d = cx.getImageData(0, 0, w, h);
          recorte(d.data, w, h);
          cx.putImageData(d, 0, 0);
          cv.toBlob(function (b) { listo(b ? URLs.createObjectURL(b) : null); }, 'image/png');
        } catch (e) { listo(null); }
      };
      im.onerror = function () { listo(null); };
      im.src = url;
    });
    return recortes[url];
  }

  function posesSinFondo() {
    var st = doc.body.style;
    if (doc.body.getAttribute('data-theme') !== 'gato' || !st || !st.setProperty) return;
    POSES.forEach(function (p) {
      sinFondo(CUERPO + p + '.webp').then(function (u) {
        if (!u) return;
        st.setProperty('--esc-p-' + p, 'url("' + u + '")');
        doc.body.classList.add('esc-p-' + p);
      });
    });
  }

  // ESC-6: el dato del globo (el último backup, con el texto de header.js)
  function datoDelDia() {
    var H = root.GuaridaHeader && root.GuaridaHeader.api;
    if (!H || !H.backupText) return '';
    return H.backupText(leer(api.META_KEY) || {}, Date.now()) + '.';
  }

  function marcarScroll() { doc.body.classList.toggle('esc-bajo', bajo(root.scrollY != null ? root.scrollY : root.pageYOffset)); }

  function marcarDia() {
    if (doc.body.style && doc.body.style.setProperty) doc.body.style.setProperty('--esc-dia', avanceDia(new Date()) + '%');
  }

  function plegar(si, guardar) {
    if (!globo) return;
    globo.classList.toggle('is-plegado', si);
    var b = globo.querySelector('.esc-plegar');
    b.setAttribute('aria-expanded', si ? 'false' : 'true');
    b.setAttribute('aria-label', si ? 'Abrir mi globo' : 'Plegar mi globo');
    b.title = si ? 'Abrir' : 'Plegar';
    b.textContent = si ? '⇱' : '⇲';
    if (guardar) anotar({ plegado: si });
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
    if (!globo) return;
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

  function reaccionar(evento) {
    var r = reaccion(evento);
    if (r) gato(r.pose, r.frase);
  }

  function crearGlobo() {
    globo = doc.createElement('aside');
    globo.className = 'esc-globo';
    globo.setAttribute('aria-label', 'Shiruvana');
    globo.innerHTML = globoHTML(lineaDelDia(new Date(), datoDelDia()));
    // Sin la imagen del gato, el globo queda sin gato (no con un ícono roto).
    globo.querySelector('.esc-gato img').onerror = function () { var b = globo.querySelector('.esc-gato'); if (b) b.hidden = true; };
    globo.querySelector('.esc-plegar').addEventListener('click', function () { plegar(!globo.classList.contains('is-plegado'), true); });
    globo.querySelector('.esc-gato').addEventListener('click', function () { toques++; gato('festeja', fraseGato(toques)); });
    doc.body.appendChild(globo);
    plegar(plegadoInicial(load(), false), false);
  }

  // ---- ESC-3: el gato escucha ----
  function escucharAvisos(region) {
    if (!region || !region.classList || !region.classList.contains('gk-toasts') || region.getAttribute('data-esc')) return;
    region.setAttribute('data-esc', '1');
    new root.MutationObserver(function (list) {
      list.forEach(function (m) {
        Array.prototype.forEach.call(m.addedNodes || [], function (n) { if (n.className) reaccionar(tipoAviso(n.className)); });
      });
    }).observe(region, { childList: true });
  }

  // ---- ESC-3: yo en el buscador ----
  function prepararPortal(portal) {
    if (!portal || !portal.classList || !portal.classList.contains('gn-portal') || portal.querySelector('.esc-portal-pose')) return;
    var dialog = portal.querySelector('.gn-portal__dialog');
    if (!dialog) return;
    var fig = doc.createElement('img');
    fig.className = 'esc-portal-pose';
    fig.alt = '';
    fig.setAttribute('aria-hidden', 'true');
    fig.width = 201; fig.height = 300;
    fig.hidden = true; // aparece cuando la pose ya no tiene fondo
    fig.onerror = function () { fig.hidden = true; }; // sin imagen, el buscador queda como antes
    portal.insertBefore(fig, dialog);
    var input = portal.querySelector('#gnPortalInput');
    function pose() {
      var p = posePortal(input ? input.value : '');
      if (fig.getAttribute('data-pose') === p) return;
      fig.setAttribute('data-pose', p);
      sinFondo(CUERPO + p + '.webp').then(function (u) {
        if (fig.getAttribute('data-pose') !== p) return; // ya cambió de pose
        if (u) { fig.src = u; fig.hidden = false; } else fig.hidden = true;
      });
    }
    if (input) input.addEventListener('input', pose);
    new root.MutationObserver(function () { if (!portal.hidden) pose(); }).observe(portal, { attributes: true, attributeFilter: ['hidden'] });
    pose();
  }

  function alAgregar(n) { escucharAvisos(n); prepararPortal(n); }

  // ---- ESC-4: la bienvenida del día ----
  function bienvenida() {
    var ahora = new Date();
    var hoy = diaKey(ahora);
    var reducido = !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches);
    if (!tocaBienvenida(load(), hoy, doc.body.getAttribute('data-theme'), reducido)) return;
    anotar({ bienvenida: hoy });
    var capa = doc.createElement('div');
    capa.className = 'esc-bienvenida';
    capa.setAttribute('aria-hidden', 'true'); // el saludo ya está en el h1 de la página
    capa.innerHTML = bienvenidaHTML(ahora);
    var t = null;
    function cerrar() {
      clearTimeout(t);
      doc.removeEventListener('keydown', cerrar, true);
      if (capa.parentNode) capa.parentNode.removeChild(capa);
    }
    capa.addEventListener('click', cerrar);
    doc.addEventListener('keydown', cerrar, true);
    doc.body.appendChild(capa);
    t = setTimeout(cerrar, api.BIENVENIDA_MS);
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
    bienvenida();
    // ESC-5: el recorte corre detrás de la bienvenida; las tarjetas entran solo al abrir
    setTimeout(posesSinFondo, 200);
    setTimeout(function () { doc.body.classList.add('esc-listo'); }, 2000);
    marcarDia();
    if (root.setInterval) root.setInterval(marcarDia, 60000);
    // ESC-6: la cabecera se esfuma recién cuando bajás
    marcarScroll();
    if (root.addEventListener) root.addEventListener('scroll', marcarScroll, { passive: true });

    // Guardar en el editor: si después del clic el editor se cerró, se guardó.
    doc.addEventListener('click', function (ev) {
      var t = ev.target;
      if (!t || !t.closest) return;
      if (t.closest('#exportBtn')) { reaccionar('backup'); return; }
      if (!t.closest('#modalSave')) return;
      setTimeout(function () { var m = $('#modal'); if (m && m.hidden) reaccionar('guardado'); }, 0);
    }, true);

    if (!root.MutationObserver) return;
    // Cambio de theme: app.js escribe data-theme en <body>.
    new root.MutationObserver(function () { ubicar(); posesSinFondo(); }).observe(doc.body, { attributes: true, attributeFilter: ['data-theme'] });
    // El consejo aparece a los 6 s (shiruvana.js) y header.js lo deja en #ghTip.
    var tip = $('#ghTip');
    if (tip) new root.MutationObserver(ubicar).observe(tip, { childList: true });
    // «Ahora no», la acción o Esc lo ocultan estando ya en el globo.
    new root.MutationObserver(ubicar).observe(globo.querySelector('.esc-slot'), { attributes: true, attributeFilter: ['hidden'], subtree: true });
    // La región de avisos del kit y el buscador se crean la primera vez que hacen falta.
    Array.prototype.forEach.call(doc.querySelectorAll('.gk-toasts, .gn-portal'), alAgregar);
    new root.MutationObserver(function (list) {
      list.forEach(function (m) { Array.prototype.forEach.call(m.addedNodes || [], alAgregar); });
    }).observe(doc.body, { childList: true });
  }

  root.GuaridaEscena = { version: VERSION, api: api };

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
  else init();
})(typeof window !== 'undefined' ? window : this);
