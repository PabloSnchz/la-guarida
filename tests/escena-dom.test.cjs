// Tests del cableado de js/escena.js (BL-091 ESC-2) con un DOM falso mínimo: el consejo
// pasa a mi globo con Gato Negro y vuelve a la franja con otro theme, el plegado se recuerda
// y un consejo nuevo abre el globo (ESC-2); el gato reacciona a guardar, al backup y a los
// avisos, y en el buscador estoy de cuerpo entero (ESC-3); la bienvenida del día (ESC-4);
// ESC-5: la pose del buscador aparece recién cuando el recorte (canvas falso) está listo.
// Sin dependencias: corre con node --test.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const vm = require('vm');

const observers = [];
class MO {
  constructor(cb) { this.cb = cb; }
  observe(node, opts) { observers.push({ mo: this, node, opts }); }
}
function notify(target, type, attr, added) {
  const hits = new Set();
  for (const o of observers) {
    let ok = false;
    if (type === 'childList' && o.opts.childList && o.node === target) ok = true;
    if (type === 'attributes' && o.opts.attributes && (!o.opts.attributeFilter || o.opts.attributeFilter.includes(attr))) {
      if (o.node === target) ok = true;
      else if (o.opts.subtree) { for (let p = target.parentNode; p; p = p.parentNode) if (p === o.node) { ok = true; break; } }
    }
    if (ok) hits.add(o.mo);
  }
  pending.push(...[...hits].map(m => () => m.cb([{ target, type, attributeName: attr, addedNodes: added || [] }])));
}
let pending = [];
function flush() { let n = 0; while (pending.length) { const q = pending; pending = []; q.forEach(f => f()); if (++n > 50) throw new Error('bucle de observers'); } return n; }

