/*!
 * js/data.js — Estado y persistencia
 * v7 — Íconos oficiales en el lanzador
 */
(function (root) {
  'use strict';
  var LOG = '[LaGuarida:Data]';

  var STORAGE_KEY = 'la_guarida_data_v1';

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
      { id: 111, name: 'Admin. Tareas', command: 'taskmgr.exe', emoji: '📊', icon_url: '' }
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

  var state = { favorites: [], categories: [], apps: [], games: [], widgets_left: [], widgets_right: [] };

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

  function getFaviconHTML(item, size, cssClass) {
    var s = size || 32;
    var emojiClass = cssClass === 'fav-icon' ? 'fav-emoji' : 'link-emoji';
    var url = item.url || '';
    var emoji = item.emoji || '';
    var icon_url = item.icon_url || '';
    var icon_data = item.icon_data || '';
    
    if (icon_url && icon_url.trim()) {
      return '<img class="' + (cssClass || '') + '" src="' + esc(icon_url) + '" alt="" style="width:' + s + 'px;height:' + s + 'px;border-radius:8px;object-fit:contain;" ' +
             'onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'inline-block\';">' +
             '<span class="' + emojiClass + '" style="display:none;width:' + s + 'px;height:' + s + 'px;font-size:' + (s * 0.7) + 'px;line-height:' + s + 'px;">' + (emoji || '🔗') + '</span>';
    }
    
    if (icon_data) {
      return '<img class="' + (cssClass || '') + '" src="' + icon_data + '" alt="" style="width:' + s + 'px;height:' + s + 'px;border-radius:8px;object-fit:contain;">';
    }
    
    if (emoji && emoji.trim()) {
      return '<span class="' + emojiClass + '" style="width:' + s + 'px;height:' + s + 'px;font-size:' + (s * 0.7) + 'px;line-height:' + s + 'px;">' + emoji + '</span>';
    }
    
    var domain = getDomain(url);
    if (domain) {
      var iconHorseFavicon = 'https://icon.horse/icon/' + domain;
      var googleFavicon = 'https://www.google.com/s2/favicons?domain=' + domain + '&sz=256';
      var duckduckgoFavicon = 'https://icons.duckduckgo.com/ip3/' + domain + '.ico';
      
      return '<img class="' + (cssClass || '') + '" src="' + iconHorseFavicon + '" alt="" style="width:' + s + 'px;height:' + s + 'px;border-radius:8px;object-fit:contain;" ' +
             'onerror="if(!this.dataset.fallback1){this.dataset.fallback1=1;this.src=\'' + googleFavicon + '\';}else if(!this.dataset.fallback2){this.dataset.fallback2=1;this.src=\'' + duckduckgoFavicon + '\';}else{this.style.display=\'none\';this.nextElementSibling.style.display=\'inline-block\';}">' +
             '<span class="' + emojiClass + '" style="display:none;width:' + s + 'px;height:' + s + 'px;font-size:' + (s * 0.7) + 'px;line-height:' + s + 'px;">🔗</span>';
    }
    
    return '<span class="' + emojiClass + '" style="width:' + s + 'px;height:' + s + 'px;font-size:' + (s * 0.7) + 'px;line-height:' + s + 'px;">🔗</span>';
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
    DEFAULT_STATE: DEFAULT_STATE
  };

})(typeof window !== 'undefined' ? window : this);