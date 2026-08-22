/*!
 * js/widgets.js — Widgets editables para paneles laterales
 * v5 — Twitch + YouTube integrados
 */
(function (root) {
  'use strict';
  var LOG = '[LaGuarida:Widgets]';

  function $(sel) { return document.querySelector(sel); }

  var WIDGET_TYPES = {
    clock: { label: 'Reloj', icon: '🕐' },
    greeting: { label: 'Saludo', icon: '👋' },
    notes: { label: 'Notas', icon: '📝' },
    counter: { label: 'Contador', icon: '🔢' },
    all_resets: { label: 'Resets GW2', icon: '⏳' },
    gw2_news: { label: 'Noticias GW2', icon: '📰' },
    twitch: { label: 'Twitch', icon: '📺' },
    youtube: { label: 'YouTube', icon: '📊' }
  };

  function getWidgets() {
    var state = root.Data.state;
    if (!state.widgets_left) state.widgets_left = [];
    if (!state.widgets_right) state.widgets_right = [];
    return { left: state.widgets_left, right: state.widgets_right };
  }

  // ====== HELPERS DE TIEMPO ======
  function formatCountdown(ms) {
    if (!isFinite(ms) || ms <= 0) return '—';
    var seconds = Math.floor(ms / 1000);
    var days = Math.floor(seconds / 86400);
    seconds %= 86400;
    var hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    var minutes = Math.floor(seconds / 60);
    seconds %= 60;
    
    if (days > 0) return days + 'd ' + hours + 'h ' + minutes + 'm';
    if (hours > 0) return hours + 'h ' + minutes + 'm';
    if (minutes > 0) return minutes + 'm';
    return seconds + 's';
  }

  function nextDailyResetUTC() {
    var now = new Date();
    var next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 24, 0, 0, 0));
    if (next.getTime() <= now.getTime()) {
      next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0));
    }
    return next;
  }

  function nextWeeklyResetUTC() {
    var now = new Date();
    var day = now.getUTCDay();
    var daysUntilMonday = (1 - day + 7) % 7;
    var base = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 7, 30, 0, 0));
    var next = new Date(base.getTime() + daysUntilMonday * 24 * 60 * 60 * 1000);
    if (next.getTime() <= now.getTime()) next = new Date(next.getTime() + 7 * 24 * 60 * 60 * 1000);
    return next;
  }

  function getSeasonEnd() {
    return new Date('2026-09-15T16:00:00Z');
  }

  // ====== RENDER ======
  function renderClock(config) {
    var format = (config && config.format) || '24h';
    var showDate = config && config.showDate !== false;
    var now = new Date();
    var timeStr;
    if (format === '12h') {
      timeStr = now.toLocaleTimeString('es-AR', { hour: 'numeric', minute: '2-digit', hour12: true });
    } else {
      timeStr = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    }
    var dateStr = showDate ? now.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }) : '';
    
    return '<div class="widget widget--clock">' +
      '<div class="widget-title">🕐 Reloj</div>' +
      '<div class="widget-clock-time">' + timeStr + '</div>' +
      (dateStr ? '<div class="widget-clock-date">' + dateStr + '</div>' : '') +
      '</div>';
  }

  function renderGreeting(config) {
    var name = (config && config.name) || '';
    var hour = new Date().getHours();
    var saludo;
    if (hour < 6) saludo = 'Buenas noches';
    else if (hour < 12) saludo = 'Buenos días';
    else if (hour < 20) saludo = 'Buenas tardes';
    else saludo = 'Buenas noches';
    
    return '<div class="widget widget--greeting">' +
      '<div class="widget-title">👋 Saludo</div>' +
      '<div class="widget-greeting-text">' + saludo + (name ? ', <strong>' + root.Data.esc(name) + '</strong>' : '') + '</div>' +
      '</div>';
  }

  function renderAllResets() {
    var dailyMs = Math.max(0, nextDailyResetUTC().getTime() - Date.now());
    var weeklyMs = Math.max(0, nextWeeklyResetUTC().getTime() - Date.now());
    var seasonMs = Math.max(0, getSeasonEnd().getTime() - Date.now());
    
    return '<div class="widget widget--resets">' +
      '<div class="widget-title">⏳ Resets GW2</div>' +
      '<div class="widget-resets-list">' +
        '<div class="widget-reset-row"><span class="reset-label">Daily</span><span class="reset-value">' + formatCountdown(dailyMs) + '</span></div>' +
        '<div class="widget-reset-row"><span class="reset-label">Weekly</span><span class="reset-value">' + formatCountdown(weeklyMs) + '</span></div>' +
        '<div class="widget-reset-row"><span class="reset-label">Season</span><span class="reset-value">' + formatCountdown(seasonMs) + '</span></div>' +
      '</div>' +
      '</div>';
  }

  function renderNotes(config) {
    var text = (config && config.text) || '';
    return '<div class="widget widget--notes">' +
      '<div class="widget-title">📝 Notas</div>' +
      '<textarea class="widget-notes-input" placeholder="Escribí tus notas...">' + root.Data.esc(text) + '</textarea>' +
      '</div>';
  }

  function renderCounter(config) {
    var title = (config && config.title) || 'Cuenta regresiva';
    var targetDate = (config && config.date) || '';
    
    var content;
    if (!targetDate) {
      content = '<div class="widget-counter-empty">Click para configurar</div>';
    } else {
      var target = new Date(targetDate);
      var now = new Date();
      var diff = target - now;
      var days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
      content = '<div class="widget-counter-days">' + days + '</div>' +
                '<div class="widget-counter-label">días restantes</div>' +
                '<div class="widget-counter-date">' + target.toLocaleDateString('es-AR') + '</div>';
    }
    
    return '<div class="widget widget--counter" data-widget-type="counter" style="cursor:pointer;" title="Click para editar">' +
      '<div class="widget-title">🔢 ' + root.Data.esc(title) + '</div>' +
      content +
      '</div>';
  }

  // ====== NOTICIAS GW2 ======
  var newsCache = null;
  var newsLastFetch = 0;
  var NEWS_TTL = 10 * 60 * 1000;

  async function fetchGW2News() {
    var now = Date.now();
    if (newsCache && (now - newsLastFetch) < NEWS_TTL) return newsCache;
    
    try {
      var res = await fetch('https://www.guildwars2.com/es/feed/', { mode: 'cors' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      var text = await res.text();
      var parser = new DOMParser();
      var doc = parser.parseFromString(text, 'text/xml');
      var items = doc.querySelectorAll('item');
      
      newsCache = [];
      items.forEach(function(item, index) {
        if (index >= 4) return;
        var title = item.querySelector('title') ? item.querySelector('title').textContent : '';
        var link = item.querySelector('link') ? item.querySelector('link').textContent : '';
        newsCache.push({ title: title, link: link });
      });
      
      newsLastFetch = now;
      return newsCache;
    } catch(e) {
      console.warn(LOG, 'Error fetching GW2 news:', e);
      return [];
    }
  }

  // ====== TWITCH ======
  var twitchConfig = {
    clientId: 'jtirnfb54v6fz1i823rsidesn2ojo4',
    accessToken: 'msph7jsh5wthpeaf3me3cuwbc2sxh3',
    userId: '401539231',
    login: 'pblsnchz'
  };

  async function fetchTwitchFollowers() {
    try {
      var res = await fetch('https://api.twitch.tv/helix/channels/followers?broadcaster_id=' + twitchConfig.userId, {
        headers: { 'Client-ID': twitchConfig.clientId, 'Authorization': 'Bearer ' + twitchConfig.accessToken }
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      var data = await res.json();
      return data.total || 0;
    } catch(e) { return null; }
  }

  async function fetchTwitchStreamInfo() {
    try {
      var res = await fetch('https://api.twitch.tv/helix/streams?user_id=' + twitchConfig.userId, {
        headers: { 'Client-ID': twitchConfig.clientId, 'Authorization': 'Bearer ' + twitchConfig.accessToken }
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      var data = await res.json();
      if (data.data && data.data.length > 0) {
        var stream = data.data[0];
        return {
          isLive: true,
          gameName: stream.game_name || 'Desconocido',
          viewers: stream.viewer_count || 0,
          title: stream.title || '',
          startedAt: stream.started_at || null
        };
      }
      return { isLive: false };
    } catch(e) { return { isLive: false }; }
  }

  async function renderTwitch() {
    var followers = await fetchTwitchFollowers();
    var streamInfo = await fetchTwitchStreamInfo();
    
    var followersStr = followers !== null ? followers.toLocaleString('es-AR') : '—';
    
    var html = '<div class="widget-twitch-name">pblsnchz</div>' +
      '<div class="widget-twitch-followers">' + followersStr + ' seguidores</div>';
    
    if (streamInfo.isLive) {
      var startedStr = streamInfo.startedAt ? new Date(streamInfo.startedAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : '';
      html += '<div class="widget-twitch-live">🔴 EN VIVO</div>' +
        '<div class="widget-twitch-game">🎮 ' + root.Data.esc(streamInfo.gameName) + '</div>' +
        '<div class="widget-twitch-viewers">👁️ ' + streamInfo.viewers + ' viewers</div>' +
        (startedStr ? '<div class="widget-twitch-started">⏱️ Desde ' + startedStr + '</div>' : '');
    } else {
      html += '<div class="widget-twitch-offline">⚫ Offline</div>';
    }
    
    return html;
  }

  // ====== YOUTUBE ======
  var youtubeConfig = {
    apiKey: 'AIzaSyC_IRdWIwyzor5qeSao5mEqlI-S8OHKcso',
    channelId: 'UC4JTh35sJq644V0t7LfO76g'
  };

  async function fetchYouTubeChannel() {
    try {
      var res = await fetch('https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=' + youtubeConfig.channelId + '&key=' + youtubeConfig.apiKey);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      var data = await res.json();
      if (data.items && data.items.length) {
        return {
          title: data.items[0].snippet.title,
          subscribers: data.items[0].statistics.subscriberCount,
          videoCount: data.items[0].statistics.videoCount,
          viewCount: data.items[0].statistics.viewCount
        };
      }
      return null;
    } catch(e) { return null; }
  }

  async function fetchYouTubeLatestVideo() {
    try {
      var res = await fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=' + youtubeConfig.channelId + '&order=date&maxResults=1&type=video&key=' + youtubeConfig.apiKey);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      var data = await res.json();
      if (data.items && data.items.length) {
        var videoId = data.items[0].id.videoId;
        
        var statsRes = await fetch('https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=' + videoId + '&key=' + youtubeConfig.apiKey);
        var statsData = await statsRes.json();
        
        var stats = {};
        if (statsData.items && statsData.items.length) {
          stats = {
            views: statsData.items[0].statistics.viewCount,
            likes: statsData.items[0].statistics.likeCount,
            duration: statsData.items[0].contentDetails.duration
          };
        }
        
        return {
          title: data.items[0].snippet.title,
          videoId: videoId,
          publishedAt: data.items[0].snippet.publishedAt,
          stats: stats
        };
      }
      return null;
    } catch(e) { return null; }
  }

  function formatDuration(isoDuration) {
    var match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return '—';
    var hours = match[1] ? parseInt(match[1]) : 0;
    var minutes = match[2] ? parseInt(match[2]) : 0;
    var seconds = match[3] ? parseInt(match[3]) : 0;
    
    if (hours > 0) {
      return hours + ':' + String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
    }
    if (minutes > 0) {
      return minutes + ':' + String(seconds).padStart(2, '0');
    }
    return '0:' + String(seconds).padStart(2, '0');
  }

  async function renderYouTube() {
    var channel = await fetchYouTubeChannel();
    var latestVideo = await fetchYouTubeLatestVideo();
    
    var subsStr = channel ? parseInt(channel.subscribers).toLocaleString('es-AR') : '—';
    var viewsStr = channel ? parseInt(channel.viewCount).toLocaleString('es-AR') : '—';
    
    var html = '<div class="widget-youtube-name">Pablin Schez</div>' +
      '<div class="widget-youtube-subs">' + subsStr + ' suscriptores</div>' +
      '<div class="widget-youtube-views">👁️ ' + viewsStr + ' vistas totales</div>';
    
    if (latestVideo) {
      var videoViews = latestVideo.stats && latestVideo.stats.views ? parseInt(latestVideo.stats.views).toLocaleString('es-AR') : '—';
      var videoLikes = latestVideo.stats && latestVideo.stats.likes ? parseInt(latestVideo.stats.likes).toLocaleString('es-AR') : '—';
      var duration = latestVideo.stats && latestVideo.stats.duration ? formatDuration(latestVideo.stats.duration) : '—';
      
      html += '<a class="widget-youtube-video" href="https://youtube.com/watch?v=' + latestVideo.videoId + '" target="_blank" rel="noopener">' +
        '📹 ' + root.Data.esc(latestVideo.title) + '</a>' +
        '<div class="widget-youtube-video-stats">' +
          '<span>👁️ ' + videoViews + '</span>' +
          '<span>👍 ' + videoLikes + '</span>' +
          '<span>⏱️ ' + duration + '</span>' +
        '</div>';
    }
    
    return html;
  }

  function renderWidget(widget) {
    switch (widget.type) {
      case 'clock': return renderClock(widget.config);
      case 'greeting': return renderGreeting(widget.config);
      case 'notes': return renderNotes(widget.config);
      case 'counter': return renderCounter(widget.config);
      case 'all_resets': return renderAllResets();
      case 'gw2_news': return '<div class="widget widget--news"><div class="widget-title">📰 Noticias GW2</div><div class="widget-news-list"><div class="widget-news-placeholder">Cargando...</div></div></div>';
      case 'twitch': return '<div class="widget widget--twitch"><div class="widget-title">📺 Twitch</div><div class="widget-twitch-placeholder">Cargando...</div></div>';
      case 'youtube': return '<div class="widget widget--youtube"><div class="widget-title">📊 YouTube</div><div class="widget-youtube-placeholder">Cargando...</div></div>';
      default: return '';
    }
  }

  function renderSidePanel(containerId, widgets) {
    var container = document.getElementById(containerId);
    if (!container) return;
    
    var html = widgets.map(function(widget) {
      return renderWidget(widget);
    }).join('');
    
    html += '<button class="add-widget-btn" data-side="' + containerId + '">＋ Widget</button>';
    
    container.innerHTML = html;
    
    // Cargar noticias async
    container.querySelectorAll('.widget-news-placeholder').forEach(function(placeholder) {
      var listDiv = placeholder.closest('.widget-news-list');
      fetchGW2News().then(function(news) {
        var newsHTML = news.length ? news.map(function(item) {
          return '<a class="widget-news-item" href="' + root.Data.esc(item.link) + '" target="_blank" rel="noopener">' + root.Data.esc(item.title) + '</a>';
        }).join('') : '<div class="widget-news-empty">No se pudieron cargar noticias</div>';
        if (listDiv) listDiv.innerHTML = newsHTML;
      });
    });
    
    // Cargar Twitch async
    container.querySelectorAll('.widget-twitch-placeholder').forEach(function(placeholder) {
      renderTwitch().then(function(html) {
        var widgetCard = placeholder.closest('.widget--twitch');
        if (widgetCard) widgetCard.innerHTML = '<div class="widget-title">📺 Twitch</div>' + html;
      });
    });
    
    // Cargar YouTube async
    container.querySelectorAll('.widget-youtube-placeholder').forEach(function(placeholder) {
      renderYouTube().then(function(html) {
        var widgetCard = placeholder.closest('.widget--youtube');
        if (widgetCard) widgetCard.innerHTML = '<div class="widget-title">📊 YouTube</div>' + html;
      });
    });
  }

  function renderAll() {
    var widgets = getWidgets();
    
    renderSidePanel('widgetsLeft', widgets.left);
    renderSidePanel('widgetsRight', widgets.right);
    
    // Wire textareas
    document.querySelectorAll('.widget-notes-input').forEach(function(textarea) {
      textarea.addEventListener('input', function() {
        var text = this.value;
        var state = root.Data.state;
        var side = this.closest('.side-panel');
        var sideId = side ? side.id : '';
        var widgetList = sideId === 'widgetsLeft' ? state.widgets_left : state.widgets_right;
        widgetList.forEach(function(w) {
          if (w.type === 'notes') {
            if (!w.config) w.config = {};
            w.config.text = text;
          }
        });
        root.Data.save();
      });
    });
    
    // Wire contador editable
    document.querySelectorAll('[data-widget-type="counter"]').forEach(function(el) {
      el.addEventListener('click', function() { editCounterWidget(this); });
    });
    
    // Wire botones + Widget
    document.querySelectorAll('.add-widget-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        showWidgetPicker(btn.getAttribute('data-side'));
      });
    });
    
    // Actualizar reloj y resets cada segundo
    setTimeout(function tick() {
      document.querySelectorAll('.widget--clock').forEach(function(clockEl) {
        var now = new Date();
        var timeEl = clockEl.querySelector('.widget-clock-time');
        if (timeEl) timeEl.textContent = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
      });
      
      document.querySelectorAll('.widget--resets').forEach(function(resetEl) {
        var dailyMs = Math.max(0, nextDailyResetUTC().getTime() - Date.now());
        var weeklyMs = Math.max(0, nextWeeklyResetUTC().getTime() - Date.now());
        var seasonMs = Math.max(0, getSeasonEnd().getTime() - Date.now());
        var values = resetEl.querySelectorAll('.reset-value');
        if (values.length >= 3) {
          values[0].textContent = formatCountdown(dailyMs);
          values[1].textContent = formatCountdown(weeklyMs);
          values[2].textContent = formatCountdown(seasonMs);
        }
      });
      
      setTimeout(tick, 1000);
    }, 1000);
  }

  function editCounterWidget(element) {
    var state = root.Data.state;
    var sideId = element.closest('.side-panel').id;
    var widgetList = sideId === 'widgetsLeft' ? state.widgets_left : state.widgets_right;
    
    var widget = null;
    widgetList.forEach(function(w) { if (w.type === 'counter') widget = w; });
    if (!widget) return;
    
    var config = widget.config || {};
    var title = prompt('Título del evento:', config.title || 'Cuenta regresiva');
    if (title === null) return;
    var dateStr = prompt('Fecha (YYYY-MM-DD):', config.date || '');
    if (dateStr === null) return;
    
    widget.config = { title: title, date: dateStr };
    root.Data.save();
    renderAll();
  }

  function showWidgetPicker(side) {
    var types = Object.keys(WIDGET_TYPES);
    var options = types.map(function(type, index) {
      return (index + 1) + '. ' + WIDGET_TYPES[type].label;
    }).join('\n');
    
    var choice = prompt('Elegí un widget (número):\n\n' + options);
    if (!choice) return;
    
    var index = parseInt(choice, 10) - 1;
    if (isNaN(index) || index < 0 || index >= types.length) return;
    
    var selectedType = types[index];
    var state = root.Data.state;
    var widgetList;
    
    if (side === 'widgetsLeft') {
      if (!state.widgets_left) state.widgets_left = [];
      widgetList = state.widgets_left;
    } else {
      if (!state.widgets_right) state.widgets_right = [];
      widgetList = state.widgets_right;
    }
    
    var config = {};
    if (selectedType === 'counter') config = { title: 'Cuenta regresiva', date: '' };
    if (selectedType === 'notes') config = { text: '' };
    if (selectedType === 'clock') config = { format: '24h', showDate: true };
    if (selectedType === 'greeting') config = { name: '' };
    
    widgetList.push({ type: selectedType, position: widgetList.length, config: config });
    
    root.Data.save();
    renderAll();
  }

  root.Widgets = {
    renderAll: renderAll,
    WIDGET_TYPES: WIDGET_TYPES,
    showWidgetPicker: showWidgetPicker
  };

})(typeof window !== 'undefined' ? window : this);