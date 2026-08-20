/*!
 * js/modal.js — Modal de edición
 */
(function (root) {
  'use strict';
  var LOG = '[LaGuarida:Modal]';

  var modalContext = null;

  function $(sel) { return document.querySelector(sel); }

  function openModal(type, id, catId) {
    modalContext = { type: type, id: id, catId: catId };
    var modal = $('#modal');
    var title = $('#modalTitle');
    var nameInput = $('#modalName');
    var urlInput = $('#modalUrl');
    var emojiInput = $('#modalEmoji');
    var urlField = $('#modalUrlField');

    urlField.style.display = '';

    if (type === 'favorite') {
      title.textContent = id ? '✏️ Editar favorito' : '⭐ Agregar favorito';
      var fav = id ? root.Data.state.favorites.find(function(f) { return f.id === id; }) : null;
      nameInput.value = fav ? fav.name : '';
      urlInput.value = fav ? fav.url : '';
      emojiInput.value = fav ? (fav.emoji || '') : '';
    } else if (type === 'category') {
      title.textContent = id ? '✏️ Editar categoría' : '📁 Agregar categoría';
      var cat = id ? root.Data.state.categories.find(function(c) { return c.id === id; }) : null;
      nameInput.value = cat ? cat.name : '';
      urlInput.value = '';
      urlField.style.display = 'none';
      emojiInput.value = cat ? (cat.emoji || '') : '';
    } else if (type === 'link') {
      title.textContent = id ? '✏️ Editar link' : '🔗 Agregar link';
      var cat2 = root.Data.state.categories.find(function(c) { return c.id === catId; });
      var link = id && cat2 ? cat2.links.find(function(l) { return l.id === id; }) : null;
      nameInput.value = link ? link.name : '';
      urlInput.value = link ? link.url : '';
      emojiInput.value = link ? (link.emoji || '') : '';
    }

    modal.hidden = false;
  }

  function closeModal() {
    $('#modal').hidden = true;
  }

  function saveModal() {
    var name = $('#modalName').value.trim();
    var url = $('#modalUrl').value.trim();
    var emoji = $('#modalEmoji').value.trim();

    if (!name) { alert('El nombre es obligatorio'); return; }

    var ctx = modalContext;
    var state = root.Data.state;

    if (ctx.type === 'favorite') {
      if (!url) { alert('La URL es obligatoria'); return; }
      if (ctx.id) {
        var fav = state.favorites.find(function(f) { return f.id === ctx.id; });
        if (fav) { fav.name = name; fav.url = url; fav.emoji = emoji; }
      } else {
        state.favorites.push({ id: root.Data.genId(), name: name, url: url, emoji: emoji });
      }
    } else if (ctx.type === 'category') {
      if (ctx.id) {
        var cat = state.categories.find(function(c) { return c.id === ctx.id; });
        if (cat) { cat.name = name; cat.emoji = emoji; }
      } else {
        state.categories.push({ id: root.Data.genId(), name: name, emoji: emoji, links: [] });
      }
    } else if (ctx.type === 'link') {
      if (!url) { alert('La URL es obligatoria'); return; }
      var cat2 = state.categories.find(function(c) { return c.id === ctx.catId; });
      if (cat2) {
        if (ctx.id) {
          var link = cat2.links.find(function(l) { return l.id === ctx.id; });
          if (link) { link.name = name; link.url = url; link.emoji = emoji; }
        } else {
          cat2.links.push({ id: root.Data.genId(), name: name, url: url, emoji: emoji });
        }
      }
    }

    root.Data.save();
    if (root.App && typeof root.App.render === 'function') root.App.render();
    closeModal();
  }

  function wireModal() {
    $('#modalCancel').addEventListener('click', closeModal);
    $('#modalSave').addEventListener('click', saveModal);
    $('#modal').addEventListener('click', function(e) { if (e.target === this) closeModal(); });
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeModal(); });
  }

  root.Modal = {
    open: openModal,
    close: closeModal,
    wire: wireModal
  };

})(typeof window !== 'undefined' ? window : this);
