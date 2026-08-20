/*!
 * js/drag-drop.js — Lógica de drag & drop
 * Incluye drag interno (reordenar) + externo (desde Firefox)
 */
(function (root) {
  'use strict';
  var LOG = '[LaGuarida:DragDrop]';

  var editMode = false;

  function setEditMode(on) { editMode = on; }

  // ====== DRAG INTERNO ======
  function handleDrop(e, targetZone, targetCatId) {
    try {
      var data = JSON.parse(e.dataTransfer.getData('text/plain'));
      var state = root.Data.state;
      
      if (targetZone === 'favorites') {
        if (data.type === 'link') {
          moveLinkToFavorites(state, data.catId, data.id);
        }
      }
      
      if (targetZone === 'category' && targetCatId) {
        if (data.type === 'favorite') {
          moveFavoriteToCategory(state, data.id, targetCatId);
        }
        if (data.type === 'link') {
          moveLinkBetweenCategories(state, data.catId, data.id, targetCatId);
        }
      }
    } catch(err) {
      // Si el JSON falla, es un drop externo (Firefox)
      handleExternalDrop(e);
    }
  }

  function moveLinkToFavorites(state, fromCatId, linkId) {
    var cat = state.categories.find(function(c) { return c.id === fromCatId; });
    if (!cat) return;
    var link = cat.links.find(function(l) { return l.id === linkId; });
    if (!link) return;
    
    state.favorites.push({ id: root.Data.genId(), name: link.name, url: link.url, emoji: link.emoji || '' });
    cat.links = cat.links.filter(function(l) { return l.id !== linkId; });
    root.Data.save();
    if (root.App && typeof root.App.render === 'function') root.App.render();
  }

  function moveFavoriteToCategory(state, favId, targetCatId) {
    var fav = state.favorites.find(function(f) { return f.id === favId; });
    if (!fav) return;
    var cat = state.categories.find(function(c) { return c.id === targetCatId; });
    if (!cat) return;
    
    cat.links.push({ id: root.Data.genId(), name: fav.name, url: fav.url, emoji: fav.emoji || '' });
    state.favorites = state.favorites.filter(function(f) { return f.id !== favId; });
    root.Data.save();
    if (root.App && typeof root.App.render === 'function') root.App.render();
  }

  function moveLinkBetweenCategories(state, fromCatId, linkId, toCatId) {
    if (fromCatId === toCatId) return;
    var fromCat = state.categories.find(function(c) { return c.id === fromCatId; });
    var toCat = state.categories.find(function(c) { return c.id === toCatId; });
    if (!fromCat || !toCat) return;
    var link = fromCat.links.find(function(l) { return l.id === linkId; });
    if (!link) return;
    
    toCat.links.push({ id: root.Data.genId(), name: link.name, url: link.url, emoji: link.emoji || '' });
    fromCat.links = fromCat.links.filter(function(l) { return l.id !== linkId; });
    root.Data.save();
    if (root.App && typeof root.App.render === 'function') root.App.render();
  }

  // ====== DRAG EXTERNO (Firefox) ======
  function getExternalURL(dataTransfer) {
    // Firefox arrastra el favicon → entrega text/uri-list
    var uriList = dataTransfer.getData('text/uri-list');
    if (uriList) {
      var lines = uriList.split('\n').filter(function(l) { return l && l.indexOf('#') !== 0; });
      if (lines.length) return lines[0];
    }
    
    // Firefox entrega text/x-moz-url para arrastres de pestañas
    var mozUrl = dataTransfer.getData('text/x-moz-url');
    if (mozUrl) {
      var firstLine = mozUrl.split('\n')[0];
      if (firstLine) return firstLine;
    }
    
    // Texto plano que sea URL
    var text = dataTransfer.getData('text/plain');
    if (text && (text.indexOf('http://') === 0 || text.indexOf('https://') === 0)) {
      return text;
    }
    
    return null;
  }

  function handleExternalDrop(e) {
    var url = getExternalURL(e.dataTransfer);
    if (!url) return;
    
    // Determinar en qué zona cayó
    var targetZone = null;
    var targetCatId = null;
    
    var element = e.target;
    while (element && element !== document.body) {
      if (element.id === 'favoritesGrid') {
        targetZone = 'favorites';
        break;
      }
      if (element.classList && element.classList.contains('category-card')) {
        targetZone = 'category';
        targetCatId = parseInt(element.getAttribute('data-id'));
        break;
      }
      element = element.parentElement;
    }
    
    if (!targetZone) targetZone = 'favorites';
    
    // Abrir modal pre-cargado con la URL
    root.Modal.openWithURL(targetZone === 'favorites' ? 'favorite' : 'link', url, targetCatId);
  }

  function initDragDrop() {
    var favGrid = document.getElementById('favoritesGrid');
    if (!favGrid) return;

    // ====== Zonas de drop interno ======
    favGrid.addEventListener('dragover', function(e) { e.preventDefault(); favGrid.classList.add('drag-over'); });
    favGrid.addEventListener('dragleave', function() { favGrid.classList.remove('drag-over'); });
    favGrid.addEventListener('drop', function(e) {
      e.preventDefault();
      favGrid.classList.remove('drag-over');
      
      // Verificar si es drag interno o externo
      var internalData = e.dataTransfer.getData('text/plain');
      if (internalData && internalData.indexOf('{') === 0) {
        handleDrop(e, 'favorites');
      } else {
        handleExternalDrop(e);
      }
    });

    document.querySelectorAll('.category-card').forEach(function(catCard) {
      var catId = parseInt(catCard.getAttribute('data-id'));
      catCard.addEventListener('dragover', function(e) { e.preventDefault(); catCard.classList.add('drag-over'); });
      catCard.addEventListener('dragleave', function() { catCard.classList.remove('drag-over'); });
      catCard.addEventListener('drop', function(e) {
        e.preventDefault();
        catCard.classList.remove('drag-over');
        
        var internalData = e.dataTransfer.getData('text/plain');
        if (internalData && internalData.indexOf('{') === 0) {
          handleDrop(e, 'category', catId);
        } else {
          handleExternalDrop(e);
        }
      });
    });

    // ====== Elementos arrastrables internos ======
    document.querySelectorAll('.fav-card, .category-link').forEach(function(el) {
      el.setAttribute('draggable', editMode ? 'true' : 'false');
      el.addEventListener('dragstart', function(e) {
        if (!editMode) { e.preventDefault(); return; }
        el.classList.add('dragging');
        var isFav = el.classList.contains('fav-card');
        e.dataTransfer.setData('text/plain', JSON.stringify({
          type: isFav ? 'favorite' : 'link',
          id: parseInt(el.getAttribute('data-id')),
          catId: isFav ? null : parseInt(el.getAttribute('data-cat-id'))
        }));
        e.dataTransfer.effectAllowed = 'move';
      });
      el.addEventListener('dragend', function() {
        el.classList.remove('dragging');
      });
    });

    // ====== Drop externo global ======
    document.addEventListener('dragover', function(e) {
      e.preventDefault();
      document.body.classList.add('drop-external-active');
    });
    document.addEventListener('dragleave', function(e) {
      if (e.relatedTarget === null) {
        document.body.classList.remove('drop-external-active');
      }
    });
    document.addEventListener('drop', function(e) {
      e.preventDefault();
      document.body.classList.remove('drop-external-active');
      
      // Si el drop no fue manejado por las zonas internas
      var internalData = e.dataTransfer.getData('text/plain');
      if (!internalData || internalData.indexOf('{') !== 0) {
        var url = getExternalURL(e.dataTransfer);
        if (url) {
          // Drop en cualquier lugar → agregar a favoritos
          root.Modal.openWithURL('favorite', url, null);
        }
      }
    });
  }

  root.DragDrop = {
    init: initDragDrop,
    setEditMode: setEditMode,
    handleDrop: handleDrop,
    getExternalURL: getExternalURL
  };

})(typeof window !== 'undefined' ? window : this);
