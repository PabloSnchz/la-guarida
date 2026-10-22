# 🐈‍⬛ La Guarida

Página de inicio personal del Gato Negro — dashboard híbrido que combina links web, lanzador de aplicaciones locales, widgets en tiempo real, 19 temas visuales y persistencia local. Diseñada para monitores ultrawide, y desde la versión 2.0 con el mismo lenguaje visual que el Centro de decisiones de la Factory.

## ✨ Características

### Organización

- ⭐ Favoritos web con acceso rápido
- 📁 Categorías personalizables
- 🚀 Lanzador de aplicaciones y juegos locales (2 columnas)
- 🔀 Drag and drop para reordenar
- 🦊 Arrastrar desde Firefox para crear links
- 🌐 Abrir links en Chrome obligatoriamente

### Resumen de la Factory con Shiruvana

- Saludo del momento del día y la fecha
- Estados en chips: decisiones, acciones tuyas, validaciones y si la Factory está trabajando
- Un mensaje de Shiruvana con lo que la Factory te pide (hasta 3) y en qué está trabajando
- Enlace directo al [Centro de decisiones](https://pablosnchz.github.io/gw2-factory-dashboard/)

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

## 🎨 Diseño 2.0 (Gato Design System)

| Pieza | Como en el Centro de decisiones |
|-------|--------------------------------|
| Cabecera | Marca a la izquierda, pestañas de acciones y enlaces al centro, estado de la Factory, theme y backup a la derecha |
| Resumen | Rótulo, saludo grande, chips de estado y el mensaje de Shiruvana |
| Secciones | Título y una línea que explica para qué sirve |
| Tarjetas | Fondo de panel, borde fino, esquinas redondeadas; el borde se ilumina al pasar el mouse |
| Estados | Chips con ícono y texto: el color acompaña, nunca informa solo |
| Accesibilidad | Foco visible, objetivos de 44 px en la cabecera, "Saltar al contenido", movimiento reducido |

Los colores salen siempre de las variables del tema activo, así que los 19 temas siguen funcionando. Con el tema Gato Negro, La Guarida queda igual al panel.

La grilla se adapta: en pantallas anchas, widgets | favoritos y categorías | lanzador; debajo de 1400 px, favoritos y categorías arriba y widgets y lanzador abajo; en el celular, todo en una columna. Ya no se esconden widgets ni lanzador en pantallas chicas.

## 🐈‍⬛ Shiruvana en La Guarida

Shiruvana es la voz de la Factory. En La Guarida aparece en **un solo lugar**: el resumen de arriba, porque es la página con la que empieza el día.

| Regla | Detalle |
|-------|---------|
| Dónde | Solo en el resumen. Nunca en favoritos, categorías, lanzador ni widgets |
| Qué dice | Lo que la Factory te pide (acciones, validaciones, decisiones) y en qué está trabajando |
| Fuente | `ai-memory/status.md` de gw2-factory-dev, el mismo archivo que lee el Centro de decisiones |
| Frecuencia | Copia de 5 minutos; se actualiza sola y con el botón "Actualizar" |
| Sin conexión | Muestra la última copia y lo dice; sin copia, lo explica y deja el enlace al panel |
| Seguridad | Todo texto de la memoria se escapa antes de mostrarse |

## 📁 Estructura

| Archivo | Descripción |
|---------|-------------|
| `index.html` | Cabecera, resumen y grilla de widgets, favoritos, categorías y lanzador |
| `css/styles.css` | Diseño 2.0: estructura y componentes sobre las variables del tema |
| `css/themes/` | 19 archivos CSS con variables por tema |
| `js/data.js` | Estado, persistencia, favicons, defaults |
| `js/widgets.js` | Widgets: reloj, resets, noticias, Twitch, YouTube |
| `js/drag-drop.js` | Drag and drop interno + externo |
| `js/modal.js` | Modal de edición universal |
| `js/app.js` | Init, render, lanzador, selector de temas |
| `js/shiruvana.js` | Resumen de la Factory y mensaje de Shiruvana |
| `tests/shiruvana.test.cjs` | Tests del resumen: `node --test tests/*.test.cjs` |
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
| 2 | Agregar la opción al select en `index.html` |
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
| GitHub (raw) | Estado de la Factory para el resumen | No requiere |

## 💾 Persistencia

- localStorage con guardado automático
- Backup y Restaurar JSON en el header
- Migración automática de datos viejos
- Tema elegido guardado en localStorage
- Los defaults se cargan solo si no hay datos previos
- El resumen de la Factory guarda una copia de 5 minutos (`guarida:factory:v1`)

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
