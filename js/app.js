/*!
 * js/app.js — Init + render + wire events
 * v2 — Soporte open_chrome para abrir links en Chrome
 */
(function (root) {
  'use strict';
  var LOG = '[LaGuarida]';

  var editMode = false;

  function $(sel) { return document.querySelector(sel); }

  function getHref(item) {
    if (item.open_chrome) {
      return 'chrome-launch://' + item.url.replace(/^https?:\/\//, '');
    }
    return item.url;
  }

  // ====== RENDER ======
  function render() {
    renderFavorites();
    renderCategories();
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
          var href = card.getAttribute('href');
          window.location.href = href;
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
          var href = link.getAttribute('href');
          window.location.href = href;
        }
      });
    });
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

  // ====== WIRE ======
  function wireEvents() {
    $('#editModeBtn').addEventListener('click', function() {
      editMode = !editMode;
      this.textContent = editMode ? '✅ Modo edición: ON' : '✏️ Modo edición';
      document.body.classList.toggle('edit-mode', editMode);
      root.DragDrop.setEditMode(editMode);
      render();
    });

    $('#addFavoriteBtn').addEventListener('click', function() { root.Modal.open('favorite'); });
    $('#addCategoryBtn').addEventListener('click', function() { root.Modal.open('category'); });
    $('#exportBtn').addEventListener('click', root.Data.exportJSON);
    $('#importBtn').addEventListener('click', function() { $('#importFile').click(); });
    $('#importFile').addEventListener('change', function(e) {
      if (this.files && this.files[0]) root.Data.importJSON(this.files[0]);
      this.value = '';
    });

    root.Modal.wire();
  }

  // ====== INIT ======
  function init() {
    console.log(LOG, 'Iniciando...');
    root.Data.load();
    wireEvents();
    render();
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