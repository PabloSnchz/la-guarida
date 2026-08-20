/*!
 * js/data.js — Estado y persistencia
 * v2 — Favicons con triple fallback de alta calidad
 */
(function (root) {
  'use strict';
  var LOG = '[LaGuarida:Data]';

  var STORAGE_KEY = 'la_guarida_data_v1';

  var DEFAULT_STATE = {
    favorites: [
      { id: 1, name: 'Bóveda', url: 'https://pablosnchz.github.io/gw2-wallet-ligero/', emoji: '' },
      { id: 2, name: 'Métricas', url: 'https://pablosnchz.github.io/gw2-metrics-dashboard/', emoji: '' },
      { id: 3, name: 'Link Bio', url: 'https://pablosnchz.github.io/bio/', emoji: '' },
      { id: 4, name: 'Traffic Stats', url: 'https://pablosnchz.github.io/github-repo-traffic-stats/', emoji: '' }
    ],
    categories: [
      {
        id: 1,
        name: 'GW2',
        emoji: '🎮',
        links: [
          { id: 1, name: 'Wiki ES', url: 'https://wiki-es.guildwars2.com/', emoji: '' },
          { id: 2, name: 'GW2 Efficiency', url: 'https://gw2efficiency.com/', emoji: '' },
          { id: 3, name: 'Metabattle', url: 'https://metabattle.com/', emoji: '' }
        ]
      },
      {
        id: 2,
        name: 'Desarrollo',
        emoji: '💻',
        links: [
          { id: 1, name: 'GitHub', url: 'https://github.com/', emoji: '' },
          { id: 2, name: 'Vercel', url: 'https://vercel.com/', emoji: '' }
        ]
      }
    ]
  };

  var state = { favorites: [], categories: [] };

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) { state = JSON.parse(raw); return; }
    } catch(e) { console.warn(LOG, 'Error cargando:', e); }
    state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    save();
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
          state = data;
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

  function getFaviconHTML(url, emoji, size, cssClass) {
    var domain = getDomain(url);
    var s = size || 32;
    var emojiClass = cssClass === 'fav-icon' ? 'fav-emoji' : 'link-emoji';
    
    if (domain) {
      // Triple fallback de alta calidad
      var googleFavicon = 'https://www.google.com/s2/favicons?domain=' + domain + '&sz=256';
      var duckduckgoFavicon = 'https://icons.duckduckgo.com/ip3/' + domain + '.ico';
      var iconHorseFavicon = 'https://icon.horse/icon/' + domain;
      var emojiFallback = emoji || '🔗';
      
      return '<img class="' + (cssClass || '') + '" src="' + googleFavicon + '" alt="" style="width:' + s + 'px;height:' + s + 'px;border-radius:8px;object-fit:contain;" ' +
             'onerror="if(!this.dataset.fallback1){this.dataset.fallback1=1;this.src=\'' + duckduckgoFavicon + '\';}else if(!this.dataset.fallback2){this.dataset.fallback2=1;this.src=\'' + iconHorseFavicon + '\';}else{this.style.display=\'none\';this.nextElementSibling.style.display=\'inline-block\';}">' +
             '<span class="' + emojiClass + '" style="display:none;width:' + s + 'px;height:' + s + 'px;font-size:' + (s * 0.7) + 'px;line-height:' + s + 'px;">' + emojiFallback + '</span>';
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
