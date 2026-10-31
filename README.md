# 🐈‍⬛ La Guarida

Página de inicio personal del Gato Negro — lanzador híbrido que combina links web, aplicaciones y juegos locales, widgets en tiempo real, 19 temas visuales y persistencia local. Diseñada para monitores ultrawide. Desde la versión 3.0 (restyle RG, 2026-10-31) sigue la línea visual de La Bóveda a la medida de un lanzador, pero sigue siendo solo un lanzador: no muestra datos de la Factory.

## ✨ Características

### Organización

- ⭐ Favoritos web con acceso rápido
- 📁 Categorías personalizables
- 🚀 Lanzador de aplicaciones y juegos locales
- 🔀 Drag and drop para reordenar
- 🦊 Arrastrar desde Firefox para crear links
- 🌐 Abrir links en Chrome obligatoriamente
- ↩️ Borrar sin preguntas: se borra al instante y aparece «Deshacer» durante 10 segundos

### Shiruvana, tu anfitriona

- 🔎 **Portal «¿A dónde vamos?»**: barra en la cabecera; también se abre con **Ctrl+K** o **/**. Busca en favoritos, enlaces, apps, juegos, atajos (Wiki, Foros, ANet Keys, La Bóveda, Centro de decisiones, Link in Bio) y acciones (theme, modo edición, agregar, backup). Encuentra aunque escribas con errores o sin acentos; ↑ ↓ para moverse, Enter abre, Esc cierra.
- ⏱️ **Lo de siempre**: hasta 5 accesos que más abrís en esta franja del día (mañana, tarde o noche), como primera fila de Favoritos. Aparece con 10 aperturas o más.
- 🧹 **Consejos de orden**: una franja fina debajo de la cabecera, como mucho una por día, sobre enlaces repetidos, categorías vacías o un backup viejo. Cada uno trae su botón para resolverlo y «Ahora no» lo silencia 30 días. Nunca aparece mientras editás.
- 🙂 **Siete poses según el momento** (RG-7): saluda en la barra del portal; con el portal abierto aparece su retrato al costado (con el gato mientras espera, pensando si encuentra algo, explicando si no); explica en los consejos y mira con atención cuando conviene un backup; en los avisos festeja lo que salió bien, guiña al borrar (con «Deshacer») y mira con atención en las advertencias.

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
- ⏳ Resets GW2 (Daily y Weekly; la temporada está en la cabecera)
- 📰 Noticias GW2 (RSS oficial)
- 📝 Notas editables
- 🔢 Contador regresivo con selector de fecha
- 📺 Twitch (seguidores + estado en vivo)
- 📊 YouTube (suscriptores + último video)

«＋ Widget» abre un panel con cada widget, su ícono, para qué sirve y cuántos ya tenés.

### Favicons inteligentes

- Auto-detección al pegar URL
- Botón Auto-detectar (HTML + Icon Horse + Google)
- Botón Descargar base64
- Emoji manual como override
- Prioridad: icon_url, icon_data, emoji, automático, genérico

## 🚀 Demo

🔗 [Ver en vivo](https://pablosnchz.github.io/la-guarida/)

## 🎨 Diseño 3.0 (restyle RG, 2026-10-31)

| Pieza | Detalle |
|-------|---------|
| Cabecera | Dos filas finas (≈ 100 px). Fila 1: marca, secciones (Favoritos, Categorías, Lanzador, Widgets), theme, Editar, «＋» y «⋯» (backup con la fecha del último, La Bóveda, Centro de decisiones, Link in Bio y enlaces de GW2). Fila 2: saludo, portal de Shiruvana y relojes |
| Relojes | Local, reinicio diario (00:00 UTC), semanal (lunes 07:30 UTC) y fin de la temporada de la Cámara del Brujo, con los íconos de La Bóveda. Se ponen dorados cuando falta poco: menos de 1 h el diario, menos de 24 h el semanal, menos de 3 días la temporada |
| Temporada | Se lee de `/v2/wizardsvault` (API pública de GW2) como mucho una vez por día; si no hay fecha, ese reloj no aparece |
| Backup | Punto dorado en «⋯» cuando pasan más de 30 días sin backup |
| Un color por sección | Ámbar Favoritos, violeta Categorías, turquesa Lanzador: línea arriba de cada panel, bordes y brillos. Nunca como color de texto fuera del tema Gato Negro |
| Secciones vacías | El gato robot «en construcción» con un texto que explica qué hacer |
| Editor | Nombre, dirección y «Abrir en Chrome» a la vista; ícono y emoji plegados. El foco va al nombre, Enter guarda, Esc cierra |
| Avisos | Abajo a la derecha, sin ventanas del navegador, con la cara de Shiruvana; borrar ofrece «Deshacer» 10 s |
| Accesibilidad | Foco visible, «Saltar al contenido», todo usable con teclado, movimiento reducido. Contraste mínimo 4,5:1 de todo lo nuevo, medido en los 19 temas por `tests/themes-contraste.test.cjs` |

Los colores salen siempre de las variables del tema activo, así que los 19 temas siguen funcionando. Menús, portal, paneles y avisos son opacos aunque el tema use paneles translúcidos.

La grilla se adapta: en pantallas anchas, widgets | favoritos y categorías | lanzador; debajo de 1400 px, favoritos y categorías arriba y widgets y lanzador abajo; en el celular, todo en una columna.

El restyle se armó en una vista previa (`next/`) paso a paso, cada uno validado por Pablo: RG-1 kit, RG-2 cabecera, RG-3 tarjetas, RG-3b caras de Shiruvana, RG-4 widgets, RG-5 editor, avisos y revisión de temas, RG-6 reemplazo de la raíz. Después, RG-7 puso a la vista las siete poses. Propuestas en `docs/propuestas/propuesta-restyle-rg0.html` y `rg0b.html`. `next/` quedó solo como redirección a la raíz.

## 🐈‍⬛ Shiruvana en La Guarida

En el Centro de decisiones Shiruvana es la operadora: informa y pide decisiones. En La Guarida es la **anfitriona**: te ayuda a llegar rápido a lo tuyo y a mantenerlo ordenado (DEC-028).

| Regla | Detalle |
|-------|---------|
| Dónde | La barra del portal, el portal abierto (retrato al costado desde 1000 px de ancho), la franja del consejo (como mucho uno por día) y los avisos |
| Imagen | La figura ilustrada de Shiruvana, aprobada por Pablo el 2026-10-31 como su imagen en todo el ecosistema: 7 poses en `assets/brand/shiruvana/`, cada una en retrato 320/640 px y cara 128/256 px |
| Cada pose | hola: barra del portal · con el gato: portal abierto sin búsqueda · pensando: portal con resultados · explica: portal sin resultados, consejos y avisos informativos · ojo: consejo de backup, advertencias y errores · festeja: avisos de algo que salió bien · guiño: borrado con «Deshacer» |
| Nunca | Datos de la Factory (decisiones, validaciones, backlog, estado, tareas). Tampoco en favoritos, categorías, lanzador, widgets ni en el editor |
| Cómo abre | Hace clic en el elemento real de la pantalla: respeta Chrome forzado, el protocolo `launch:` y el modo edición |
| Red | Ninguna: busca solo en tu Guarida |
| Datos | `guarida:uso:v1` (qué abrís y en qué franja) y `guarida:shiruvana:v1` (consejos silenciados y último backup), solo en este navegador. No entran en el backup |

## 📁 Estructura

| Archivo | Descripción |
|---------|-------------|
| `index.html` | Cabecera de dos filas y grilla de widgets, favoritos, categorías y lanzador |
| `css/styles.css` | Estructura y componentes sobre las variables del tema (2.1) |
| `css/kit.css` | Relojes compactos, avisos y paneles |
| `css/header.css` | Cabecera de dos filas, «⋯», franja del consejo, colores por sección, retrato del portal y cara en los avisos |
| `css/cards.css` | Tarjetas con un color por sección y secciones vacías |
| `css/widgets.css` | Panel «Agregar un widget» y contador |
| `css/editor.css` | Editor con «Ícono y emoji» plegado |
| `css/themes/` | 19 archivos CSS con variables por tema |
| `js/kit.js` | Reloj común (diario, semanal, temporada) y avisos/paneles propios |
| `js/header.js` | Relojes, temporada desde la API, punto de backup, franja del consejo y las siete poses de Shiruvana |
| `js/widgets-ui.js` | Panel «Agregar un widget» y contador con selector de fecha |
| `js/editor.js` | Borrar con «Deshacer», avisos en lugar de ventanas del navegador y teclado en el editor |
| `js/data.js` | Estado, persistencia, favicons, defaults |
| `js/widgets.js` | Widgets: reloj, resets, noticias, Twitch, YouTube |
| `js/drag-drop.js` | Drag and drop interno + externo |
| `js/modal.js` | Modal de edición universal |
| `js/app.js` | Init, render, lanzador, selector de temas |
| `js/ui.js` | Saludo, contadores de paneles, menús y navegación por secciones |
| `js/shiruvana.js` | Shiruvana anfitriona: portal, «Lo de siempre» y consejos de orden |
| `assets/brand/` | Gato Negro (SVG), gato en construcción, logo IA y Shiruvana |
| `next/index.html` | Redirección a la raíz para marcadores viejos de la vista previa |
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
| 4 | Correr `tests/themes-contraste.test.cjs`: espera 19 temas, así que hay que subir ese número |

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
| GW2 API `/v2/wizardsvault` | Fin de la temporada de la Cámara del Brujo, una vez por día | No requiere |

## 💾 Persistencia

- localStorage con guardado automático
- Backup y Restaurar JSON desde el menú «⋯»
- Migración automática de datos viejos
- Tema elegido guardado en localStorage
- Los defaults se cargan solo si no hay datos previos
- Shiruvana guarda solo en este navegador `guarida:uso:v1` y `guarida:shiruvana:v1`; la copia vieja de la Factory (`guarida:factory:v1`) se borra sola
- La temporada se guarda en `guarida:temporada:v1`: solo la fecha de fin y cuándo se pidió, unos pocos bytes (el localStorage de pablosnchz.github.io es compartido con La Bóveda y el Centro de decisiones)

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
