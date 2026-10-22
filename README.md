# 🐈‍⬛ La Guarida

Página de inicio personal del Gato Negro — lanzador híbrido que combina links web, aplicaciones y juegos locales, widgets en tiempo real, 19 temas visuales y persistencia local. Diseñada para monitores ultrawide. Desde la versión 2.1 comparte con el Centro de decisiones el lenguaje visual del Gato Design System, pero sigue siendo solo un lanzador: no muestra datos de la Factory.

## ✨ Características

### Organización

- ⭐ Favoritos web con acceso rápido
- 📁 Categorías personalizables
- 🚀 Lanzador de aplicaciones y juegos locales
- 🔀 Drag and drop para reordenar
- 🦊 Arrastrar desde Firefox para crear links
- 🌐 Abrir links en Chrome obligatoriamente

### Shiruvana, tu anfitriona

- 🔎 **Portal «¿A dónde vamos?»**: barra en el resumen; también se abre con **Ctrl+K** o **/**. Busca en favoritos, enlaces, apps, juegos, atajos (Wiki, Foros, ANet Keys, La Bóveda, Centro de decisiones) y acciones (theme, modo edición, agregar, backup). Encuentra aunque escribas con errores o sin acentos; ↑ ↓ para moverse, Enter abre, Esc cierra.
- ⏱️ **Lo de siempre**: hasta 5 accesos que más abrís en esta franja del día (mañana, tarde o noche). Aparece con 10 aperturas o más.
- 🧹 **Consejos de orden**: un aviso abajo a la derecha, como mucho uno por día, sobre enlaces repetidos, categorías vacías o un backup viejo. Cada uno trae su botón para resolverlo y «Ahora no» lo silencia 30 días. Nunca aparece mientras editás.

### Sistema de temas

- 🐈‍⬛ Gato Negro (oficial, por defecto)
- 🏛️ Bóveda
- 🪟 Windows 11 Fluent
- 🍎 macOS Big Sur
- 🎮 PS5
- 🚂 Steam
- 💬 Discord
- 📝 Notion
- 🌆 Cyberpunk Neon
- Glassmorphism, Material Dark, Nord, Dracula, Solarized Dark, Tokyo Night, Catppuccin, Gruvbox, Everforest y One Dark
- 🎲 Random (cambia al azar)

Cada tema incluye:
- Paleta de colores propia
- Fuente tipográfica específica
- Hover effects distintos (shadow, glow, brighten, neon)
- Velocidad de transición única
- Textura de fondo
- Scrollbar personalizada
- Animación de entrada
- Mood (personalidad visual)

### Widgets

- 🕐 Reloj con fecha
- ⏳ Resets GW2 (Daily, Weekly, Season)
- 📰 Noticias GW2 (RSS oficial)
- 📝 Notas editables
- 🔢 Contador regresivo editable
- 📺 Twitch (seguidores + estado en vivo)
- 📊 YouTube (suscriptores + último video)

### Favicons inteligentes

- Auto-detección al pegar URL
- Botón Auto-detectar (HTML + Icon Horse + Google)
- Botón Descargar base64
- Emoji manual como override
- Prioridad: icon_url, icon_data, emoji, automático, genérico

## 🚀 Demo

🔗 [Ver en vivo](https://pablosnchz.github.io/la-guarida/)

## 🎨 Diseño 2.1 (Gato Design System)

| Pieza | Detalle |
|-------|---------|
| Cabecera | Marca a la izquierda; navegación de La Guarida (Inicio, Favoritos, Categorías, Lanzador, Widgets); a la derecha theme, Editar, «＋ Agregar», «Backup», «Ecosistema» y la bio |
| Resumen | Saludo, fecha y badges con tus números (favoritos, categorías, enlaces, apps y juegos) junto al portal de Shiruvana |
| Paneles | Título, contador y una línea que explica para qué sirve, como en el Centro de decisiones |
| Tarjetas | Borde fino y brillo arcano al pasar el mouse |
| Accesibilidad | Foco visible, «Saltar al contenido», todo usable con teclado, textos secundarios con contraste 4,5:1 también en temas claros, movimiento reducido |

Los colores salen siempre de las variables del tema activo, así que los 19 temas siguen funcionando. Con el tema Gato Negro, La Guarida queda igual al panel. Menús, portal y avisos son opacos aunque el tema use paneles translúcidos.

La grilla se adapta: en pantallas anchas, widgets | favoritos y categorías | lanzador; debajo de 1400 px, favoritos y categorías arriba y widgets y lanzador abajo; en el celular, todo en una columna.

## 🐈‍⬛ Shiruvana en La Guarida

En el Centro de decisiones Shiruvana es la operadora: informa y pide decisiones. En La Guarida es la **anfitriona**: te ayuda a llegar rápido a lo tuyo y a mantenerlo ordenado (DEC-028).

| Regla | Detalle |
|-------|---------|
| Dónde | Su avatar está fijo en un solo lugar: la barra del portal. El consejo de orden aparece abajo a la derecha, como mucho uno por día |
| Nunca | Datos de la Factory (decisiones, validaciones, backlog, estado, tareas). Tampoco en favoritos, categorías, lanzador, widgets ni en el modal |
| Cómo abre | Hace clic en el elemento real de la pantalla: respeta Chrome forzado, el protocolo `launch:` y el modo edición |
| Red | Ninguna: busca solo en tu Guarida |
| Datos | `guarida:uso:v1` (qué abrís y en qué franja) y `guarida:shiruvana:v1` (consejos silenciados y último backup), solo en este navegador. No entran en el backup |

## 📁 Estructura

| Archivo | Descripción |
|---------|-------------|
| `index.html` | Cabecera, resumen y grilla de widgets, favoritos, categorías y lanzador |
| `css/styles.css` | Diseño 2.1: estructura y componentes sobre las variables del tema |
| `css/themes/` | 19 archivos CSS con variables por tema |
| `js/data.js` | Estado, persistencia, favicons, defaults |
| `js/widgets.js` | Widgets: reloj, resets, noticias, Twitch, YouTube |
| `js/drag-drop.js` | Drag and drop interno + externo |
| `js/modal.js` | Modal de edición universal |
| `js/app.js` | Init, render, lanzador, selector de temas |
| `js/ui.js` | Saludo, badges, contadores de paneles, menús y navegación por secciones |
| `js/shiruvana.js` | Shiruvana anfitriona: portal, «Lo de siempre» y consejos de orden |
| `tests/*.test.cjs` | Tests: `node --test tests/*.test.cjs` |
| `docs/chrome-open.bat` | Backup del script para Chrome-forced |

## 🎨 Sistema de temas

### Cómo funciona

| Componente | Detalle |
|------------|---------|
| `styles.css` | Estructura y componentes — usa variables CSS |
| `themes/xxx.css` | Define las variables para cada tema |
| Selector en header | Cambia `data-theme` en el body |
| Persistencia | El tema elegido se guarda en localStorage |
| Random | Elige un tema al azar cada vez |

### Variables por tema

| Variable | Qué controla |
|----------|--------------|
| `--bg` | Fondo principal |
| `--panel` | Fondo de cards |
| `--panel-alt` | Fondo de filas y controles |
| `--border` / `--border-hover` | Bordes y borde al pasar el mouse |
| `--accent` / `--accent-2` | Colores de acento |
| `--text` / `--muted` | Texto principal y secundario |
| `--radius` | Redondeo base |
| `--font` | Familia tipográfica |
| `--hover-scale` | Escala al hacer hover |
| `--hover-filter` | Filtro visual al hover |
| `--transition-speed` | Velocidad de transición |
| `--bg-texture` | Textura o gradiente de fondo |
| `--scrollbar-color` | Color de la barra de scroll |
| `--animation` | Animación de entrada |
| `--mood` | Personalidad del tema |
| `--glow-color` | Color del glow |

### Agregar un tema nuevo

| Paso | Acción |
|------|--------|
| 1 | Crear `css/themes/nuevo-tema.css` |
| 2 | Agregar la opción al select en `index.html` (el portal la toma sola) |
| 3 | Agregar al array de random en `app.js` |

## 🖥️ Requisitos del sistema (Windows)

### Protocol handler chrome-launch (para abrir en Chrome)

**Archivo local:** `C:\Users\psanc\chrome-open.bat`

```bat
@echo off
set "URL=%~1"
set "URL=%URL:chrome-launch:=%"
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" "https://%URL%"
```

**Registro de Windows:**

```reg
Windows Registry Editor Version 5.00

[HKEY_CLASSES_ROOT\chrome-launch]
@="URL: Chrome Launcher Protocol"
"URL Protocol"=""

[HKEY_CLASSES_ROOT\chrome-launch\shell]

[HKEY_CLASSES_ROOT\chrome-launch\shell\open]

[HKEY_CLASSES_ROOT\chrome-launch\shell\open\command]
@="\"C:\\Users\\psanc\\chrome-open.bat\" \"%1\""
```

### Protocol handler launch (para lanzar apps y juegos)

**Archivo local:** `C:\Users\psanc\launch-open.bat`

```bat
@echo off
set "NAME=%~1"
set "NAME=%NAME:launch:=%"

if "%NAME%"=="Guild-Wars-2" start "" "C:\Guild Wars 2\Gw2-64.exe"
if "%NAME%"=="GW2-Launcher" start "" "C:\Gw2launcher\Gw2Launcher.exe"
if "%NAME%"=="Blish-HUD" start "" "C:\Blish.HUD.1.1.1\Blish HUD.exe"
if "%NAME%"=="Riot-Client" start "" "C:\Riot Games\Riot Client\RiotClientServices.exe"
if "%NAME%"=="Overwolf" start "" "C:\Program Files (x86)\Overwolf\OverwolfLauncher.exe"
if "%NAME%"=="Steam" start "" "C:\Program Files (x86)\Steam\steam.exe"
if "%NAME%"=="Epic-Games" start "" "C:\Program Files (x86)\Epic Games\Launcher\Portal\Binaries\Win32\EpicGamesLauncher.exe"
if "%NAME%"=="GOG-Galaxy" start "" "C:\Program Files (x86)\GOG Galaxy\GalaxyClient.exe"
if "%NAME%"=="Discord" start "" "C:\Users\psanc\AppData\Local\Discord\app-1.0.9253\Discord.exe"
if "%NAME%"=="OBS-Studio" start "" "C:\Program Files\obs-studio\bin\64bit\obs64.exe"
if "%NAME%"=="Filmora" start "" "C:\Users\psanc\AppData\Local\Wondershare\Wondershare Filmora\Wondershare Filmora Launcher.exe"
if "%NAME%"=="Iriun-Webcam" start "" "C:\Program Files (x86)\Iriun Webcam\IriunWebcam.exe"
if "%NAME%"=="CPU-Z" start "" "C:\Program Files\CPUID\CPU-Z\cpuz.exe"
if "%NAME%"=="iCUE" start "" "C:\Program Files\Corsair\Corsair iCUE5 Software\iCUE.exe"
if "%NAME%"=="NVIDIA-Broadcast" start "" "C:\Program Files\NVIDIA Corporation\NVIDIA Broadcast\NVIDIA Broadcast.exe"
if "%NAME%"=="Explorador" start "" "explorer.exe"
if "%NAME%"=="Configuracion" start "" "ms-settings:"
if "%NAME%"=="Panel-NVIDIA" start "" "C:\Program Files\NVIDIA Corporation\Control Panel Client\nvcplui.exe"
if "%NAME%"=="Admin.-Tareas" start "" "taskmgr.exe"
```

**Registro de Windows:**

```reg
Windows Registry Editor Version 5.00

[HKEY_CLASSES_ROOT\launch]
@="URL: Launcher Protocol"
"URL Protocol"=""

[HKEY_CLASSES_ROOT\launch\shell]

[HKEY_CLASSES_ROOT\launch\shell\open]

[HKEY_CLASSES_ROOT\launch\shell\open\command]
@="\"C:\\Users\\psanc\\launch-open.bat\" \"%1\""
```

## 🎮 Lanzador

### Juegos (8)

| Nombre | Ruta |
|--------|------|
| Guild Wars 2 | `C:\Guild Wars 2\Gw2-64.exe` |
| GW2 Launcher | `C:\Gw2launcher\Gw2Launcher.exe` |
| Blish HUD | `C:\Blish.HUD.1.1.1\Blish HUD.exe` |
| Riot Client | `C:\Riot Games\Riot Client\RiotClientServices.exe` |
| Overwolf | `C:\Program Files (x86)\Overwolf\OverwolfLauncher.exe` |
| Steam | `C:\Program Files (x86)\Steam\steam.exe` |
| Epic Games | `C:\Program Files (x86)\Epic Games\Launcher\Portal\Binaries\Win32\EpicGamesLauncher.exe` |
| GOG Galaxy | `C:\Program Files (x86)\GOG Galaxy\GalaxyClient.exe` |

### Aplicaciones (11)

| Nombre | Ruta |
|--------|------|
| Discord | `C:\Users\psanc\AppData\Local\Discord\app-1.0.9253\Discord.exe` |
| OBS Studio | `C:\Program Files\obs-studio\bin\64bit\obs64.exe` |
| Filmora | `C:\Users\psanc\AppData\Local\Wondershare\Wondershare Filmora\Wondershare Filmora Launcher.exe` |
| Iriun Webcam | `C:\Program Files (x86)\Iriun Webcam\IriunWebcam.exe` |
| CPU-Z | `C:\Program Files\CPUID\CPU-Z\cpuz.exe` |
| iCUE | `C:\Program Files\Corsair\Corsair iCUE5 Software\iCUE.exe` |
| NVIDIA Broadcast | `C:\Program Files\NVIDIA Corporation\NVIDIA Broadcast\NVIDIA Broadcast.exe` |
| Explorador | `explorer.exe` |
| Configuración | `ms-settings:` |
| Panel NVIDIA | `C:\Program Files\NVIDIA Corporation\Control Panel Client\nvcplui.exe` |
| Admin. Tareas | `taskmgr.exe` |

## 🔌 APIs integradas

| Servicio | Uso | Credenciales |
|----------|-----|--------------|
| Twitch Helix | Seguidores + estado en vivo | Client ID + Access Token |
| YouTube Data v3 | Suscriptores + último video | API Key |
| GW2 RSS | Noticias oficiales | No requiere |

## 💾 Persistencia

- localStorage con guardado automático
- Backup y Restaurar JSON desde el menú «Backup»
- Migración automática de datos viejos
- Tema elegido guardado en localStorage
- Los defaults se cargan solo si no hay datos previos
- Shiruvana guarda solo en este navegador `guarida:uso:v1` y `guarida:shiruvana:v1`; la copia vieja de la Factory (`guarida:factory:v1`) se borra sola

## 🐈‍⬛ Ecosistema

| Proyecto | Enlace |
|----------|--------|
| Bóveda del Gato Negro | [WebApp GW2](https://pablosnchz.github.io/gw2-wallet-ligero/) |
| Centro de decisiones | [Gato Negro Factory](https://pablosnchz.github.io/gw2-factory-dashboard/) |
| Link in Bio | [Bio](https://pablosnchz.github.io/bio/) |
| Métricas GA4 | [Dashboard](https://pablosnchz.github.io/gw2-metrics-dashboard/) |
| Traffic Stats | [Histórico](https://pablosnchz.github.io/github-repo-traffic-stats/) |

## 📜 Licencia

MIT

---

Desarrollado con 🐈‍⬛ por [PabloSnchz](https://github.com/PabloSnchz)
