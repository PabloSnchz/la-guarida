/*!
 * js/data.js — Estado y persistencia
 * v4 — Soporte icon_url + favicon personalizado
 */
(function (root) {
  'use strict';
  var LOG = '[LaGuarida:Data]';

  var STORAGE_KEY = 'la_guarida_data_v1';

  var DEFAULT_STATE = {
    widgets_left: [
      { type: 'clock', position: 0, config: { format: '24h', showDate: true } },
      { type: 'daily_reset', position: 1, config: {} },
      { type: 'weekly_reset', position: 2, config: {} },
      { type: 'season_reset', position: 3, config: {} }
    ],
    widgets_right: [
      { type: 'notes', position: 0, config: { text: '' } },
      { type: 'counter', position: 1, config: { title: 'Cuenta regresiva', date: '' } },
      { type: 'gw2_news', position: 2, config: {} }
    ],
    favorites: [
      { id: 1, name: 'Bóveda', url: 'https://pablosnchz.github.io/gw2-wallet-ligero/', emoji: '', icon_url: 'https://pablosnchz.github.io/gw2-wallet-ligero/assets/favicon.png' },
      { id: 2, name: 'Métricas', url: 'https://pablosnchz.github.io/gw2-metrics-dashboard/', emoji: '', icon_url: '' },
      { id: 3, name: 'Link Bio', url: 'https://pablosnchz.github.io/bio/', emoji: '', icon_url: '' },
      { id: 4, name: 'Traffic Stats', url: 'https://pablosnchz.github.io/github-repo-traffic-stats/', emoji: '', icon_url: '' }
    ],
    categories: [
      {
        id: 1,
        name: 'GW2',
        emoji: '🎮',
        links: [
          { id: 1, name: 'Wiki ES', url: 'https://wiki-es.guildwars2.com/', emoji: '', icon_url: '' },
          { id: 2, name: 'GW2 Efficiency', url: 'https://gw2efficiency.com/', emoji: '', icon_url: '' },
          { id: 3, name: 'Metabattle', url: 'https://metabattle.com/', emoji: '', icon_url: '' }
        ]
      },
      {
        id: 2,
        name: 'Desarrollo',
        emoji: '💻',
        links: [
          { id: 1, name: 'GitHub', url: 'https://github.com/', emoji: '', icon_url: '' },
          { id: 2, name: 'Vercel', url: 'https://vercel.com/', emoji: '', icon_url: '' }
        ]
      }
    ]
  };

  var state = { favorites: [], categories: [] };

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        state.favorites = parsed.favorites || [];
        state.categories = parsed.categories || [];
        state.widgets_left = parsed.widgets_left || [];
        state.widgets_right = parsed.widgets_right || [];
        
        // Si no hay widgets, usar defaults
        if (!state.widgets_left.length && !state.widgets_right.length) {
          state.widgets_left = [
            { type: 'clock', position: 0, config: { format: '24h', showDate: true } },
            { type: 'greeting', position: 1, config: { name: '' } }
          ];
          state.widgets_right = [
            { type: 'notes', position: 0, config: { text: '' } },
            { type: 'counter', position: 1, config: { title: 'Cuenta regresiva', date: '2026-12-25' } }
          ];
          save();
        }
        // Asegurar que todos tienen icon_url y emoji
        state.favorites.forEach(function(f) {
          if (f.icon_url === undefined) f.icon_url = '';
          if (f.icon_data === undefined) f.icon_data = '';
          if (f.emoji === undefined) f.emoji = '';
        });
        state.categories.forEach(function(c) {
          (c.links || []).forEach(function(l) {
            if (l.icon_url === undefined) l.icon_url = '';
            if (l.icon_data === undefined) l.icon_data = '';
            if (l.emoji === undefined) l.emoji = '';
          });
        });
        return;
      }
    } catch(e) { console.warn(LOG, 'Error cargando:', e); }
    
    state.favorites = [];
    state.categories = [];
    state.widgets_left = [];
    state.widgets_right = [];
    // No guardar — solo si hay datos reales
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch(e) {
      console.error(LOG, 'Error guardando:', e);
      alert('⚠️ No se pudo guardar. Usá Exportar para respaldar.');
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
        if (data && data.favorites && data.categories) {
          state.favorites = data.favorites || [];
          state.categories = data.categories || [];
          state.widgets_left = data.widgets_left || [];
          state.widgets_right = data.widgets_right || [];
          state.favorites.forEach(function(f) {
            if (!f.icon_url) f.icon_url = '';
            if (!f.icon_data) f.icon_data = '';
          });
          state.categories.forEach(function(c) {
            (c.links || []).forEach(function(l) {
              if (!l.icon_url) l.icon_url = '';
              if (!l.icon_data) l.icon_data = '';
            });
          });
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
    
    
    // 1er prioridad: icon_url manual
    if (icon_url && icon_url.trim()) {
      return '<img class="' + (cssClass || '') + '" src="' + esc(icon_url) + '" alt="" style="width:' + s + 'px;height:' + s + 'px;border-radius:8px;object-fit:contain;" ' +
             'onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'inline-block\';">' +
             '<span class="' + emojiClass + '" style="display:none;width:' + s + 'px;height:' + s + 'px;font-size:' + (s * 0.7) + 'px;line-height:' + s + 'px;">' + (emoji || '🔗') + '</span>';
    }
    
    // 2da prioridad: icon_data base64
    if (icon_data) {
      return '<img class="' + (cssClass || '') + '" src="' + icon_data + '" alt="" style="width:' + s + 'px;height:' + s + 'px;border-radius:8px;object-fit:contain;">';
    }
    
    // 3ra prioridad: emoji manual
    if (emoji && emoji.trim()) {
      return '<span class="' + emojiClass + '" style="width:' + s + 'px;height:' + s + 'px;font-size:' + (s * 0.7) + 'px;line-height:' + s + 'px;">' + emoji + '</span>';
    }
    
    // 4ta PRIORIDAD: automático
    var domain = getDomain(url);
    if (domain) {
      var iconHorseFavicon = 'https://icon.horse/icon/' + domain;
      var googleFavicon = 'https://www.google.com/s2/favicons?domain=' + domain + '&sz=256';
      var duckduckgoFavicon = 'https://icons.duckduckgo.com/ip3/' + domain + '.ico';
      
      return '<img class="' + (cssClass || '') + '" src="' + iconHorseFavicon + '" alt="" style="width:' + s + 'px;height:' + s + 'px;border-radius:8px;object-fit:contain;" ' +
             'onerror="if(!this.dataset.fallback1){this.dataset.fallback1=1;this.src=\'' + googleFavicon + '\';}else if(!this.dataset.fallback2){this.dataset.fallback2=1;this.src=\'' + duckduckgoFavicon + '\';}else{this.style.display=\'none\';this.nextElementSibling.style.display=\'inline-block\';}">' +
             '<span class="' + emojiClass + '" style="display:none;width:' + s + 'px;height:' + s + 'px;font-size:' + (s * 0.7) + 'px;line-height:' + s + 'px;">' + (emoji || '🔗') + '</span>';
    }
    
    return '<span class="' + emojiClass + '" style="width:' + s + 'px;height:' + s + 'px;font-size:' + (s * 0.7) + 'px;line-height:' + s + 'px;">' + (emoji || '🔗') + '</span>';
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
