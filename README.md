# 🐈‍⬛ La Guarida

Página de inicio personal del Gato Negro — organizá tus enlaces frecuentes, favoritos y categorías en un dashboard editable con drag & drop, favicons inteligentes y persistencia local.

## ✨ Características

### Organización
- ⭐ Favoritos con acceso rápido
- 📁 Categorías personalizables (agregar, editar, eliminar)
- 🔀 Drag & drop para reordenar y mover entre secciones
- 🦊 Arrastrar desde Firefox para crear links automáticamente

### Favicons inteligentes
- 🔗 Auto-detección al pegar URL
- 🔍 Botón "Auto-detectar favicon" (busca en HTML del sitio + Icon Horse + Google)
- 📥 Botón "Descargar como base64" para guardar localmente
- 🎨 Emoji manual como override
- 🖼️ URL de ícono personalizado
- 🔄 Sistema de fallback: icon_url → icon_data → emoji → automático → genérico

### Persistencia
- 💾 localStorage con guardado automático
- 📂 Exportar/Importar JSON
- 🔄 Migración automática de datos viejos

## 🚀 Demo

🔗 [Ver en vivo](https://pablosnchz.github.io/la-guarida/)

## 📁 Estructura

| Archivo | Descripción |
|---------|-------------|
| `index.html` | Estructura HTML |
| `css/styles.css` | Estilos (misma piel que la Bóveda) |
| `js/data.js` | Estado, persistencia y favicons |
| `js/drag-drop.js` | Drag & drop interno + externo |
| `js/modal.js` | Modal de edición + auto-detección |
| `js/app.js` | Init, render y eventos |

## 🔧 Cómo usar

### Agregar links
1. Click en "✏️ Modo edición"
2. "⭐ Agregar favorito" o "+ Link" en una categoría
3. Pegá la URL → el favicon se detecta automáticamente
4. Si no carga, usá "🔍 Auto-detectar" o poné emoji manual
5. Guardar

### Drag & drop
- **Reordenar**: Arrastrá un link sobre otro en la misma sección
- **Mover a categoría**: Arrastrá favorito → categoría
- **Mover a favoritos**: Arrastrá link de categoría → favoritos
- **Desde Firefox**: Arrastrá el favicon de una pestaña → soltalo en La Guarida

### Favicons problemáticos
| Situación | Solución |
|-----------|----------|
| Favicon no carga | Click "🔍 Auto-detectar" |
| Sigue fallando | Click "📥 Descargar como base64" |
| Preferís emoji | Poné emoji en el campo correspondiente |
| URL específica | Pegá la URL del ícono |

## 🎨 Prioridad de favicons

| Prioridad | Fuente |
|-----------|--------|
| 1 | URL de ícono manual |
| 2 | Base64 descargado |
| 3 | Emoji manual |
| 4 | Auto-detección (Icon Horse → Google → DuckDuckGo) |
| 5 | 🔗 genérico |

## 🐈‍⬛ Ecosistema

| Proyecto | Enlace |
|----------|--------|
| Bóveda del Gato Negro | [WebApp GW2](https://pablosnchz.github.io/gw2-wallet-ligero/) |
| Link in Bio | [Bio](https://pablosnchz.github.io/bio/) |
| Métricas GA4 | [Dashboard](https://pablosnchz.github.io/gw2-metrics-dashboard/) |
| Traffic Stats | [Histórico](https://pablosnchz.github.io/github-repo-traffic-stats/) |

## 📜 Licencia

MIT

---

Desarrollado con 🐈‍⬛ por [PabloSnchz](https://github.com/PabloSnchz)
