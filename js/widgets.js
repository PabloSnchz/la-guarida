/*!
 * js/widgets.js — Widgets editables para paneles laterales
 */
(function (root) {
  'use strict';
  var LOG = '[LaGuarida:Widgets]';

  function $(sel) { return document.querySelector(sel); }

  var WIDGET_TYPES = {
    clock: { label: '🕐 Reloj', icon: '🕐' },
    greeting: { label: '👋 Saludo', icon: '👋' },
    notes: { label: '📝 Notas', icon: '📝' },
    counter: { label: '🔢 Contador', icon: '🔢' }
  };

  function getWidgets() {
    var state = root.Data.state;
    if (!state.widgets_left) state.widgets_left = [];
    if (!state.widgets_right) state.widgets_right = [];
    return { left: state.widgets_left, right: state.widgets_right };
  }

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
      '<div class="widget-title">🕐</div>' +
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
      '<div class="widget-greeting-text">' + saludo + (name ? ', <strong>' + root.Data.esc(name) + '</strong>' : '') + '</div>' +
      '</div>';
  }

  function renderNotes(config) {
    var text = (config && config.text) || '';
    return '<div class="widget widget--notes">' +
      '<div class="widget-title">📝 Notas</div>' +
      '<textarea class="widget-notes-input" placeholder="Escribí tus notas..." data-widget="notes">' + root.Data.esc(text) + '</textarea>' +
      '</div>';
  }

  function renderCounter(config) {
    var title = (config && config.title) || 'Cuenta regresiva';
    var targetDate = (config && config.date) || '';
    
    if (!targetDate) {
      return '<div class="widget widget--counter">' +
        '<div class="widget-title">🔢 ' + root.Data.esc(title) + '</div>' +
        '<div class="widget-counter-empty">Sin fecha</div>' +
        '</div>';
    }
    
    var target = new Date(targetDate);
    var now = new Date();
    var diff = target - now;
    
    var days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    return '<div class="widget widget--counter">' +
      '<div class="widget-title">🔢 ' + root.Data.esc(title) + '</div>' +
      '<div class="widget-counter-days">' + days + '</div>' +
      '<div class="widget-counter-label">días restantes</div>' +
      '</div>';
  }

  function renderWidget(widget) {
    switch (widget.type) {
      case 'clock': return renderClock(widget.config);
      case 'greeting': return renderGreeting(widget.config);
      case 'notes': return renderNotes(widget.config);
      case 'counter': return renderCounter(widget.config);
      default: return '';
    }
  }

  function renderSidePanel(containerId, widgets) {
    var container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = widgets.map(function(widget) {
      return renderWidget(widget);
    }).join('') + '<button class="add-widget-btn" data-side="' + containerId + '">＋ Widget</button>';
  }

  function renderAll() {
    var widgets = getWidgets();
    renderSidePanel('widgetsLeft', widgets.left);
    renderSidePanel('widgetsRight', widgets.right);
    
    // Wire textarea de notas
    document.querySelectorAll('.widget-notes-input').forEach(function(textarea) {
      textarea.addEventListener('input', function() {
        var text = this.value;
        var state = root.Data.state;
        // Buscar el widget de notas y actualizar
        state.widgets_left.forEach(function(w) {
          if (w.type === 'notes') {
            if (!w.config) w.config = {};
            w.config.text = text;
          }
        });
        state.widgets_right.forEach(function(w) {
          if (w.type === 'notes') {
            if (!w.config) w.config = {};
            w.config.text = text;
          }
        });
        root.Data.save();
      });
    });
    
    // Wire add widget buttons
    document.querySelectorAll('.add-widget-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var side = this.getAttribute('data-side');
        showWidgetPicker(side);
      });
    });
    
    // Update clock each second
    if (document.querySelector('.widget--clock')) {
      setTimeout(function() { renderAll(); }, 1000);
    }
  }

  function showWidgetPicker(side) {
    var types = Object.keys(WIDGET_TYPES);
    var options = types.map(function(type) {
      return WIDGET_TYPES[type].icon + ' ' + WIDGET_TYPES[type].label;
    }).join('\n');
    
    var choice = prompt('Elegí un widget:\n' + options);
    if (!choice) return;
    
    // Encontrar el tipo
    var selectedType = null;
    types.forEach(function(type) {
      if (choice.indexOf(WIDGET_TYPES[type].icon) !== -1 || choice.indexOf(WIDGET_TYPES[type].label) !== -1) {
        selectedType = type;
      }
    });
    
    if (!selectedType) return;
    
    var state = root.Data.state;
    if (side === 'widgetsLeft') {
      if (!state.widgets_left) state.widgets_left = [];
      state.widgets_left.push({ type: selectedType, position: state.widgets_left.length, config: {} });
    } else {
      if (!state.widgets_right) state.widgets_right = [];
      state.widgets_right.push({ type: selectedType, position: state.widgets_right.length, config: {} });
    }
    
    root.Data.save();
    renderAll();
  }

  root.Widgets = {
    renderAll: renderAll,
    WIDGET_TYPES: WIDGET_TYPES
  };

})(typeof window !== 'undefined' ? window : this);
