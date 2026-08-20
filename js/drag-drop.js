/*!
 * js/drag-drop.js — Lógica de drag & drop
 */
(function (root) {
  'use strict';
  var LOG = '[LaGuarida:DragDrop]';

  var editMode = false;

  function setEditMode(on) { editMode = on; }

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
      console.warn(LOG, 'Error en drop:', err);
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

  function initDragDrop() {
    var favGrid = document.getElementById('favoritesGrid');
    if (!favGrid) return;

    favGrid.addEventListener('dragover', function(e) { e.preventDefault(); favGrid.classList.add('drag-over'); });
    favGrid.addEventListener('dragleave', function() { favGrid.classList.remove('drag-over'); });
    favGrid.addEventListener('drop', function(e) {
      e.preventDefault();
      favGrid.classList.remove('drag-over');
      handleDrop(e, 'favorites');
    });

    document.querySelectorAll('.category-card').forEach(function(catCard) {
      var catId = parseInt(catCard.getAttribute('data-id'));
      catCard.addEventListener('dragover', function(e) { e.preventDefault(); catCard.classList.add('drag-over'); });
      catCard.addEventListener('dragleave', function() { catCard.classList.remove('drag-over'); });
      catCard.addEventListener('drop', function(e) {
        e.preventDefault();
        catCard.classList.remove('drag-over');
        handleDrop(e, 'category', catId);
      });
    });

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
  }

  root.DragDrop = {
    init: initDragDrop,
    setEditMode: setEditMode,
    handleDrop: handleDrop
  };

})(typeof window !== 'undefined' ? window : this);
