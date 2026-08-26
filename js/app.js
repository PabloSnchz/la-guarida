/*!
 * js/app.js — Init + render + wire events
 * v3 — Lanzador de apps y juegos
 */
(function (root) {
  'use strict';
  var LOG = '[LaGuarida]';

  var editMode = false;
  var launcherTab = 'apps';

  function $(sel) { return document.querySelector(sel); }

  function getHref(item) {
    if (item.open_chrome) {
      return 'chrome-launch:' + item.url.replace(/^https?:\/\//, '');
    }
    return item.url;
  }

  // ====== RENDER ======
  function render() {
    renderFavorites();
    renderCategories();
    renderLauncher();
    root.Widgets.renderAll();
    root.DragDrop.init();
  }

  function renderFavorites() {
    var grid = $('#favoritesGrid');
    if (!grid) return;
    var state = root.Data.state;

    grid.innerHTML = state.favorites.map(function(fav) {
      var href = getHref(fav);
      var chromeBadge = fav.open_chrome ? '<span class="chrome-badge" title="Abrir en Chrome">🌐</span>' : '';
      
      return '<a class="fav-card' + (fav.open_chrome ? ' chrome-forced' : '') + '" href="' + root.Data.esc(href) + '" target="_blank" rel="noopener" data-id="' + fav.id + '">' +
        chromeBadge +
        root.Data.getFaviconHTML(fav, 40, 'fav-icon') +
        '<span class="fav-name">' + root.Data.esc(fav.name) + '</span>' +
        '<div class="edit-actions">' +
          '<button class="edit-btn" data-action="edit" data-id="' + fav.id + '" title="Editar">✏️</button>' +
          '<button class="del-btn" data-action="delete" data-id="' + fav.id + '" title="Eliminar">🗑</button>' +
        '</div>' +
        '</a>';
    }).join('') + '<button class="add-btn" id="addFavInline">+ Favorito</button>';

    var addFavBtn = $('#addFavInline');
    if (addFavBtn) addFavBtn.addEventListener('click', function() { root.Modal.open('favorite'); });

    grid.querySelectorAll('.edit-actions button').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault(); e.stopPropagation();
        var action = this.getAttribute('data-action');
        var id = parseInt(this.getAttribute('data-id'));
        if (action === 'edit') root.Modal.open('favorite', id);
        if (action === 'delete') deleteFavorite(id);
      });
    });

    grid.querySelectorAll('.fav-card').forEach(function(card) {
      card.addEventListener('click', function(e) {
        if (editMode) {
          e.preventDefault();
          root.Modal.open('favorite', parseInt(this.getAttribute('data-id')));
        } else if (card.classList.contains('chrome-forced')) {
          e.preventDefault();
          window.location.href = card.getAttribute('href');
        }
      });
    });
  }

  function renderCategories() {
    var grid = $('#categoriesGrid');
    if (!grid) return;
    var state = root.Data.state;

    grid.innerHTML = state.categories.map(function(cat) {
      var linksHTML = cat.links.map(function(link) {
        var href = getHref(link);
        var chromeBadge = link.open_chrome ? '<span class="chrome-badge" title="Abrir en Chrome">🌐</span>' : '';
        
        return '<a class="category-link' + (link.open_chrome ? ' chrome-forced' : '') + '" href="' + root.Data.esc(href) + '" target="_blank" rel="noopener" data-cat-id="' + cat.id + '" data-link-id="' + link.id + '" data-id="' + link.id + '">' +
          chromeBadge +
          root.Data.getFaviconHTML(link, 20, 'link-icon') +
          '<span class="link-name">' + root.Data.esc(link.name) + '</span>' +
          '<div class="edit-actions">' +
            '<button class="edit-btn" data-action="edit-link" data-cat-id="' + cat.id + '" data-link-id="' + link.id + '">✏️</button>' +
            '<button class="del-btn" data-action="delete-link" data-cat-id="' + cat.id + '" data-link-id="' + link.id + '">🗑</button>' +
          '</div>' +
          '</a>';
      }).join('');

      return '<div class="category-card" data-id="' + cat.id + '">' +
        '<div class="category-header">' +
          '<span class="category-title">' + root.Data.esc(cat.emoji || '📁') + ' ' + root.Data.esc(cat.name) + '</span>' +
          '<div class="edit-actions">' +
            '<button class="edit-btn" data-action="edit-cat" data-id="' + cat.id + '">✏️</button>' +
            '<button class="del-btn" data-action="delete-cat" data-id="' + cat.id + '">🗑</button>' +
          '</div>' +
        '</div>' +
        '<div class="category-links">' + linksHTML + '</div>' +
        '<button class="add-btn" style="margin-top:8px;" data-action="add-link" data-cat-id="' + cat.id + '">+ Link</button>' +
        '</div>';
    }).join('') + '<button class="add-btn" id="addCatInline">+ Categoría</button>';

    var addCatBtn = $('#addCatInline');
    if (addCatBtn) addCatBtn.addEventListener('click', function() { root.Modal.open('category'); });

    grid.querySelectorAll('[data-action="edit-cat"]').forEach(function(btn) {
      btn.addEventListener('click', function() { root.Modal.open('category', parseInt(this.getAttribute('data-id'))); });
    });
    grid.querySelectorAll('[data-action="delete-cat"]').forEach(function(btn) {
      btn.addEventListener('click', function() { deleteCategory(parseInt(this.getAttribute('data-id'))); });
    });

    grid.querySelectorAll('[data-action="add-link"]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        root.Modal.open('link', null, parseInt(this.getAttribute('data-cat-id')));
      });
    });

    grid.querySelectorAll('[data-action="edit-link"]').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault(); e.stopPropagation();
        root.Modal.open('link', parseInt(this.getAttribute('data-link-id')), parseInt(this.getAttribute('data-cat-id')));
      });
    });
    grid.querySelectorAll('[data-action="delete-link"]').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault(); e.stopPropagation();
        deleteLink(parseInt(this.getAttribute('data-cat-id')), parseInt(this.getAttribute('data-link-id')));
      });
    });

    grid.querySelectorAll('.category-link').forEach(function(link) {
      link.addEventListener('click', function(e) {
        if (editMode) {
          e.preventDefault();
          root.Modal.open('link', parseInt(this.getAttribute('data-link-id')), parseInt(this.getAttribute('data-cat-id')));
        } else if (link.classList.contains('chrome-forced')) {
          e.preventDefault();
          window.location.href = link.getAttribute('href');
        }
      });
    });
  }

  // ====== LANZADOR ======
  function renderLauncherGrid(containerId, items, typeLabel) {
    var container = $('#' + containerId);
    if (!container) return;

    container.innerHTML = items.map(function(item) {
      return '<div class="launcher-item" data-id="' + item.id + '" data-type="' + typeLabel + '">' +
        '<span class="launcher-icon">' + 
          (item.icon_url ? '<img src="' + item.icon_url + '" alt="" style="width:24px;height:24px;object-fit:contain;border-radius:4px;">' : root.Data.esc(item.emoji || '🚀')) +
        '</span>' +
        '<span class="launcher-name">' + root.Data.esc(item.name) + '</span>' +
        '<div class="edit-actions">' +
          '<button class="extract-btn" data-action="extract-icon" data-id="' + item.id + '" data-type="' + typeLabel + '" title="Extraer ícono">📥</button>' +
          '<button class="edit-btn" data-action="edit-launcher" data-id="' + item.id + '" data-type="' + typeLabel + '">✏️</button>' +
          '<button class="del-btn" data-action="delete-launcher" data-id="' + item.id + '" data-type="' + typeLabel + '">🗑</button>' +
        '</div>' +
        '</div>';
    }).join('') + '<button class="add-btn add-launcher-btn" data-type="' + typeLabel + '">+ ' + (typeLabel === 'app' ? 'App' : 'Juego') + '</button>';

    container.querySelectorAll('.add-launcher-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var type = this.getAttribute('data-type');
        root.Modal.open('launcher', null, type === 'app' ? 'apps' : 'games');
      });
    });

    container.querySelectorAll('[data-action="edit-launcher"]').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var id = parseInt(this.getAttribute('data-id'));
        var type = this.getAttribute('data-type');
        root.Modal.open('launcher', id, type === 'app' ? 'apps' : 'games');
      });
    });

    container.querySelectorAll('[data-action="extract-icon"]').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var id = parseInt(this.getAttribute('data-id'));
        var type = this.getAttribute('data-type');
        extractIconForItem(id, type);
      });
    });

    container.querySelectorAll('[data-action="delete-launcher"]').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var id = parseInt(this.getAttribute('data-id'));
        var type = this.getAttribute('data-type');
        deleteLauncherItem(id, type);
      });
    });

    container.querySelectorAll('.launcher-item').forEach(function(item) {
      item.addEventListener('click', function(e) {
        if (editMode) {
          e.stopPropagation();
          var id = parseInt(this.getAttribute('data-id'));
          var type = this.getAttribute('data-type');
          root.Modal.open('launcher', id, type === 'app' ? 'apps' : 'games');
        } else {
          launchApp(this);
        }
      });
    });
  }

  function renderLauncher() {
    var state = root.Data.state;
    var defaults = root.Data.DEFAULT_STATE;
    
    // FUSIONAR apps: agregar las que están en defaults pero NO en el estado actual
    if (defaults.apps) {
      defaults.apps.forEach(function(defaultApp) {
        var exists = state.apps.some(function(app) { return app.name === defaultApp.name; });
        if (!exists) {
          state.apps.push(defaultApp);
        }
      });
    }
    
    // FUSIONAR juegos: agregar los que están en defaults pero NO en el estado actual
    if (defaults.games) {
      defaults.games.forEach(function(defaultGame) {
        var exists = state.games.some(function(game) { return game.name === defaultGame.name; });
        if (!exists) {
          state.games.push(defaultGame);
        }
      });
    }
    
    root.Data.save();
    renderLauncherGrid('launcherGamesGrid', state.games, 'game');
    renderLauncherGrid('launcherAppsGrid', state.apps, 'app');
  }

  function launchApp(element) {
    var id = parseInt(element.getAttribute('data-id'));
    var type = element.getAttribute('data-type');
    var state = root.Data.state;
    
    var item;
    if (type === 'app') {
      item = state.apps.find(function(a) { return a.id === id; });
    } else {
      item = state.games.find(function(g) { return g.id === id; });
    }
    
    if (!item) return;
    
    // Usar protocol handler launch: con el nombre
    var launchUrl = 'launch:' + item.name.replace(/ /g, '-');
    window.location.href = launchUrl;
    
    console.log(LOG, 'Lanzando:', item.name, '→', item.launch_command || item.command);
  }

  function extractIconForItem(id, type) {
    var state = root.Data.state;
    var item;
    
    if (type === 'app') {
      item = state.apps.find(function(a) { return a.id === id; });
    } else {
      item = state.games.find(function(g) { return g.id === id; });
    }
    
    if (!item) return;
    
    // Usar extract_command si existe, sino launch_command
    var extractPath = item.extract_command || item.launch_command || item.command;
    if (!extractPath) {
      alert('⚠️ Esta app no tiene una ruta para extraer ícono.');
      return;
    }
    
    var launchUrl = 'launch:extract=' + extractPath.replace(/\\/g, '/');
    window.location.href = launchUrl;
    
    alert('📥 Extrayendo ícono de ' + item.name + '...\n\nRevisá Downloads\\launcher-icons\\');
  }

  function deleteLauncherItem(id, type) {
    if (!confirm('¿Eliminar este ' + (type === 'app' ? 'app' : 'juego') + '?')) return;
    var state = root.Data.state;
    if (type === 'app') {
      state.apps = state.apps.filter(function(a) { return a.id !== id; });
    } else {
      state.games = state.games.filter(function(g) { return g.id !== id; });
    }
    root.Data.save();
    render();
  }

  // ====== ACCIONES ======
  function deleteFavorite(id) {
    if (!confirm('¿Eliminar este favorito?')) return;
    root.Data.state.favorites = root.Data.state.favorites.filter(function(f) { return f.id !== id; });
    root.Data.save(); render();
  }

  function deleteCategory(id) {
    if (!confirm('¿Eliminar esta categoría y todos sus links?')) return;
    root.Data.state.categories = root.Data.state.categories.filter(function(c) { return c.id !== id; });
    root.Data.save(); render();
  }

  function deleteLink(catId, linkId) {
    if (!confirm('¿Eliminar este link?')) return;
    var cat = root.Data.state.categories.find(function(c) { return c.id === catId; });
    if (cat) {
      cat.links = cat.links.filter(function(l) { return l.id !== linkId; });
      root.Data.save(); render();
    }
  }

  // ====== TEMA ======
  function applyTheme(theme) {
    if (theme === 'random') {
      var themes = ['boveda', 'fluent', 'macos', 'ps5', 'steam', 'discord', 'notion', 'cyberpunk', 'glassmorphism', 'material-dark', 'nord', 'dracula', 'solarized-dark', 'tokyo-night', 'catppuccin', 'gruvbox', 'everforest', 'one-dark'];
      theme = themes[Math.floor(Math.random() * themes.length)];
    }
    document.body.setAttribute('data-theme', theme);
    root.Data.state.theme = theme;
    root.Data.save();
    
    var link = $('#themeStylesheet');
    if (link) {
      link.href = 'css/themes/' + theme + '.css';
    }
    
    var select = $('#themeSelect');
    if (select && select.value !== theme && theme !== 'random') {
      select.value = theme;
    }
  }

  // ====== WIRE ======
  function wireEvents() {
    $('#editModeBtn').addEventListener('click', function() {
      editMode = !editMode;
      this.textContent = editMode ? '✅ Editar: ON' : '✏️ Editar';
      document.body.classList.toggle('edit-mode', editMode);
      root.DragDrop.setEditMode(editMode);
      render();
    });

    var themeSelect = $('#themeSelect');
    if (themeSelect) themeSelect.addEventListener('change', function() {
      applyTheme(this.value);
    });

    $('#addFavoriteBtn').addEventListener('click', function() { root.Modal.open('favorite'); });
    $('#addCategoryBtn').addEventListener('click', function() { root.Modal.open('category'); });
    $('#exportBtn').addEventListener('click', root.Data.exportJSON);
    $('#importBtn').addEventListener('click', function() { $('#importFile').click(); });
    $('#importFile').addEventListener('change', function(e) {
      if (this.files && this.files[0]) root.Data.importJSON(this.files[0]);
      this.value = '';
    });

    // Tabs eliminados — apps y juegos se muestran juntos

    root.Modal.wire();
  }

  // ====== INIT ======
  function init() {
    console.log(LOG, 'Iniciando...');
    root.Data.load();
    wireEvents();
    render();
    
    // Aplicar tema guardado
    var savedTheme = root.Data.state.theme || 'boveda';
    document.body.setAttribute('data-theme', savedTheme);
    var themeSelect = $('#themeSelect');
    if (themeSelect && savedTheme !== 'random') {
      themeSelect.value = savedTheme;
    }
  }

  root.App = {
    render: render,
    init: init
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(typeof window !== 'undefined' ? window : this);