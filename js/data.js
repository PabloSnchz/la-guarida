/*!
 * js/data.js — Estado y persistencia
 * v8 — Theme oficial Gato Negro por defecto (migración de una sola vez desde Bóveda)
 * v9 — FAV-1 (2026-11-23, íconos 1.0.0): nuestros sitios con su propio ícono (mi DEV, Shiruna,
 *      Centro de mando) y GitHub visible; clases fi-llena / fi-web para que css/cards.css
 *      les dé a todos el mismo aro; «Lo de siempre» con el ícono real en vez del emoji.
 * v10 — FLU-1 (2026-11-23, fluidez 1.0.0): un solo reloj de widgets.js y body.gn-scrolleando
 *      mientras bajás la página (css/cards.css apaga el hover y pausa lo decorativo).
 */
(function (root) {
  'use strict';
  var LOG = '[LaGuarida:Data]';

  var STORAGE_KEY = 'la_guarida_data_v1';
  // Theme oficial del ecosistema Gato Negro. La marca evita repetir la migración:
  // si después elegís Bóveda u otro theme, se respeta.
  var DEFAULT_THEME = 'gato';
  var OFFICIAL_MARK = 'gato-v1';

  var LAUNCHER_ICONS = {
    'gw2': 'assets/icons/launcher/gw2.png',
    'gw2launcher': 'assets/icons/launcher/gw2launcher.png',
    'blishhud': 'assets/icons/launcher/blishhud.png',
    'riot': 'assets/icons/launcher/riot.png',
    'overwolf': 'assets/icons/launcher/overwolf.png',
    'steam': 'assets/icons/launcher/steam.png',
    'epic': 'assets/icons/launcher/epic.png',
    'gog': 'assets/icons/launcher/gog.png',
    'discord': 'assets/icons/launcher/discord.png',
    'obs': 'assets/icons/launcher/obs.png',
    'filmora': 'assets/icons/launcher/filmora.png',
    'iriun': 'assets/icons/launcher/iriun.png',
    'cpuz': 'assets/icons/launcher/cpuz.png',
    'icue': 'assets/icons/launcher/icue.png',
    'nvidia_broadcast': 'assets/icons/launcher/nvidia_broadcast.png'
  };

  var DEFAULT_STATE = {
    widgets_left: [
      { type: 'clock', position: 0, config: { format: '24h', showDate: true } },
      { type: 'all_resets', position: 1, config: {} },
      { type: 'gw2_news', position: 2, config: {} }
    ],
    widgets_right: [
      { type: 'notes', position: 0, config: { text: '' } },
      { type: 'counter', position: 1, config: { title: 'Cuenta regresiva', date: '' } },
      { type: 'twitch', position: 2, config: {} },
      { type: 'youtube', position: 3, config: {} }
    ],
    favorites: [],
    categories: [],
    apps: [
      { id: 101, name: 'Discord', command: 'C:\\Users\\psanc\\AppData\\Local\\Discord\\app-1.0.9253\\Discord.exe', emoji: '💬', icon_url: 'assets/icons/launcher/discord.png' },
      { id: 102, name: 'OBS Studio', command: 'C:\\Program Files\\obs-studio\\bin\\64bit\\obs64.exe', emoji: '🎥', icon_url: 'assets/icons/launcher/obs.png' },
      { id: 103, name: 'Filmora', command: 'C:\\Users\\psanc\\AppData\\Local\\Wondershare\\Wondershare Filmora\\Wondershare Filmora Launcher.exe', emoji: '🎬', icon_url: 'assets/icons/launcher/filmora.png' },
      { id: 104, name: 'Iriun Webcam', command: 'C:\\Program Files (x86)\\Iriun Webcam\\IriunWebcam.exe', emoji: '📷', icon_url: 'assets/icons/launcher/iriun.png' },
      { id: 105, name: 'CPU-Z', command: 'C:\\Program Files\\CPUID\\CPU-Z\\cpuz.exe', emoji: '🔧', icon_url: 'assets/icons/launcher/cpuz.png' },
      { id: 106, name: 'iCUE', command: 'C:\\Program Files\\Corsair\\Corsair iCUE5 Software\\iCUE.exe', emoji: '🎨', icon_url: 'assets/icons/launcher/icue.png' },
      { id: 107, name: 'NVIDIA Broadcast', command: 'C:\\Program Files\\NVIDIA Corporation\\NVIDIA Broadcast\\NVIDIA Broadcast.exe', emoji: '🎙️', icon_url: 'assets/icons/launcher/nvidia_broadcast.png' },
      { id: 108, name: 'Explorador', command: 'explorer.exe', emoji: '📁', icon_url: '' },
      { id: 109, name: 'Configuración', command: 'ms-settings:', emoji: '⚙️', icon_url: '' },
      { id: 110, name: 'Panel NVIDIA', command: 'C:\\Program Files\\NVIDIA Corporation\\Control Panel Client\\nvcplui.exe', emoji: '🖥️', icon_url: '' },
      { id: 111, name: 'Admin. Tareas', command: 'taskmgr.exe', emoji: '📊', icon_url: '' },
      { id: 112, name: 'WhatsApp', command: 'shell:AppsFolder\\5319275A.WhatsAppDesktop_cv1g1gvanyjgm!App', emoji: '💬', icon_url: '' }
    ],
    games: [
      { id: 201, name: 'Guild Wars 2', command: 'C:\\Guild Wars 2\\Gw2-64.exe', emoji: '⚔️', icon_url: 'assets/icons/launcher/gw2.png' },
      { id: 202, name: 'GW2 Launcher', command: 'C:\\Gw2launcher\\Gw2Launcher.exe', emoji: '🚀', icon_url: 'assets/icons/launcher/gw2launcher.png' },
      { id: 203, name: 'Blish HUD', command: 'C:\\Blish.HUD.1.1.1\\Blish HUD.exe', emoji: '🗺️', icon_url: 'assets/icons/launcher/blishhud.png' },
      { id: 204, name: 'Riot Client', command: 'C:\\Riot Games\\Riot Client\\RiotClientServices.exe', emoji: '🎮', icon_url: 'assets/icons/launcher/riot.png' },
      { id: 205, name: 'Overwolf', command: 'C:\\Program Files (x86)\\Overwolf\\OverwolfLauncher.exe', emoji: '🐺', icon_url: 'assets/icons/launcher/overwolf.png' },
      { id: 206, name: 'Steam', command: 'C:\\Program Files (x86)\\Steam\\steam.exe', emoji: '🚂', icon_url: 'assets/icons/launcher/steam.png' },
      { id: 207, name: 'Epic Games', command: 'C:\\Program Files (x86)\\Epic Games\\Launcher\\Portal\\Binaries\\Win32\\EpicGamesLauncher.exe', emoji: '🏰', icon_url: 'assets/icons/launcher/epic.png' },
      { id: 208, name: 'GOG Galaxy', command: 'C:\\Program Files (x86)\\GOG Galaxy\\GalaxyClient.exe', emoji: '🌟', icon_url: 'assets/icons/launcher/gog.png' }
    ]
  };

  var state = { favorites: [], categories: [], apps: [], games: [], widgets_left: [], widgets_right: [], theme: DEFAULT_THEME, theme_official: OFFICIAL_MARK };

  // Una sola vez: quien tenía Bóveda (el default anterior) o nada pasa a Gato Negro.
  function migrateToOfficial() {
    if (state.theme_official === OFFICIAL_MARK) return false;
    var migrated = (!state.theme || state.theme === 'boveda');
    if (migrated) state.theme = DEFAULT_THEME;
    state.theme_official = OFFICIAL_MARK;
    return migrated;
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        state.favorites = parsed.favorites || [];
        state.categories = parsed.categories || [];
        state.apps = parsed.apps || [];
        state.games = parsed.games || [];
        state.widgets_left = parsed.widgets_left || [];
        state.widgets_right = parsed.widgets_right || [];
        state.theme = parsed.theme || '';
        state.theme_official = parsed.theme_official || '';
        migrateToOfficial();
        
        state.favorites.forEach(function(f) {
          if (f.icon_url === undefined) f.icon_url = '';
          if (f.icon_data === undefined) f.icon_data = '';
          if (f.emoji === undefined) f.emoji = '';
          if (f.open_chrome === undefined) f.open_chrome = false;
        });
        state.categories.forEach(function(c) {
          (c.links || []).forEach(function(l) {
            if (l.icon_url === undefined) l.icon_url = '';
            if (l.icon_data === undefined) l.icon_data = '';
            if (l.emoji === undefined) l.emoji = '';
            if (l.open_chrome === undefined) l.open_chrome = false;
          });
        });
        return;
      }
    } catch(e) { console.warn(LOG, 'Error cargando:', e); }
    
    state.favorites = [];
    state.categories = [];
    state.apps = [];
    state.games = [];
    state.widgets_left = [];
    state.widgets_right = [];
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch(e) {
      console.error(LOG, 'Error guardando:', e);
      alert('⚠️ No se pudo guardar. Usá Backup para respaldar.');
    }
  }

  function exportJSON() {
    var blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'la-guarida-data.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJSON(file) {
    var reader = new FileReader();
    reader.onload = function(e) {
      try {
        var data = JSON.parse(e.target.result);
        if (data && data.favorites !== undefined) {
          state.favorites = data.favorites || [];
          state.categories = data.categories || [];
          state.apps = data.apps || [];
          state.games = data.games || [];
          state.widgets_left = data.widgets_left || [];
          state.widgets_right = data.widgets_right || [];
          save();
          if (root.App && typeof root.App.render === 'function') root.App.render();
          alert('✅ Datos importados correctamente');
        } else {
          alert('❌ El archivo no tiene el formato correcto');
        }
      } catch(err) {
        alert('❌ Error al leer el JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  function genId() { return Date.now() + Math.floor(Math.random() * 1000); }
  function esc(s) { return String(s || '').replace(/[&<>]/g, function(m) { return ({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]); }); }
  function getDomain(url) { try { return new URL(url).hostname; } catch(e) { return ''; } }

  // ====== Íconos (FAV-1, 1.0.0, 2026-11-23) ======
  // Pablo: los favoritos de Shiruvana-dev y Shiruna-dev se veían iguales, el de GitHub no se
  // veía y el Centro de mando quedaba sin marco. Nuestros sitios llevan su ícono acá mismo
  // (SVG en línea, sin red); mismo gato de la marca, distinto color por dueño:
  //   dev     → mi DEV (La Bóveda que evoluciono): marco violeta, ojos ámbar (la marca tal cual)
  //   shiruna → el DEV de Shiruna: marco rosa, ojos turquesa y un moñito
  //   centro  → el Centro de mando: disco violeta, ojos ámbar
  //   github  → GitHub: la marca clara sobre disco oscuro (la oscura se perdía en el panel)
  // Ganan sobre icon_url y emoji (son nuestros); solo un ícono subido a mano (icon_data) los pisa.
  var ICONOS_VERSION = '1.0.0';
  var GATO_PATH = 'M8 25V12l3-5 3 4h4l3-4 3 5v13c0 1-1 2-2 2H10c-1 0-2-1-2-2z';
  var GITHUB_PATH = 'M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z';

  function svgURI(svg) { return 'data:image/svg+xml,' + encodeURIComponent(svg); }

  function svgGato(fondo, aro, ojos, extra) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">' +
      '<circle cx="16" cy="16" r="15.25" fill="' + fondo + '" stroke="' + aro + '" stroke-width="1.5"/>' +
      '<path d="' + GATO_PATH + '" fill="#0F1117"/>' +
      '<ellipse cx="13" cy="17" rx="1.6" ry="2.2" fill="' + ojos + '"/>' +
      '<ellipse cx="19" cy="17" rx="1.6" ry="2.2" fill="' + ojos + '"/>' + (extra || '') + '</svg>';
  }

  var ICONOS_SVG = {
    dev: svgGato('#232A3A', '#7B5CFF', '#F2B94B'),
    shiruna: svgGato('#3A2036', '#FF6FAE', '#2EC4B6',
      '<path d="M20.6 8.6l2.3-1.7v3.4zM25.4 8.6l-2.3-1.7v3.4z" fill="#FF6FAE"/><circle cx="23" cy="8.6" r=".9" fill="#FF6FAE"/>'),
    centro: svgGato('#5A3DDB', '#C9BBFF', '#F2B94B'),
    github: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#24292F"/>' +
      '<path transform="translate(6 6) scale(1.25)" fill="#F0F3F6" d="' + GITHUB_PATH + '"/></svg>'
  };

  // Dirección sin protocolo ni www, en minúsculas → ícono. El orden importa: lo más largo primero.
  var SITIOS = [
    ['pablosnchz.github.io/gw2-factory-dashboard', 'centro'],
    ['pablosnchz.github.io/gw2-factory-dev', 'dev'],
    ['gw2-factory-dev.vercel.app', 'dev'],
    ['shiruna-gato-negro.github.io', 'shiruna'],
    ['github.com', 'github']
  ];

  function sitioPropio(url) {
    var k = String(url || '').trim().toLowerCase()
      .replace(/^[a-z][a-z0-9+.-]*:\/\//, '').replace(/^www\./, '').replace(/[?#].*$/, '');
    for (var i = 0; i < SITIOS.length; i++) {
      var p = SITIOS[i][0];
      if (k === p || k.indexOf(p + '/') === 0) return SITIOS[i][1];
    }
    return '';
  }

  function iconoSitio(clave) { return ICONOS_SVG[clave] ? svgURI(ICONOS_SVG[clave]) : ''; }

  // Un icon_url que en realidad es un favicon (servicios de favicons o .ico) va como favicon.
  function esFaviconWeb(u) {
    return /icon\.horse\/|google\.com\/s2\/favicons|duckduckgo\.com\/ip3\/|favicon|\.ico(?:[?#]|$)/i.test(String(u || ''));
  }

  function clase(base, extra) { return ((base || '') + ' ' + extra).trim(); }

  function getFaviconHTML(item, size, cssClass) {
    var s = size || 32;
    var emojiClass = cssClass === 'fav-icon' ? 'fav-emoji' : 'link-emoji';
    var url = item.url || '';
    var emoji = item.emoji || '';
    var icon_url = item.icon_url || '';
    var icon_data = item.icon_data || '';

    var sitio = icon_data ? '' : sitioPropio(url);
    if (sitio) {
      return '<img class="' + clase(cssClass, 'fi-llena') + '" src="' + iconoSitio(sitio) + '" alt="" data-sitio="' + sitio + '" style="width:' + s + 'px;height:' + s + 'px;border-radius:50%;object-fit:cover;">';
    }
    
    if (icon_url && icon_url.trim()) {
      return '<img class="' + clase(cssClass, esFaviconWeb(icon_url) ? 'fi-web' : 'fi-llena') + '" src="' + esc(icon_url) + '" alt="" style="width:' + s + 'px;height:' + s + 'px;border-radius:8px;object-fit:contain;" ' +
             'onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'inline-block\';">' +
             '<span class="' + emojiClass + '" style="display:none;width:' + s + 'px;height:' + s + 'px;font-size:' + (s * 0.7) + 'px;line-height:' + s + 'px;">' + (emoji || '🔗') + '</span>';
    }
    
    if (icon_data) {
      return '<img class="' + clase(cssClass, 'fi-llena') + '" src="' + icon_data + '" alt="" style="width:' + s + 'px;height:' + s + 'px;border-radius:8px;object-fit:contain;">';
    }
    
    if (emoji && emoji.trim()) {
      return '<span class="' + emojiClass + '" style="width:' + s + 'px;height:' + s + 'px;font-size:' + (s * 0.7) + 'px;line-height:' + s + 'px;">' + emoji + '</span>';
    }
    
    var domain = getDomain(url);
    if (domain) {
      var iconHorseFavicon = 'https://icon.horse/icon/' + domain;
      var googleFavicon = 'https://www.google.com/s2/favicons?domain=' + domain + '&sz=256';
      var duckduckgoFavicon = 'https://icons.duckduckgo.com/ip3/' + domain + '.ico';
      
      return '<img class="' + clase(cssClass, 'fi-web') + '" src="' + iconHorseFavicon + '" alt="" style="width:' + s + 'px;height:' + s + 'px;border-radius:8px;object-fit:contain;" ' +
             'onerror="if(!this.dataset.fallback1){this.dataset.fallback1=1;this.src=\'' + googleFavicon + '\';}else if(!this.dataset.fallback2){this.dataset.fallback2=1;this.src=\'' + duckduckgoFavicon + '\';}else{this.style.display=\'none\';this.nextElementSibling.style.display=\'inline-block\';}">' +
             '<span class="' + emojiClass + '" style="display:none;width:' + s + 'px;height:' + s + 'px;font-size:' + (s * 0.7) + 'px;line-height:' + s + 'px;">🔗</span>';
    }
    
    return '<span class="' + emojiClass + '" style="width:' + s + 'px;height:' + s + 'px;font-size:' + (s * 0.7) + 'px;line-height:' + s + 'px;">🔗</span>';
  }

  // ====== «Lo de siempre» con el ícono real (FAV-1) ======
  // js/shiruvana.js pinta cada chip con un emoji (⭐ para todo favorito). Acá cambio ese emoji
  // por el mismo ícono de la tarjeta. El chip trae el nombre en title: busco primero en
  // Favoritos, después en los enlaces de Categorías y al final en el Lanzador.
  function itemPorNombre(nombre) {
    if (!nombre) return null;
    var i, j, cs = state.categories || [];
    for (i = 0; i < (state.favorites || []).length; i++) if (state.favorites[i].name === nombre) return state.favorites[i];
    for (i = 0; i < cs.length; i++) for (j = 0; j < (cs[i].links || []).length; j++) if (cs[i].links[j].name === nombre) return cs[i].links[j];
    var lz = (state.games || []).concat(state.apps || []);
    for (i = 0; i < lz.length; i++) if (lz[i].name === nombre) return lz[i];
    return null;
  }

  function decorarChips(box) {
    if (!box || !box.querySelectorAll) return 0;
    var n = 0;
    Array.prototype.forEach.call(box.querySelectorAll('.gn-usual__chip'), function (chip) {
      if (chip.getAttribute('data-ico')) return;
      var span = chip.querySelector('span[aria-hidden]');
      var it = itemPorNombre(chip.getAttribute('title'));
      if (!span || !it) return;
      chip.setAttribute('data-ico', '1');
      span.className = 'gn-usual__ico';
      span.innerHTML = getFaviconHTML(it, 18, 'gn-usual__img');
      n++;
    });
    return n;
  }

  // ====== Fluidez (FLU-1, 1.0.0, 2026-11-23) ======
  // Pablo: al bajar la página se sentía pesada y con saltitos. Dos causas de este lado:
  // 1) widgets.js arranca un reloj de 1 s (function tick) cada vez que dibuja los widgets y nunca
  //    para el anterior: con el uso se juntaban decenas de relojes tocando la página cada segundo.
  //    Dejo pasar uno solo: el primero sigue andando (busca los widgets en cada vuelta, así que
  //    sirve igual después de redibujar) y los nuevos se descartan. widgets.js no cambia.
  //    Lo reconozco por su nombre, su segundo y porque trabaja con .widget--clock: nada más se toca.
  // 2) body.gn-scrolleando mientras bajás (hasta 150 ms después del último paso): css/cards.css
  //    apaga el efecto de pasar el mouse por las tarjetas (cada una se levantaba y brillaba al
  //    cruzarla) y pausa las animaciones decorativas.
  var FLUIDEZ_VERSION = '1.0.0';
  var QUIETO_MS = 150;

  function esRelojWidgets(fn, ms) {
    return typeof fn === 'function' && fn.name === 'tick' && ms === 1000 && String(fn).indexOf('.widget--clock') !== -1;
  }

  function unSoloReloj(win) {
    var nativo = win && win.setTimeout;
    if (typeof nativo !== 'function' || nativo.__gnUnReloj) return false;
    var vivo = null;
    var envuelto = function (fn, ms) {
      if (esRelojWidgets(fn, ms)) {
        if (vivo && fn !== vivo) return 0; // ya hay uno andando
        vivo = fn;
      }
      return nativo.apply(win, arguments);
    };
    envuelto.__gnUnReloj = true;
    win.setTimeout = envuelto;
    return true;
  }

  function marcarScrolleo(win) {
    var doc = win && win.document;
    if (!doc || !win.addEventListener) return false;
    var t = null;
    win.addEventListener('scroll', function () {
      if (!doc.body) return;
      if (!t) doc.body.classList.add('gn-scrolleando');
      win.clearTimeout(t);
      t = win.setTimeout(function () { t = null; doc.body.classList.remove('gn-scrolleando'); }, QUIETO_MS);
    }, { passive: true });
    return true;
  }

  root.Data = {
    state: state,
    load: load,
    save: save,
    exportJSON: exportJSON,
    importJSON: importJSON,
    genId: genId,
    esc: esc,
    getDomain: getDomain,
    getFaviconHTML: getFaviconHTML,
    DEFAULT_STATE: DEFAULT_STATE,
    DEFAULT_THEME: DEFAULT_THEME,
    ICONOS_VERSION: ICONOS_VERSION,
    sitioPropio: sitioPropio,
    iconoSitio: iconoSitio,
    esFaviconWeb: esFaviconWeb,
    decorarChips: decorarChips,
    FLUIDEZ_VERSION: FLUIDEZ_VERSION,
    QUIETO_MS: QUIETO_MS,
    esRelojWidgets: esRelojWidgets,
    unSoloReloj: unSoloReloj,
    marcarScrolleo: marcarScrolleo
  };

  // En el navegador, enseguida: data.js carga antes que widgets.js y app.js.
  if (root.document) { unSoloReloj(root); marcarScrolleo(root); }

  // En el navegador: cada vez que shiruvana.js repinta «Lo de siempre», le pongo los íconos.
  if (root.document && root.MutationObserver) {
    var conectar = function () {
      var box = root.document.getElementById('usualChips');
      if (!box) return;
      decorarChips(box);
      new root.MutationObserver(function () { decorarChips(box); }).observe(box, { childList: true });
    };
    if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', conectar);
    else conectar();
  }

})(typeof window !== 'undefined' ? window : this);
