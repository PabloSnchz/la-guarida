# 🐈‍⬛ La Guarida

Página de inicio personal del Gato Negro — organizá tus enlaces frecuentes, favoritos y categorías en un dashboard editable con drag & drop, widgets en tiempo real, favicons inteligentes y persistencia local. Diseñada para monitores ultrawide con paneles laterales configurables.

## ✨ Características

### Organización
- ⭐ Favoritos con acceso rápido (9 por fila en ultrawide)
- 📁 Categorías personalizables (3 por fila)
- 🔀 Drag & drop para reordenar y mover entre secciones
- 🦊 Arrastrar desde Firefox para crear links automáticamente
- 🌐 Abrir links en Chrome obligatoriamente (protocol handler)

### Favicons inteligentes
- 🔗 Auto-detección al pegar URL
- 🔍 Botón "Auto-detectar favicon" (busca en HTML del sitio + Icon Horse + Google)
- 📥 Botón "Descargar como base64" para guardar localmente
- 🎨 Emoji manual como override
- 🖼️ URL de ícono personalizado
- 🔄 Sistema de fallback: icon_url → icon_data → emoji → automático → genérico

### Widgets en paneles laterales
| Widget | Panel | Descripción |
|--------|-------|-------------|
| 🕐 Reloj | Izquierdo | Hora local + fecha |
| ⏳ Resets GW2 | Izquierdo | Daily, Weekly y Season en un solo widget compacto |
| 📰 Noticias GW2 | Izquierdo | 4 últimos titulares del feed oficial |
| 📝 Notas | Derecho | Texto editable con guardado automático |
| 🔢 Contador | Derecho | Editable — click para configurar título y fecha |
| 📺 Twitch | Derecho | Seguidores + estado en vivo (juego, viewers) |
| 📊 YouTube | Derecho | Suscriptores + vistas totales + último video |

### Persistencia
- 💾 localStorage con guardado automático
- 📂 Exportar/Importar JSON
- 🔄 Migración automática de datos viejos

## 🚀 Demo

🔗 [Ver en vivo](https://pablosnchz.github.io/la-guarida/)

## 📁 Estructura

| Archivo | Descripción |
|---------|-------------|
| `index.html` | Estructura HTML con layout ultrawide |
| `css/styles.css` | Estilos (misma piel que la Bóveda) |
| `js/data.js` | Estado, persistencia y favicons |
| `js/widgets.js` | Widgets: reloj, resets, noticias, Twitch, YouTube |
| `js/drag-drop.js` | Drag & drop interno + externo |
| `js/modal.js` | Modal de edición + auto-detección |
| `js/app.js` | Init, render y eventos |
| `docs/chrome-open.bat` | Script para abrir links en Chrome (backup) |

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

### Widgets
- Click en "＋ Widget" para agregar
- Elegí el widget del menú
- **Contador editable**: Click en el widget → ingresá título y fecha (YYYY-MM-DD)
- **Notas**: Escribí directamente en el textarea — se guarda solo

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

## 🌐 Abrir en Chrome obligatoriamente

Permite marcar links para que se abran SIEMPRE en Google Chrome, sin importar el navegador que estés usando.

### Cómo funciona
1. En el modal de edición, marcá "Abrir en Chrome obligatoriamente"
2. El link muestra un badge 🌐
3. Al clickear, Windows ejecuta el protocol handler `chrome-launch:`
4. El script `chrome-open.bat` limpia la URL y la abre en Chrome

### Configuración (una sola vez)
1. Copiá `docs/chrome-open.bat` a `C:\Users\TU_USUARIO\chrome-open.bat`
2. Ejecutá el `.reg` para registrar el protocol handler:
   - `HKEY_CLASSES_ROOT\chrome-launch\shell\open\command` → `C:\Users\TU_USUARIO\chrome-open.bat %1`
3. Listo — los links marcados se abren en Chrome

## 🔌 APIs integradas

| Servicio | Uso | Credenciales |
|----------|-----|--------------|
| Twitch Helix | Seguidores + estado en vivo | Client ID + Access Token |
| YouTube Data v3 | Suscriptores + último video | API Key |
| GW2 RSS | Noticias oficiales | No requiere |

## 🖥️ Diseño ultrawide

En monitores de 34" (3440px):
- Panel izquierdo: 220px (reloj, resets, noticias)
- Panel central: 900px (favoritos 9 por fila, categorías 3 por fila)
- Panel derecho: 220px (notas, contador, Twitch, YouTube)

En pantallas < 1200px, los paneles laterales se ocultan automáticamente.

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
