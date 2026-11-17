// Tests del cableado de js/escena.js (BL-091 ESC-2) con un DOM falso mínimo: el consejo
// pasa a mi globo con Gato Negro y vuelve a la franja con otro theme, el plegado se recuerda
// y un consejo nuevo abre el globo. Sin dependencias: corre con node --test.
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
function notify(target, type, attr) {
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
  pending.push(...[...hits].map(m => () => m.cb([{ target, type, attributeName: attr }])));
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
  appendChild(c) { if (c.parentNode) { const p = c.parentNode; p.children.splice(p.children.indexOf(c), 1); notify(p, 'childList'); } c.parentNode = this; this.children.push(c); notify(this, 'childList'); return c; }
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
assert.match(globo.querySelector('.esc-texto').textContent, /Pablo\. Ctrl K/);

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
assert.equal(store['guarida:escena:v1'], '{"plegado":true}');
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
assert.equal(store['guarida:escena:v1'], '{"plegado":true}', 'lo guardado sigue');

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
