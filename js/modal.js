/*!
 * js/modal.js — Modal de edición
 * v2 — Campo icon_url personalizado
 */
(function (root) {
  'use strict';
  var LOG = '[LaGuarida:Modal]';

  var modalContext = null;
  var downloadedIconData = null;

  function $(sel) { return document.querySelector(sel); }

  function openModal(type, id, catId) {
    modalContext = { type: type, id: id, catId: catId };
    downloadedIconData = null;
    var modal = $('#modal');
    var title = $('#modalTitle');
    var nameInput = $('#modalName');
    var urlInput = $('#modalUrl');
    var emojiInput = $('#modalEmoji');
    var iconUrlInput = $('#modalIconUrl');
    var urlField = $('#modalUrlField');

    urlField.style.display = '';

    if (type === 'favorite') {
      title.textContent = id ? '✏️ Editar favorito' : '⭐ Agregar favorito';
      var fav = id ? root.Data.state.favorites.find(function(f) { return f.id === id; }) : null;
      nameInput.value = fav ? fav.name : '';
      urlInput.value = fav ? fav.url : '';
      emojiInput.value = fav ? (fav.emoji || '') : '';
      iconUrlInput.value = fav ? (fav.icon_url || '') : '';
    } else if (type === 'category') {
      title.textContent = id ? '✏️ Editar categoría' : '📁 Agregar categoría';
      var cat = id ? root.Data.state.categories.find(function(c) { return c.id === id; }) : null;
      nameInput.value = cat ? cat.name : '';
      urlInput.value = '';
      urlField.style.display = 'none';
      emojiInput.value = cat ? (cat.emoji || '') : '';
      iconUrlInput.value = '';
    } else if (type === 'link') {
      title.textContent = id ? '✏️ Editar link' : '🔗 Agregar link';
      var cat2 = root.Data.state.categories.find(function(c) { return c.id === catId; });
      var link = id && cat2 ? cat2.links.find(function(l) { return l.id === id; }) : null;
      nameInput.value = link ? link.name : '';
      urlInput.value = link ? link.url : '';
      emojiInput.value = link ? (link.emoji || '') : '';
      iconUrlInput.value = link ? (link.icon_url || '') : '';
    }

    modal.hidden = false;
  }

  function openWithURL(type, url, catId) {
    var name = extractNameFromURL(url);
    
    modalContext = { type: type, id: null, catId: catId };
    downloadedIconData = null;
    var modal = $('#modal');
    var title = $('#modalTitle');
    var nameInput = $('#modalName');
    var urlInput = $('#modalUrl');
    var emojiInput = $('#modalEmoji');
    var iconUrlInput = $('#modalIconUrl');
    var urlField = $('#modalUrlField');
    
    urlField.style.display = '';
    
    if (type === 'favorite') {
      title.textContent = '⭐ Agregar favorito desde Firefox';
    } else {
      title.textContent = '🔗 Agregar link desde Firefox';
    }
    
    nameInput.value = name;
    urlInput.value = url;
    emojiInput.value = '';
    iconUrlInput.value = '';
    
    modal.hidden = false;
  }

  function extractNameFromURL(url) {
    try {
      var u = new URL(url);
      var hostname = u.hostname.replace(/^www\./, '');
      var parts = hostname.split('.');
      var name = parts[0];
      return name.charAt(0).toUpperCase() + name.slice(1);
    } catch(e) {
      return 'Nuevo link';
    }
  }

  function closeModal() {
    $('#modal').hidden = true;
  }

  function saveModal() {
    var name = $('#modalName').value.trim();
    var url = $('#modalUrl').value.trim();
    var emoji = $('#modalEmoji').value.trim();
    var iconUrl = $('#modalIconUrl').value.trim();

    if (!name) { alert('El nombre es obligatorio'); return; }

    var ctx = modalContext;
    var state = root.Data.state;

    if (ctx.type === 'favorite') {
      if (!url) { alert('La URL es obligatoria'); return; }
      if (ctx.id) {
        var fav = state.favorites.find(function(f) { return f.id === ctx.id; });
        if (fav) { fav.name = name; fav.url = url; fav.emoji = emoji; fav.icon_url = iconUrl; fav.icon_data = downloadedIconData || fav.icon_data || ''; }
      } else {
        var autoIcon = iconUrl || (root.Data.getDomain(url) ? 'https://icon.horse/icon/' + root.Data.getDomain(url) : '');
        state.favorites.push({ id: root.Data.genId(), name: name, url: url, emoji: emoji, icon_url: autoIcon, icon_data: downloadedIconData || '' });
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
          if (link) { link.name = name; link.url = url; link.emoji = emoji; link.icon_url = iconUrl; link.icon_data = downloadedIconData || (iconUrl ? '' : (link.icon_data || '')); }
        } else {
          var autoIcon = iconUrl || (root.Data.getDomain(url) ? 'https://icon.horse/icon/' + root.Data.getDomain(url) : '');
          cat2.links.push({ id: root.Data.genId(), name: name, url: url, emoji: emoji, icon_url: autoIcon, icon_data: downloadedIconData || '' });
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
    var downloadBtn = $('#modalDownloadFaviconBtn');
    if (downloadBtn) downloadBtn.addEventListener('click', downloadFavicon);
    $('#modal').addEventListener('click', function(e) { if (e.target === this) closeModal(); });
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeModal(); });
  }

  async function downloadFavicon() {
    var url = $('#modalUrl').value.trim();
    if (!url) { alert('Primero ingresá la URL'); return; }
    
    var btn = $('#modalDownloadFaviconBtn');
    if (btn) { btn.textContent = '⏳ Buscando...'; btn.disabled = true; }
    
    var domain = root.Data.getDomain(url);
    var candidates = [];
    
    if (domain) {
      candidates.push('https://icon.horse/icon/' + domain);
      candidates.push('https://www.google.com/s2/favicons?domain=' + domain + '&sz=256');
      candidates.push('https://' + domain + '/favicon.ico');
      candidates.push('https://' + domain + '/favicon.png');
    }
    
    for (var i = 0; i < candidates.length; i++) {
      try {
        var res = await fetch(candidates[i], { mode: 'cors' });
        if (res.ok) {
          var blob = await res.blob();
          var reader = new FileReader();
          reader.readAsDataURL(blob);
          var result = await new Promise(function(resolve) {
            reader.onload = function() { resolve(reader.result); };
          });
          
          downloadedIconData = result;
          if (btn) { btn.textContent = '✅ Favicon descargado'; btn.disabled = false; }
          return;
        }
      } catch(e) {}
    }
    
    downloadedIconData = null;
    if (btn) { btn.textContent = '❌ No se pudo descargar'; btn.disabled = false; }
  }

  root.Modal = {
    open: openModal,
    openWithURL: openWithURL,
    close: closeModal,
    wire: wireModal
  };

})(typeof window !== 'undefined' ? window : this);
