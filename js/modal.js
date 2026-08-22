/*!
 * js/modal.js — Modal de edición
 * v4 — Soporte open_chrome + auto-detectar favicon + base64
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
    var openChromeInput = $('#modalOpenChrome');
    var urlField = $('#modalUrlField');
    var autoDetectBtn = $('#modalAutoDetectFaviconBtn');
    var downloadBtn = $('#modalDownloadFaviconBtn');

    urlField.style.display = '';
    if (autoDetectBtn) autoDetectBtn.textContent = '🔍 Auto-detectar favicon';
    if (autoDetectBtn) autoDetectBtn.disabled = false;
    if (downloadBtn) downloadBtn.textContent = '📥 Descargar como base64';
    if (downloadBtn) downloadBtn.disabled = false;

    if (type === 'favorite') {
      title.textContent = id ? '✏️ Editar favorito' : '⭐ Agregar favorito';
      var fav = id ? root.Data.state.favorites.find(function(f) { return f.id === id; }) : null;
      nameInput.value = fav ? fav.name : '';
      urlInput.value = fav ? fav.url : '';
      emojiInput.value = fav ? (fav.emoji || '') : '';
      iconUrlInput.value = fav ? (fav.icon_url || '') : '';
      if (openChromeInput) openChromeInput.checked = fav ? !!fav.open_chrome : false;
    } else if (type === 'category') {
      title.textContent = id ? '✏️ Editar categoría' : '📁 Agregar categoría';
      var cat = id ? root.Data.state.categories.find(function(c) { return c.id === id; }) : null;
      nameInput.value = cat ? cat.name : '';
      urlInput.value = '';
      urlField.style.display = 'none';
      emojiInput.value = cat ? (cat.emoji || '') : '';
      iconUrlInput.value = '';
      if (openChromeInput) openChromeInput.checked = false;
    } else if (type === 'link') {
      title.textContent = id ? '✏️ Editar link' : '🔗 Agregar link';
      var cat2 = root.Data.state.categories.find(function(c) { return c.id === catId; });
      var link = id && cat2 ? cat2.links.find(function(l) { return l.id === id; }) : null;
      nameInput.value = link ? link.name : '';
      urlInput.value = link ? link.url : '';
      emojiInput.value = link ? (link.emoji || '') : '';
      iconUrlInput.value = link ? (link.icon_url || '') : '';
      if (openChromeInput) openChromeInput.checked = link ? !!link.open_chrome : false;
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
    var openChromeInput = $('#modalOpenChrome');
    var urlField = $('#modalUrlField');
    var autoDetectBtn = $('#modalAutoDetectFaviconBtn');
    var downloadBtn = $('#modalDownloadFaviconBtn');
    
    urlField.style.display = '';
    if (autoDetectBtn) autoDetectBtn.textContent = '🔍 Auto-detectar favicon';
    if (autoDetectBtn) autoDetectBtn.disabled = false;
    if (downloadBtn) downloadBtn.textContent = '📥 Descargar como base64';
    if (downloadBtn) downloadBtn.disabled = false;
    
    if (type === 'favorite') {
      title.textContent = '⭐ Agregar favorito desde Firefox';
    } else {
      title.textContent = '🔗 Agregar link desde Firefox';
    }
    
    nameInput.value = name;
    urlInput.value = url;
    emojiInput.value = '';
    iconUrlInput.value = '';
    if (openChromeInput) openChromeInput.checked = false;
    
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
    var openChrome = $('#modalOpenChrome') ? $('#modalOpenChrome').checked : false;
    
    var finalIconData = iconUrl ? '' : (downloadedIconData || '');

    if (!name) { alert('El nombre es obligatorio'); return; }

    var ctx = modalContext;
    var state = root.Data.state;

    if (ctx.type === 'favorite') {
      if (!url) { alert('La URL es obligatoria'); return; }
      if (ctx.id) {
        var fav = state.favorites.find(function(f) { return f.id === ctx.id; });
        if (fav) { fav.name = name; fav.url = url; fav.emoji = emoji; fav.icon_url = iconUrl; fav.icon_data = finalIconData || (iconUrl ? '' : (fav.icon_data || '')); fav.open_chrome = openChrome; }
      } else {
        var autoIcon = iconUrl || (root.Data.getDomain(url) ? 'https://icon.horse/icon/' + root.Data.getDomain(url) : '');
        state.favorites.push({ id: root.Data.genId(), name: name, url: url, emoji: emoji, icon_url: autoIcon, icon_data: finalIconData, open_chrome: openChrome });
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
          if (link) { link.name = name; link.url = url; link.emoji = emoji; link.icon_url = iconUrl; link.icon_data = finalIconData || (iconUrl ? '' : (link.icon_data || '')); link.open_chrome = openChrome; }
        } else {
          var autoIcon = iconUrl || (root.Data.getDomain(url) ? 'https://icon.horse/icon/' + root.Data.getDomain(url) : '');
          cat2.links.push({ id: root.Data.genId(), name: name, url: url, emoji: emoji, icon_url: autoIcon, icon_data: finalIconData, open_chrome: openChrome });
        }
      }
    }

    root.Data.save();
    if (root.App && typeof root.App.render === 'function') root.App.render();
    closeModal();
  }

  // ====== Auto-detectar favicon ======
  async function autoDetectFavicon() {
    var url = $('#modalUrl').value.trim();
    if (!url) { alert('Primero ingresá la URL'); return; }
    
    var btn = $('#modalAutoDetectFaviconBtn');
    var iconUrlInput = $('#modalIconUrl');
    if (btn) { btn.textContent = '⏳ Buscando...'; btn.disabled = true; }
    
    var domain = root.Data.getDomain(url);
    
    try {
      var res = await fetch(url, { mode: 'cors' });
      if (res.ok) {
        var html = await res.text();
        var match = html.match(/<link[^>]*rel=["'](?:icon|shortcut icon|apple-touch-icon)["'][^>]*href=["']([^"']+)["']/i);
        if (match && match[1]) {
          var faviconUrl = match[1];
          if (faviconUrl.indexOf('http') !== 0) {
            faviconUrl = 'https://' + domain + (faviconUrl.indexOf('/') === 0 ? '' : '/') + faviconUrl;
          }
          iconUrlInput.value = faviconUrl;
          if (btn) { btn.textContent = '✅ Favicon encontrado'; btn.disabled = false; }
          return;
        }
      }
    } catch(e) {}
    
    if (domain) {
      try {
        var iconHorse = 'https://icon.horse/icon/' + domain;
        var res2 = await fetch(iconHorse, { mode: 'cors' });
        if (res2.ok) {
          iconUrlInput.value = iconHorse;
          if (btn) { btn.textContent = '✅ Favicon encontrado'; btn.disabled = false; }
          return;
        }
      } catch(e) {}
    }
    
    if (btn) { btn.textContent = '❌ No se encontró'; btn.disabled = false; }
  }

  // ====== Descargar base64 ======
  async function downloadFavicon() {
    var url = $('#modalUrl').value.trim();
    if (!url) { alert('Primero ingresá la URL'); return; }
    
    var btn = $('#modalDownloadFaviconBtn');
    if (btn) { btn.textContent = '⏳ Descargando...'; btn.disabled = true; }
    
    var domain = root.Data.getDomain(url);
    var candidates = [];
    
    if (domain) {
      candidates.push('https://icon.horse/icon/' + domain);
      candidates.push('https://www.google.com/s2/favicons?domain=' + domain + '&sz=256');
      candidates.push('https://' + domain + '/favicon.ico');
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
          if (btn) { btn.textContent = '✅ Base64 descargado'; btn.disabled = false; }
          return;
        }
      } catch(e) {}
    }
    
    downloadedIconData = null;
    if (btn) { btn.textContent = '❌ No se pudo descargar'; btn.disabled = false; }
  }

  function wireModal() {
    $('#modalCancel').addEventListener('click', closeModal);
    $('#modalSave').addEventListener('click', saveModal);
    var autoDetectBtn = $('#modalAutoDetectFaviconBtn');
    if (autoDetectBtn) autoDetectBtn.addEventListener('click', autoDetectFavicon);
    var downloadBtn = $('#modalDownloadFaviconBtn');
    if (downloadBtn) downloadBtn.addEventListener('click', downloadFavicon);
    $('#modal').addEventListener('click', function(e) { if (e.target === this) closeModal(); });
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeModal(); });
  }

  root.Modal = {
    open: openModal,
    openWithURL: openWithURL,
    close: closeModal,
    wire: wireModal
  };

})(typeof window !== 'undefined' ? window : this);