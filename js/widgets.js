/* ====== La Guarida — Estilos (v2 — Look & Feel Bóveda) ====== */
* { margin:0; padding:0; box-sizing:border-box; }

body {
  background:#0e0e10; color:#e9e9ee;
  font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;
  line-height:1.42; padding:40px 20px;
  min-height:100vh;
}

.container {
  max-width:1400px; margin:0 auto;
  display:flex; flex-direction:column; gap:24px;
  width:100%;
}

/* ====== Header ====== */
.header {
  text-align:center; padding:30px 20px;
  background:#141418; border-radius:24px;
  border:1px solid #1d1d20;
  box-shadow:0 0 0 1px #1d1d20 inset,0 8px 24px rgba(0,0,0,0.3);
}
.header h1 {
  font-size:1.8rem; color:#ffffff;
  display:flex; align-items:center; justify-content:center; gap:10px; flex-wrap:wrap;
}
.header h1 .gold { color:#ffd966; }
.toolbar {
  display:flex; gap:8px; justify-content:center; flex-wrap:wrap; margin-top:16px;
}
.btn {
  padding:8px 16px; border-radius:8px;
  border:1px solid #2a2a2f; background:#1c1c20;
  color:#e9e9ee; font-size:0.8rem; font-weight:600;
  cursor:pointer; transition:box-shadow .18s ease,transform .18s ease;
  display:inline-flex; align-items:center; gap:6px;
}
.btn:hover {
  background:#24242a;
  box-shadow:0 0 0 1px #3b1e1e,0 4px 12px rgba(208,71,71,.35);
  transform:translateY(-1px);
}
.btn--gold { border-color:#ffd966; color:#ffd966; }
.btn--gold:hover { background:#ffd96620; border-color:#ffd966; }

/* ====== Secciones ====== */
.section-title {
  font-size:1.1rem; color:#e9e9ee; margin:0;
  display:flex; align-items:center; gap:8px;
  font-weight:600;
}

/* ====== Favoritos ====== */
.favorites-grid {
  display:grid; grid-template-columns:repeat(9, 1fr);
  gap:12px;
}
.fav-card {
  background:#15151a; border:1px solid #242428; border-radius:10px;
  padding:16px 8px; text-align:center; text-decoration:none;
  display:flex; flex-direction:column; align-items:center; gap:8px;
  transition:box-shadow .18s ease,transform .18s ease,border-color .18s ease;
  position:relative; box-shadow:0 0 0 1px #1d1d20 inset;
}
.fav-card:hover {
  transform:translateY(-2px);
  border-color:#334155;
  box-shadow:0 0 0 1px #3b1e1e,0 4px 12px rgba(208,71,71,.35);
}
.fav-card .fav-icon {
  width:40px; height:40px; border-radius:8px; object-fit:contain;
}
.fav-card .fav-emoji {
  font-size:28px; line-height:1;
}
.fav-card .fav-name {
  font-size:0.7rem; color:#d6d6db; font-weight:600;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:100%;
}

/* ====== Categorías ====== */
.categories-grid {
  display:grid; grid-template-columns:repeat(3, 1fr);
  gap:16px;
}
.category-card {
  background:#15151a; border:1px solid #242428; border-radius:10px;
  padding:16px; position:relative;
  box-shadow:0 0 0 1px #1d1d20 inset;
  transition:box-shadow .18s ease,border-color .18s ease;
}
.category-card:hover {
  border-color:#2a2a2f;
}
.category-header {
  display:flex; align-items:center; justify-content:space-between;
  margin-bottom:12px;
}
.category-title {
  font-size:0.9rem; font-weight:700; color:#e9e9ee;
  display:flex; align-items:center; gap:8px;
}
.category-links {
  display:flex; flex-direction:column; gap:6px;
}
.category-link {
  display:flex; align-items:center; gap:10px;
  padding:8px 10px; background:#0f0f12;
  border:1px solid #242428; border-radius:8px;
  text-decoration:none;
  transition:box-shadow .18s ease,transform .18s ease,border-color .18s ease;
  position:relative;
}
.category-link:hover {
  background:#111114;
  border-color:#334155;
  transform:translateX(2px);
}
.category-link .link-icon {
  width:20px; height:20px; border-radius:4px; object-fit:contain;
}
.category-link .link-emoji {
  font-size:16px; line-height:1;
}
.category-link .link-name {
  font-size:0.8rem; color:#d6d6db; font-weight:500;
  flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}

/* ====== Modo edición ====== */
.edit-actions {
  display:none; position:absolute; top:4px; right:4px; gap:4px;
}
.edit-mode .edit-actions { display:flex; }
.edit-actions button {
  width:20px; height:20px; border-radius:50%;
  border:none; font-size:0.6rem; cursor:pointer;
  display:flex; align-items:center; justify-content:center;
}
.edit-actions .edit-btn { background:#1c1c20; color:#ffd966; }
.edit-actions .del-btn { background:#1c1c20; color:#ff9d9d; }

.add-btn {
  display:flex; align-items:center; gap:6px;
  padding:8px 16px; border-radius:20px;
  border:1px dashed #2a2a2f; background:transparent;
  color:#a0a0a6; font-size:0.75rem; cursor:pointer;
  transition:box-shadow .18s ease,border-color .18s ease;
  width:100%; justify-content:center;
}
.add-btn:hover { border-color:#44546b; color:#c8c8ce; }

/* ====== Drag & Drop ====== */
.fav-card.dragging,
.category-link.dragging,
.category-card.dragging {
  opacity: 0.4;
  transform: scale(0.95);
}
.drag-over {
  border-color: #ffd966 !important;
  box-shadow: 0 0 16px rgba(255,217,102,0.35) !important;
  transform: scale(1.03);
}
.edit-mode .fav-card,
.edit-mode .category-link {
  cursor: grab;
}
.edit-mode .fav-card:active,
.edit-mode .category-link:active {
  cursor: grabbing;
}

/* ====== Modal ====== */
.modal {
  position:fixed; inset:0; z-index:10000;
}
.modal[hidden] { display:none !important; }
.modal__backdrop {
  position:absolute; inset:0;
  background:rgba(0,0,0,0.55);
  backdrop-filter:blur(2px);
}
.modal__dialog {
  position:absolute; left:50%; top:50%;
  transform:translate(-50%,-50%);
  width:min(420px, calc(100vw - 28px));
  max-height:calc(100vh - 28px);
  overflow:auto;
  background:#141418;
  border:1px solid #242428;
  border-radius:12px;
  box-shadow:0 10px 28px rgba(0,0,0,0.5);
  padding:0;
  outline:none;
}
.modal-card {
  background:#141418;
  padding:24px;
  width:100%;
}
.modal-card h3 {
  color:#e9e9ee; margin-bottom:16px; font-size:1.1rem;
  font-weight:600;
}
.field { margin-bottom:12px; }
.field label {
  display:block; font-size:0.75rem; color:#a0a0a6; margin-bottom:4px;
  text-transform:uppercase; letter-spacing:0.5px;
}
.field input {
  width:100%; padding:8px 12px; border-radius:8px;
  border:1px solid #242428; background:#0f0f12;
  color:#e9e9ee; font-size:0.85rem;
  transition:border-color .15s ease, box-shadow .15s ease;
}
.field input:focus {
  outline:none;
  border-color:#334155;
  box-shadow:0 0 0 1px rgba(255,255,255,0.08);
}
.modal-actions { display:flex; gap:8px; justify-content:flex-end; margin-top:16px; }

@media (max-width:600px) {
  .container { padding:16px; gap:16px; }
  .favorites-grid { grid-template-columns:repeat(auto-fill, minmax(80px, 1fr)); }
  .categories-grid { grid-template-columns:1fr; }
}

/* ====== Drop externo (Firefox) ====== */
body.drop-external-active .container {
  outline: 3px dashed #ffd966;
  outline-offset: 8px;
  animation: pulse-drop 1.5s infinite;
}
body.drop-external-active .favorites-grid,
body.drop-external-active .categories-grid {
  border: 2px dashed rgba(255,217,102,0.5);
  border-radius: 12px;
}
@keyframes pulse-drop {
  0%, 100% { outline-color: #ffd966; }
  50% { outline-color: rgba(255,217,102,0.4); }
}

/* ====== Layout ultrawide ====== */
.layout-row {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
}
.side-panel {
  width: 220px;
  min-width: 220px;
  max-width: 220px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-shrink: 0;
}
.side-panel--left { order: 0; }
.side-panel--right { order: 2; }
.main-content {
  order: 1;
  width: 900px;
  min-width: 900px;
  max-width: 900px;
  flex-shrink: 0;
}
@media (max-width: 1200px) {
  .side-panel { display: none; }
}
@media (max-width: 900px) {
  .favorites-grid { grid-template-columns:repeat(auto-fill, minmax(80px, 1fr)); }
  .categories-grid { grid-template-columns:repeat(auto-fill, minmax(240px, 1fr)); }
}

/* ====== Widgets ====== */
.widget {
  background:#15151a;
  border:1px solid #242428;
  border-radius:10px;
  padding:16px;
  text-align:center;
  box-shadow:0 0 0 1px #1d1d20 inset;
  transition:box-shadow .18s ease,transform .18s ease,border-color .18s ease;
}
.widget:hover {
  transform:translateY(-2px);
  border-color:#334155;
  box-shadow:0 0 0 1px #3b1e1e,0 4px 12px rgba(208,71,71,.35);
}
.widget--clock { border-left: 3px solid #7bc2ff; }
.widget--resets { border-left: 3px solid #ffd36b; }
.widget--notes { border-left: 3px solid #a0ffc8; }
.widget--counter { border-left: 3px solid #b19cd9; }
.widget--news { border-left: 3px solid #ff9d9d; }
.widget--twitch { border-left: 3px solid #9146FF; }
.widget--youtube { border-left: 3px solid #FF0000; }
.widget--greeting { border-left: 3px solid #ffd966; }

.widget-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: #ffd966;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.widget-clock-time {
  font-size: 2rem;
  font-weight: 700;
  color: #e9e9ee;
  font-variant-numeric: tabular-nums;
}
.widget-clock-date {
  font-size: 0.75rem;
  color: #a0a0a6;
  margin-top: 4px;
}

.widget-greeting-text {
  font-size: 0.9rem;
  color: #d6d6db;
}

.widget-notes-input {
  width: 100%;
  min-height: 100px;
  background: #0f0f12;
  border: 1px solid #242428;
  border-radius: 8px;
  padding: 8px;
  color: #e9e9ee;
  font-size: 0.8rem;
  font-family: inherit;
  resize: vertical;
}

.widget-counter-days {
  font-size: 2.5rem;
  font-weight: 700;
  color: #7bc2ff;
  font-variant-numeric: tabular-nums;
}
.widget-counter-label {
  font-size: 0.7rem;
  color: #a0a0a6;
  margin-top: 4px;
}
.widget-counter-date {
  font-size: 0.7rem;
  color: #a0a0a6;
  margin-top: 4px;
}
.widget-counter-empty {
  color: #a0a0a6;
  font-size: 0.8rem;
}

.add-widget-btn {
  width: 100%;
  padding: 8px;
  border: 1px dashed #2a2a2f;
  border-radius: 8px;
  background: transparent;
  color: #a0a0a6;
  font-size: 0.75rem;
  cursor: pointer;
  transition:border-color .18s ease,color .18s ease;
}
.add-widget-btn:hover {
  border-color: #44546b;
  color: #c8c8ce;
}

/* ====== Widgets Reset ====== */
.widget-resets-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.widget-reset-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
}
.reset-label {
  color: #a0a0a6;
  font-weight: 600;
}
.reset-value {
  color: #7bc2ff;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

/* ====== Widget News ====== */
.widget-news-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.widget-news-item {
  font-size: 0.75rem;
  color: #d6d6db;
  text-decoration: none;
  padding: 6px 8px;
  background: #0f0f12;
  border: 1px solid #242428;
  border-radius: 6px;
  transition:border-color .18s ease,color .18s ease,background .18s ease;
  text-align: left;
}
.widget-news-item:hover {
  background: #111114;
  border-color: #334155;
  color: #7bc2ff;
}
.widget-news-empty,
.widget-news-placeholder {
  font-size: 0.75rem;
  color: #a0a0a6;
  text-align: center;
  padding: 8px;
}

/* ====== Widget Twitch ====== */
.widget-twitch-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: #e9e9ee;
}
.widget-twitch-followers {
  font-size: 1.2rem;
  font-weight: 700;
  color: #9146FF;
  margin-top: 4px;
  font-variant-numeric: tabular-nums;
}
.widget-twitch-live {
  font-size: 0.8rem;
  font-weight: 600;
  color: #ff4d4d;
  margin-top: 6px;
}
.widget-twitch-offline {
  font-size: 0.8rem;
  font-weight: 600;
  color: #a0a0a6;
  margin-top: 6px;
}
.widget-twitch-placeholder {
  font-size: 0.75rem;
  color: #a0a0a6;
  text-align: center;
  padding: 8px;
}

/* ====== Widget YouTube ====== */
.widget-youtube-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: #e9e9ee;
}
.widget-youtube-subs {
  font-size: 1.2rem;
  font-weight: 700;
  color: #FF0000;
  margin-top: 4px;
  font-variant-numeric: tabular-nums;
}
.widget-youtube-views {
  font-size: 0.8rem;
  color: #a0a0a6;
  margin-top: 4px;
}
.widget-youtube-video {
  display: block;
  font-size: 0.75rem;
  color: #d6d6db;
  text-decoration: none;
  padding: 6px 8px;
  background: #0f0f12;
  border: 1px solid #242428;
  border-radius: 6px;
  margin-top: 8px;
  transition:border-color .18s ease,color .18s ease,background .18s ease;
}
.widget-youtube-video:hover {
  color: #FF0000;
  border-color: #FF0000;
  background: #111114;
}
.widget-youtube-video-stats {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 6px;
  font-size: 0.7rem;
  color: #a0a0a6;
}
.widget-youtube-placeholder {
  font-size: 0.75rem;
  color: #a0a0a6;
  text-align: center;
  padding: 8px;
}