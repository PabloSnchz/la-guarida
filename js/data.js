/*!
 * js/data.js — Estado y persistencia
 * v4 — Soporte icon_url + favicon personalizado
 */
(function (root) {
  'use strict';
  var LOG = '[LaGuarida:Data]';

  var STORAGE_KEY = 'la_guarida_data_v1';

  var DEFAULT_STATE = {
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
        // Asegurar que todos tienen icon_url y emoji
        state.favorites.forEach(function(f) {
          if (f.icon_url === undefined) f.icon_url = '';
          if (f.emoji === undefined) f.emoji = '';
        });
        state.categories.forEach(function(c) {
          (c.links || []).forEach(function(l) {
            if (l.icon_url === undefined) l.icon_url = '';
            if (l.emoji === undefined) l.emoji = '';
          });
        });
        return;
      }
    } catch(e) { console.warn(LOG, 'Error cargando:', e); }
    
    state.favorites = [];
    state.categories = [];
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
          state.favorites.forEach(function(f) { if (!f.icon_url) f.icon_url = ''; });
          state.categories.forEach(function(c) {
            (c.links || []).forEach(function(l) { if (!l.icon_url) l.icon_url = ''; });
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
    
    // 1er intento: icon_url personalizado
    if (icon_url && icon_url.trim()) {
      return '<img class="' + (cssClass || '') + '" src="' + esc(icon_url) + '" alt="" style="width:' + s + 'px;height:' + s + 'px;border-radius:8px;object-fit:contain;" ' +
             'onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'inline-block\';">' +
             '<span class="' + emojiClass + '" style="display:none;width:' + s + 'px;height:' + s + 'px;font-size:' + (s * 0.7) + 'px;line-height:' + s + 'px;">' + (emoji || '🔗') + '</span>';
    }
    
    // 2do intento: favicon automático del dominio
    var domain = getDomain(url);
    if (domain) {
      var googleFavicon = 'https://www.google.com/s2/favicons?domain=' + domain + '&sz=256';
      var duckduckgoFavicon = 'https://icons.duckduckgo.com/ip3/' + domain + '.ico';
      var iconHorseFavicon = 'https://icon.horse/icon/' + domain;
      
      return '<img class="' + (cssClass || '') + '" src="' + googleFavicon + '" alt="" style="width:' + s + 'px;height:' + s + 'px;border-radius:8px;object-fit:contain;" ' +
             'onerror="if(!this.dataset.fallback1){this.dataset.fallback1=1;this.src=\'' + duckduckgoFavicon + '\';}else if(!this.dataset.fallback2){this.dataset.fallback2=1;this.src=\'' + iconHorseFavicon + '\';}else{this.style.display=\'none\';this.nextElementSibling.style.display=\'inline-block\';}">' +
             '<span class="' + emojiClass + '" style="display:none;width:' + s + 'px;height:' + s + 'px;font-size:' + (s * 0.7) + 'px;line-height:' + s + 'px;">' + (emoji || '🔗') + '</span>';
    }
    
    // Fallback final: emoji
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