class El {
  constructor(tag) { this.tagName = tag.toUpperCase(); this.children = []; this.parentNode = null; this.attrs = {}; this._cls = new Set(); this._text = ''; this.listeners = {}; this.style = {}; this.offsetWidth = 1; }
  get classList() { const s = this._cls; return { add: c => s.add(c), remove: c => s.delete(c), contains: c => s.has(c), toggle: (c, f) => { const v = f === undefined ? !s.has(c) : !!f; v ? s.add(c) : s.delete(c); return v; } }; }
  set className(v) { this._cls = new Set(String(v).split(/\s+/).filter(Boolean)); }
  get className() { return [...this._cls].join(' '); }
  get id() { return this.attrs.id || ''; }
  get hidden() { return 'hidden' in this.attrs; }
  set hidden(v) { if (v) this.attrs.hidden = ''; else delete this.attrs.hidden; notify(this, 'attributes', 'hidden'); }
  setAttribute(k, v) { if (k === 'class') this.className = v; else this.attrs[k] = String(v); notify(this, 'attributes', k); }
  getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; }
  removeChild(c) { this.children.splice(this.children.indexOf(c), 1); c.parentNode = null; notify(this, 'childList'); return c; }
  appendChild(c) { if (c.parentNode) { const p = c.parentNode; p.children.splice(p.children.indexOf(c), 1); notify(p, 'childList'); } c.parentNode = this; this.children.push(c); notify(this, 'childList', null, [c]); return c; }
  insertBefore(c, ref) { this.appendChild(c); const i = this.children.indexOf(ref); this.children.splice(this.children.indexOf(c), 1); this.children.splice(i, 0, c); return c; }
  closest(sel) { for (let n = this; n && n.matches; n = n.parentNode) if (n.matches(sel)) return n; return null; }
  get value() { return this.attrs.value || ''; }
  set value(v) { this.attrs.value = v; }
  set alt(v) { this.attrs.alt = v; }
  set width(v) { this.attrs.width = v; }
  set height(v) { this.attrs.height = v; }
  dispatch(t) { (this.listeners[t] || []).forEach(f => f({ target: this })); }
  addEventListener(t, f) { (this.listeners[t] = this.listeners[t] || []).push(f); }
  click() { (this.listeners.click || []).forEach(f => f({ target: this })); }
  get textContent() { return this._text + this.children.map(c => c.textContent).join(''); }
  set textContent(v) { this._text = String(v); this.children = []; }
  set innerHTML(h) {
    // Solo lo que usa escena.js: chispas y el globo.
    this.children = []; this._text = '';
    const stack = [this];
    const voids = new Set(['img', 'i']);
    const tokens = h.split(/(<[^>]+>)/).filter(Boolean);
    for (const t of tokens) {
      const open = /^<(\w+)([^>]*)>$/.exec(t), close = /^<\/(\w+)>$/.exec(t);
      if (open) {
        const e = new El(open[1]);
        for (const a of open[2].matchAll(/([\w-]+)="([^"]*)"/g)) { if (a[1] === 'class') e.className = a[2]; else e.attrs[a[1]] = a[2]; }
        stack[stack.length - 1].children.push(e); e.parentNode = stack[stack.length - 1];
        if (!voids.has(open[1]) || open[1] === 'i') { if (open[1] !== 'img') stack.push(e); }
      } else if (close) { stack.pop(); }
      else stack[stack.length - 1]._text += t;
    }
  }
  get innerHTML() { return ''; }
  set src(v) { this.attrs.src = v; }
  get src() { return this.attrs.src; }
  set title(v) { this.attrs.title = v; }
  matches(sel) {
    return sel.split(',').some(s => {
      s = s.trim();
      const m = /^(\w+)?((?:[.#][\w-]+)*)$/.exec(s);
      if (!m) return false;
      if (m[1] && m[1].toUpperCase() !== this.tagName) return false;
      for (const p of m[2].match(/[.#][\w-]+/g) || []) {
        if (p[0] === '.' && !this._cls.has(p.slice(1))) return false;
        if (p[0] === '#' && this.id !== p.slice(1)) return false;
      }
      return true;
    });
  }
  querySelectorAll(sel) {
    const parts = sel.trim().split(/\s+/);
    const out = [];
    const walk = (n, anc) => { for (const c of n.children) { if (c.matches(parts[parts.length - 1])) { let i = parts.length - 2, p = c.parentNode; while (i >= 0 && p) { if (p.matches(parts[i])) i--; p = p.parentNode; } if (i < 0) out.push(c); } walk(c); } };
    walk(this);
    return out;
  }
  querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
}

const html = new El('html');
const body = html.appendChild(new El('body'));
const tip = body.appendChild(new El('div')); tip.attrs.id = 'ghTip'; tip.className = 'gh-tip';
const doc = { readyState: 'complete', body, createElement: t => new El(t), querySelector: s => html.querySelector(s), querySelectorAll: s => html.querySelectorAll(s), addEventListener() {} };
const store = {};
const win = { document: doc, MutationObserver: MO, localStorage: { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); } } };
win.window = win;
body.setAttribute('data-theme', 'gato');
pending = [];

const code = fs.readFileSync(require('path').join(__dirname, '..', 'js', 'escena.js'), 'utf8');

test('globo: consejo, theme, plegado y gato', () => {
vm.runInNewContext(code, { window: win, setTimeout: (f, t) => { const x = setTimeout(f, t); x.unref(); return x; }, clearTimeout, JSON, Date, Math, String });
flush();

const globo = doc.querySelector('.esc-globo');
assert.ok(globo, 'hay globo');
assert.ok(doc.querySelector('.esc-chispas'), 'hay chispas');
assert.equal(globo.classList.contains('is-plegado'), false, 'la primera vez, abierto');
assert.match(globo.querySelector('.esc-texto').textContent, /, Pablo\.$/, 'sin header.js: solo el saludo');

// shiruvana.js crea el consejo en <body>; header.js lo pasa a #ghTip
const toast = new El('div'); toast.className = 'gn-toast'; toast.hidden = true;
body.appendChild(toast); toast.textContent = 'Tu último backup es de hace 40 días.'; toast.hidden = false;
tip.appendChild(toast);
flush();
assert.equal(toast.parentNode, globo.querySelector('.esc-slot'), 'con Gato Negro el consejo está en mi globo');
assert.ok(globo.classList.contains('con-consejo'));

// Plego a mano y se guarda
globo.querySelector('.esc-plegar').click(); flush();
assert.ok(globo.classList.contains('is-plegado'));
assert.equal(JSON.parse(store['guarida:escena:v1']).plegado, true);
assert.equal(globo.querySelector('.esc-plegar').getAttribute('aria-expanded'), 'false');

// Cambio a otro theme: vuelve a la franja
body.setAttribute('data-theme', 'nord'); flush();
assert.equal(toast.parentNode, tip, 'con otro theme, a la franja');
// Y de vuelta
body.setAttribute('data-theme', 'gato'); flush();
assert.equal(toast.parentNode, globo.querySelector('.esc-slot'));
assert.ok(globo.classList.contains('is-plegado'), 'no se reabre si el consejo ya estaba');

// «Ahora no»: shiruvana.js lo oculta y lo vacía
toast.hidden = true; toast.textContent = ''; flush();
assert.equal(globo.classList.contains('con-consejo'), false, 'sin consejo vuelve mi línea');

// Un consejo nuevo abre el globo, sin pisar lo guardado
toast.textContent = 'La categoría «X» está vacía.'; toast.hidden = false; flush();
assert.ok(globo.classList.contains('con-consejo'));
assert.equal(globo.classList.contains('is-plegado'), false, 'el consejo lo abre');
assert.equal(JSON.parse(store['guarida:escena:v1']).plegado, true, 'lo guardado sigue');

// El gato
const gb = globo.querySelector('.esc-gato');
gb.click();
assert.equal(globo.querySelector('.esc-gato-dice').textContent, 'Prrr… bip.');
assert.match(gb.querySelector('img').src, /gato-festeja\.webp$/);
for (let i = 0; i < 4; i++) gb.click();
assert.equal(globo.querySelector('.esc-gato-dice').textContent, 'Basta, que estoy trabajando.');

// Recarga con plegado guardado: arranca plegado
const html2 = new El('html'); const body2 = html2.appendChild(new El('body'));
const doc2 = { readyState: 'complete', body: body2, createElement: t => new El(t), querySelector: s => html2.querySelector(s), querySelectorAll: s => html2.querySelectorAll(s), addEventListener() {} };
body2.setAttribute('data-theme', 'gato');
vm.runInNewContext(code, { window: { document: doc2, MutationObserver: MO, localStorage: win.localStorage }, setTimeout: (f, t) => { const x = setTimeout(f, t); x.unref(); return x; }, clearTimeout, JSON, Date, Math, String });
flush();
assert.ok(doc2.querySelector('.esc-globo').classList.contains('is-plegado'), 'recuerda el plegado');
});

test('ESC-3: el gato reacciona y yo en el buscador', async () => {
  const html3 = new El('html'); const body3 = html3.appendChild(new El('body'));
  body3.appendChild(new El('div')).attrs.id = 'ghTip';
  const modal = body3.appendChild(new El('div')); modal.attrs.id = 'modal'; modal.hidden = true;
  const save = modal.appendChild(new El('button')); save.attrs.id = 'modalSave';
  const exp = body3.appendChild(new El('button')); exp.attrs.id = 'exportBtn';
  const docL = [];
  // ESC-5: canvas e Image falsos; el recorte devuelve 'blob:<url de la pose>'
  let dibujos = 0;
  const canvas = () => { const c = new El('canvas'); c.getContext = () => ({ drawImage: im => { c.u = im.u; dibujos++; },
    getImageData: (x, y, w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }), putImageData() {} });
    c.toBlob = cb => cb({ u: c.u }); return c; };
  class Img { set src(v) { this.u = v; this.naturalWidth = 4; this.naturalHeight = 4; Promise.resolve().then(() => this.onload()); } }
  const doc3 = { readyState: 'complete', body: body3, createElement: t => (t === 'canvas' ? canvas() : new El(t)), querySelector: s => html3.querySelector(s), querySelectorAll: s => html3.querySelectorAll(s),
    addEventListener: (t, f, cap) => { if (t === 'click') docL.push(f); } };
  const listo = () => new Promise(r => setImmediate(r));
  const clic = el => docL.forEach(f => f({ target: el }));
  const later = [];
  const st = (f, t) => { if (t === 0) { later.push(f); return 0; } const x = setTimeout(f, t); x.unref(); return x; };
  body3.setAttribute('data-theme', 'gato');
  vm.runInNewContext(code, { window: { document: doc3, MutationObserver: MO, localStorage: { getItem: () => null, setItem() {} }, Image: Img, URL: { createObjectURL: b => 'blob:' + b.u } }, setTimeout: st, clearTimeout, JSON, Date, Math, String, Array, Object });
  flush();
  const g = doc3.querySelector('.esc-globo');
  const dice = () => g.querySelector('.esc-gato-dice').textContent;
  const pose = () => g.querySelector('.esc-gato img').src;
  const correr = () => { while (later.length) later.shift()(); flush(); };

  // Guardar con un error de validación: el editor sigue abierto, el gato no festeja
  modal.hidden = false; flush();
  clic(save); correr();
  assert.equal(dice(), '', 'no festeja si no se guardó');
  // Guardar de verdad: app.js cierra el editor
  clic(save); modal.hidden = true; correr();
  assert.equal(dice(), '¡Guardado!');
  assert.match(pose(), /gato-festeja\.webp$/);

  clic(exp); correr();
  assert.equal(dice(), 'Backup a salvo.');

  // Avisos del kit: la región se crea la primera vez que hace falta
  const region = body3.appendChild(new El('div')); region.className = 'gk-toasts'; flush();
  const aviso = k => { const a = new El('div'); a.className = 'gk-toast gk-toast--' + k; region.appendChild(a); flush(); };
  aviso('warn');
  assert.equal(dice(), 'Ojo con eso.');
  assert.match(pose(), /gato-camina\.webp$/);
  aviso('ok');
  assert.equal(dice(), '¡Bip!');
  g.querySelector('.esc-gato-dice').textContent = '';
  aviso('info');
  assert.equal(dice(), '', 'los borrados con «Deshacer» no se festejan');
  // Si la región se vuelve a agregar, la escucho una sola vez
  body3.appendChild(region); flush();
  assert.equal(observers.filter(o => o.node === region).length, 1, 'un solo oyente en la región');

  // El buscador lo crea shiruvana.js la primera vez (y header.js le pone su retrato)
  const portal = new El('div'); portal.className = 'gn-portal'; portal.hidden = true;
  const ghFig = portal.appendChild(new El('img')); ghFig.className = 'gh-portal-fig';
  const dialog = portal.appendChild(new El('div')); dialog.className = 'gn-portal__dialog';
  const input = dialog.appendChild(new El('input')); input.attrs.id = 'gnPortalInput';
  body3.appendChild(portal); flush();
  const fig = portal.querySelector('.esc-portal-pose');
  assert.ok(fig, 'mi pose está en el buscador');
  assert.equal(portal.children.indexOf(fig), portal.children.indexOf(dialog) - 1, 'al costado, antes del cuadro');
  assert.equal(fig.hidden, true, 'ESC-5: escondida hasta que la pose no tenga fondo');
  assert.equal(fig.src, undefined, 'nunca el webp con fondo negro');
  await listo();
  assert.equal(fig.src, 'blob:assets/brand/shiruvana/cuerpo-saluda.webp');
  assert.equal(fig.hidden, false);
  portal.hidden = false; flush();
  input.value = 'bov'; input.dispatch('input');
  await listo();
  assert.equal(fig.src, 'blob:assets/brand/shiruvana/cuerpo-pensando.webp');
  input.value = ''; portal.hidden = true; flush(); portal.hidden = false; flush();
  await listo();
  assert.equal(fig.src, 'blob:assets/brand/shiruvana/cuerpo-saluda.webp', 'al reabrir vacío, saludo');
  assert.equal(dibujos, 2, 'cada pose se recorta una sola vez');
  // Si cambio de pose antes de que termine el recorte, gana la última
  input.value = 'x'; input.dispatch('input'); input.value = ''; input.dispatch('input');
  await listo();
  assert.equal(fig.src, 'blob:assets/brand/shiruvana/cuerpo-saluda.webp');
  // No se duplica si el buscador se vuelve a agregar
  body3.appendChild(portal); flush();
  assert.equal(portal.querySelectorAll('.esc-portal-pose').length, 1);
});

test('ESC-4: la bienvenida del día', () => {
  const guardado = {};
  const ls = { getItem: k => (k in guardado ? guardado[k] : null), setItem: (k, v) => { guardado[k] = String(v); } };
  function abrir(theme, reducido) {
    const h = new El('html'); const b = h.appendChild(new El('body'));
    const teclas = [];
    const d = { readyState: 'complete', body: b, createElement: t => new El(t), querySelector: s => h.querySelector(s), querySelectorAll: s => h.querySelectorAll(s),
      addEventListener: (t, f) => { if (t === 'keydown') teclas.push(f); },
      removeEventListener: (t, f) => { const i = teclas.indexOf(f); if (i >= 0) teclas.splice(i, 1); } };
    b.setAttribute('data-theme', theme);
    const timers = [];
    vm.runInNewContext(code, { window: { document: d, MutationObserver: MO, localStorage: ls, matchMedia: () => ({ matches: !!reducido }) },
      setTimeout: (f, t) => { timers.push({ f, t }); return timers.length; }, clearTimeout() {}, JSON, Date, Math, String, Array, Object });
    flush();
    return { d, b, teclas, timers };
  }

  // Otro theme o «reducir movimiento»: nada, y no la gasta
  assert.equal(abrir('nord').d.querySelector('.esc-bienvenida'), null);
  assert.equal(abrir('gato', true).d.querySelector('.esc-bienvenida'), null);
  assert.equal(guardado['guarida:escena:v1'], undefined, 'no la marca como vista');

  // La primera vez del día: aparece, con los ojos y el saludo
  const a = abrir('gato');
  const capa = a.d.querySelector('.esc-bienvenida');
  assert.ok(capa, 'aparece');
  assert.equal(capa.getAttribute('aria-hidden'), 'true');
  assert.equal(capa.querySelectorAll('.esc-ojos i').length, 2);
  assert.match(capa.textContent, /, Pablo/);
  const visto = JSON.parse(guardado['guarida:escena:v1']);
  assert.equal(visto.bienvenida, (() => { const n = new Date(); return n.getFullYear() + '-' + (n.getMonth() + 1) + '-' + n.getDate(); })());
  assert.ok(a.timers.some(t => t.t === 3200), 'se va sola');
  assert.equal(a.teclas.length, 1);
  // Una tecla la saca y suelta el oyente
  a.teclas[0]({ key: 'a' });
  assert.equal(a.d.querySelector('.esc-bienvenida'), null);
  assert.equal(a.teclas.length, 0);

  // El mismo día, no vuelve
  assert.equal(abrir('gato').d.querySelector('.esc-bienvenida'), null, 'una por día');

  // No pisa el plegado: plego, y la bienvenida de otro día lo conserva
  guardado['guarida:escena:v1'] = JSON.stringify({ plegado: true, bienvenida: '2000-1-1' });
  const c = abrir('gato');
  const capa2 = c.d.querySelector('.esc-bienvenida');
  assert.ok(capa2);
  assert.equal(JSON.parse(guardado['guarida:escena:v1']).plegado, true, 'el plegado sigue');
  assert.ok(c.d.querySelector('.esc-globo').classList.contains('is-plegado'));
  capa2.click();
  assert.equal(c.d.querySelector('.esc-bienvenida'), null, 'un toque la saca');
  assert.equal(c.teclas.length, 0);
});

test('ESC-5: sin canvas (o si el recorte falla) mi pose del buscador no aparece', async () => {
  const h = new El('html'); const b = h.appendChild(new El('body'));
  const d = { readyState: 'complete', body: b, createElement: t => new El(t), querySelector: s => h.querySelector(s), querySelectorAll: s => h.querySelectorAll(s), addEventListener() {} };
  b.setAttribute('data-theme', 'gato');
  vm.runInNewContext(code, { window: { document: d, MutationObserver: MO, localStorage: { getItem: () => null, setItem() {} } },
    setTimeout: (f, t) => { const x = setTimeout(f, t); x.unref(); return x; }, clearTimeout, JSON, Date, Math, String, Array, Object });
  flush();
  const portal = new El('div'); portal.className = 'gn-portal';
  const dialog = portal.appendChild(new El('div')); dialog.className = 'gn-portal__dialog';
  b.appendChild(portal); flush();
  await new Promise(r => setImmediate(r));
  const fig = portal.querySelector('.esc-portal-pose');
  assert.ok(fig);
  assert.equal(fig.hidden, true);
  assert.equal(fig.src, undefined);
});

test('ESC-5: las poses recortadas quedan en body como --esc-p-<pose> (solo con Gato Negro)', async () => {
  function abrir(theme) {
    const h = new El('html'); const b = h.appendChild(new El('body'));
    const props = {};
    b.style = { setProperty: (k, v) => { props[k] = v; } };
    const canvas = () => { const c = new El('canvas'); c.getContext = () => ({ drawImage: im => { c.u = im.u; }, getImageData: (x, y, w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }), putImageData() {} }); c.toBlob = cb => cb({ u: c.u }); return c; };
    class Img { set src(v) { this.u = v; this.width = 2; this.height = 2; Promise.resolve().then(() => this.onload()); } }
    const d = { readyState: 'complete', body: b, createElement: t => (t === 'canvas' ? canvas() : new El(t)), querySelector: s => h.querySelector(s), querySelectorAll: s => h.querySelectorAll(s), addEventListener() {}, removeEventListener() {} };
    b.setAttribute('data-theme', theme);
    const timers = [];
    vm.runInNewContext(code, { window: { document: d, MutationObserver: MO, localStorage: { getItem: () => null, setItem() {} }, Image: Img, URL: { createObjectURL: x => 'blob:' + x.u },
      setInterval: (f, t) => timers.push({ f, t, cada: true }) }, setTimeout: (f, t) => { timers.push({ f, t }); return timers.length; }, clearTimeout() {}, JSON, Date, Math, String, Array, Object });
    flush();
    return { b, props, timers };
  }
  const a = abrir('gato');
  assert.match(a.props['--esc-dia'], /^\d+(\.\d)?%$/, 'la barra del día');
  assert.ok(a.timers.some(t => t.cada && t.t === 60000), 'se actualiza cada minuto');
  a.timers.filter(t => !t.cada).forEach(t => t.f());
  await new Promise(r => setImmediate(r));
  for (const p of ['sentada', 'saluda', 'pensando']) {
    assert.equal(a.props['--esc-p-' + p], 'url("blob:assets/brand/shiruvana/cuerpo-' + p + '.webp")', p);
    assert.ok(a.b.classList.contains('esc-p-' + p), p);
  }
  assert.ok(a.b.classList.contains('esc-listo'), 'la entrada de las tarjetas se marca');
  const n = abrir('nord');
  n.timers.filter(t => !t.cada).forEach(t => t.f());
  await new Promise(r => setImmediate(r));
  assert.equal(n.props['--esc-p-saluda'], undefined, 'con otro theme no recorto nada');
  // Al pasar a Gato Negro, recorto
  n.b.setAttribute('data-theme', 'gato'); flush();
  await new Promise(r => setImmediate(r));
  assert.match(n.props['--esc-p-saluda'], /^url\("blob:/);
});

test('ESC-5: si una pose tarda más en recortarse, no pisa a la que pediste después', async () => {
  const h = new El('html'); const b = h.appendChild(new El('body'));
  const canvas = () => { const c = new El('canvas'); c.getContext = () => ({ drawImage: im => { c.u = im.u; }, getImageData: (x, y, w, hh) => ({ data: new Uint8ClampedArray(w * hh * 4) }), putImageData() {} }); c.toBlob = cb => cb({ u: c.u }); return c; };
  // La pose de saludo tarda (30 ms); la de pensar, no
  class Img { set src(v) { this.u = v; this.width = 2; this.height = 2; const go = () => this.onload(); if (/saluda/.test(v)) setTimeout(go, 30); else Promise.resolve().then(go); } }
  const d = { readyState: 'complete', body: b, createElement: t => (t === 'canvas' ? canvas() : new El(t)), querySelector: s => h.querySelector(s), querySelectorAll: s => h.querySelectorAll(s), addEventListener() {}, removeEventListener() {} };
  b.setAttribute('data-theme', 'gato');
  vm.runInNewContext(code, { window: { document: d, MutationObserver: MO, localStorage: { getItem: () => null, setItem() {} }, Image: Img, URL: { createObjectURL: x => 'blob:' + x.u } },
    setTimeout: (f, t) => { const x = setTimeout(f, t); x.unref && t > 100 && x.unref(); return x; }, clearTimeout, JSON, Date, Math, String, Array, Object });
  flush();
  const portal = new El('div'); portal.className = 'gn-portal';
  const dialog = portal.appendChild(new El('div')); dialog.className = 'gn-portal__dialog';
  const input = dialog.appendChild(new El('input')); input.attrs.id = 'gnPortalInput';
  b.appendChild(portal); flush();            // pide «saluda» (lenta)
  input.value = 'bov'; input.dispatch('input'); // pide «pensando» (rápida)
  await new Promise(r => setTimeout(r, 60));
  const fig = portal.querySelector('.esc-portal-pose');
  assert.equal(fig.getAttribute('data-pose'), 'pensando');
  assert.equal(fig.src, 'blob:assets/brand/shiruvana/cuerpo-pensando.webp', 'la lenta llegó tarde y no pisó');
});

test('ESC-6: el globo dice el último backup (texto de header.js) y la cabecera sigue el scroll', () => {
  const h = new El('html'); const b = h.appendChild(new El('body'));
  const d = { readyState: 'complete', body: b, createElement: t => new El(t), querySelector: s => h.querySelector(s), querySelectorAll: s => h.querySelectorAll(s), addEventListener() {}, removeEventListener() {} };
  b.setAttribute('data-theme', 'gato');
  const ls = { getItem: k => (k === 'guarida:shiruvana:v1' ? JSON.stringify({ lastBackup: 123 }) : null), setItem() {} };
  const oyentes = {};
  const w = { document: d, MutationObserver: MO, localStorage: ls, scrollY: 0,
    addEventListener: (t, f, o) => { oyentes[t] = { f, o }; },
    GuaridaHeader: { api: { backupText: (meta, now) => (meta.lastBackup === 123 && now > 0 ? 'Último backup: hace 3 días' : '??') } } };
  vm.runInNewContext(code, { window: w, setTimeout: () => 0, clearTimeout() {}, JSON, Date, Math, String, Array, Object });
  flush();
  assert.match(d.querySelector('.esc-texto').textContent, /, Pablo\. Último backup: hace 3 días\.$/);
  assert.equal(b.classList.contains('esc-bajo'), false, 'arriba de todo: sin fondo');
  assert.ok(oyentes.scroll && oyentes.scroll.o.passive, 'escucha el scroll sin frenar');
  w.scrollY = 300; oyentes.scroll.f();
  assert.equal(b.classList.contains('esc-bajo'), true);
  w.scrollY = 0; oyentes.scroll.f();
  assert.equal(b.classList.contains('esc-bajo'), false);
});
