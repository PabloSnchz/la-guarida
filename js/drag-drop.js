/*!
 * js/drag-drop.js — Lógica de drag & drop
 * v3 — Fix: copia icon_url automático al mover elementos
 */
(function (root) {
  'use strict';
  var LOG = '[LaGuarida:DragDrop]';

  var editMode = false;
  var draggedItem = null;

  function setEditMode(on) { editMode = on; }

  // ====== Helper: obtener icon_url automático ======
  function getAutoIconURL(url) {
    var domain = root.Data.getDomain(url);
    return domain ? 'https://icon.horse/icon/' + domain : '';
  }

  // ====== REORDENAMIENTO ======
  function reorderFavorites(state, sourceId, targetId) {
    if (sourceId === targetId) return;
    var sourceIdx = state.favorites.findIndex(function(f) { return f.id === sourceId; });
    var targetIdx = state.favorites.findIndex(function(f) { return f.id === targetId; });
    if (sourceIdx === -1 || targetIdx === -1) return;
    
    var item = state.favorites.splice(sourceIdx, 1)[0];
    state.favorites.splice(targetIdx, 0, item);
    
    root.Data.save();
    if (root.App && typeof root.App.render === 'function') root.App.render();
  }

  function reorderLinks(state, catId, sourceId, targetId) {
    if (sourceId === targetId) return;
    var cat = state.categories.find(function(c) { return c.id === catId; });
    if (!cat) return;
    
    var sourceIdx = cat.links.findIndex(function(l) { return l.id === sourceId; });
    var targetIdx = cat.links.findIndex(function(l) { return l.id === targetId; });
    if (sourceIdx === -1 || targetIdx === -1) return;
    
    var item = cat.links.splice(sourceIdx, 1)[0];
    cat.links.splice(targetIdx, 0, item);
    
    root.Data.save();
    if (root.App && typeof root.App.render === 'function') root.App.render();
  }

  // ====== MOVIMIENTOS ======
  function moveLinkToFavorites(state, fromCatId, linkId) {
    var cat = state.categories.find(function(c) { return c.id === fromCatId; });
    if (!cat) return;
    var link = cat.links.find(function(l) { return l.id === linkId; });
    if (!link) return;
    
    // Copiar icon_url (custom o automático)
    var autoIcon = link.icon_url || getAutoIconURL(link.url);
    
    state.favorites.push({
      id: root.Data.genId(),
      name: link.name,
      url: link.url,
      emoji: link.emoji || '',
      icon_url: autoIcon
    });
    cat.links = cat.links.filter(function(l) { return l.id !== linkId; });
    root.Data.save();
    if (root.App && typeof root.App.render === 'function') root.App.render();
  }

  function moveFavoriteToCategory(state, favId, targetCatId) {
    var fav = state.favorites.find(function(f) { return f.id === favId; });
    if (!fav) return;
    var cat = state.categories.find(function(c) { return c.id === targetCatId; });
    if (!cat) return;
    
    // Copiar icon_url (custom o automático)
    var autoIcon = fav.icon_url || getAutoIconURL(fav.url);
    
    cat.links.push({
      id: root.Data.genId(),
      name: fav.name,
      url: fav.url,
      emoji: fav.emoji || '',
      icon_url: autoIcon
    });
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
    
    // Copiar icon_url (custom o automático)
    var autoIcon = link.icon_url || getAutoIconURL(link.url);
    
    toCat.links.push({
      id: root.Data.genId(),
      name: link.name,
      url: link.url,
      emoji: link.emoji || '',
      icon_url: autoIcon
    });
    fromCat.links = fromCat.links.filter(function(l) { return l.id !== linkId; });
    root.Data.save();
    if (root.App && typeof root.App.render === 'function') root.App.render();
  }

  // ====== DRAG EXTERNO ======
  function getExternalURL(dataTransfer) {
    var uriList = dataTransfer.getData('text/uri-list');
    if (uriList) {
      var lines = uriList.split('\n').filter(function(l) { return l && l.indexOf('#') !== 0; });
      if (lines.length) return lines[0];
    }
    var mozUrl = dataTransfer.getData('text/x-moz-url');
    if (mozUrl) {
      var firstLine = mozUrl.split('\n')[0];
      if (firstLine) return firstLine;
    }
    var text = dataTransfer.getData('text/plain');
    if (text && (text.indexOf('http://') === 0 || text.indexOf('https://') === 0)) {
      return text;
    }
    return null;
  }

  function handleExternalDrop(e) {
    var url = getExternalURL(e.dataTransfer);
    if (!url) return;
    
    var targetZone = null;
    var targetCatId = null;
    
    var catCard = e.target.closest ? e.target.closest('.category-card') : null;
    if (catCard) {
      targetZone = 'category';
      targetCatId = parseInt(catCard.getAttribute('data-id'));
    } else {
      var favGrid = e.target.closest ? e.target.closest('#favoritesGrid') : null;
      if (favGrid) targetZone = 'favorites';
    }
    
    if (!targetZone) targetZone = 'favorites';
    
    root.Modal.openWithURL(targetZone === 'favorites' ? 'favorite' : 'link', url, targetCatId);
  }

  // ====== INIT ======
  function initDragDrop() {
    var favGrid = document.getElementById('favoritesGrid');
    if (!favGrid) return;

    draggedItem = null;

    favGrid.addEventListener('dragover', function(e) { e.preventDefault(); favGrid.classList.add('drag-over'); });
    favGrid.addEventListener('dragleave', function() { favGrid.classList.remove('drag-over'); });
    favGrid.addEventListener('drop', function(e) {
      e.preventDefault();
      favGrid.classList.remove('drag-over');
      
      var internalData = e.dataTransfer.getData('text/plain');
      if (internalData && internalData.indexOf('{') === 0) {
        handleInternalDrop(e, 'favorites');
      } else {
        handleExternalDrop(e);
      }
      draggedItem = null;
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
          handleInternalDrop(e, 'category', catId);
        } else {
          handleExternalDrop(e);
        }
        draggedItem = null;
      });
    });

    document.querySelectorAll('.fav-card, .category-link').forEach(function(el) {
      el.setAttribute('draggable', editMode ? 'true' : 'false');
      
      el.addEventListener('dragstart', function(e) {
        if (!editMode) { e.preventDefault(); return; }
        el.classList.add('dragging');
        var isFav = el.classList.contains('fav-card');
        draggedItem = {
          type: isFav ? 'favorite' : 'link',
          id: parseInt(el.getAttribute('data-id')),
          catId: isFav ? null : parseInt(el.getAttribute('data-cat-id'))
        };
        e.dataTransfer.setData('text/plain', JSON.stringify(draggedItem));
        e.dataTransfer.effectAllowed = 'move';
      });
      
      el.addEventListener('dragend', function() {
        el.classList.remove('dragging');
        draggedItem = null;
      });
      
      el.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (!editMode || !draggedItem) return;
        if (draggedItem.id !== parseInt(el.getAttribute('data-id'))) {
          el.classList.add('drag-over');
        }
      });
      
      el.addEventListener('dragleave', function() {
        el.classList.remove('drag-over');
      });
      
      el.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        el.classList.remove('drag-over');
        
        if (!editMode || !draggedItem) return;
        
        var isFav = el.classList.contains('fav-card');
        var targetId = parseInt(el.getAttribute('data-id'));
        var targetCatId = isFav ? null : parseInt(el.getAttribute('data-cat-id'));
        
        if (draggedItem.type === 'favorite' && isFav) {
          reorderFavorites(root.Data.state, draggedItem.id, targetId);
        } else if (draggedItem.type === 'link' && !isFav && draggedItem.catId === targetCatId) {
          reorderLinks(root.Data.state, targetCatId, draggedItem.id, targetId);
        }
        draggedItem = null;
      });
    });

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
      
      var internalData = e.dataTransfer.getData('text/plain');
      if (!internalData || internalData.indexOf('{') !== 0) {
        var url = getExternalURL(e.dataTransfer);
        if (url) {
          root.Modal.openWithURL('favorite', url, null);
        }
      }
    });
  }

  // ====== Handler unificado ======
  function handleInternalDrop(e, targetZone, targetCatId) {
    var state = root.Data.state;
    
    if (targetZone === 'favorites') {
      if (draggedItem.type === 'link') {
        moveLinkToFavorites(state, draggedItem.catId, draggedItem.id);
      }
    }
    
    if (targetZone === 'category' && targetCatId) {
      if (draggedItem.type === 'favorite') {
        moveFavoriteToCategory(state, draggedItem.id, targetCatId);
      }
      if (draggedItem.type === 'link' && draggedItem.catId !== targetCatId) {
        moveLinkBetweenCategories(state, draggedItem.catId, draggedItem.id, targetCatId);
      }
    }
  }

  root.DragDrop = {
    init: initDragDrop,
    setEditMode: setEditMode,
    getExternalURL: getExternalURL,
    getAutoIconURL: getAutoIconURL
  };

})(typeof window !== 'undefined' ? window : this);
