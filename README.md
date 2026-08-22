# 🐈‍⬛ La Guarida

Página de inicio personal del Gato Negro — dashboard híbrido que combina links web, lanzador de aplicaciones locales, widgets en tiempo real y persistencia local. Diseñada para monitores ultrawide.

## ✨ Características

### Organización

- ⭐ Favoritos web con acceso rápido
- 📁 Categorías personalizables
- 🚀 Lanzador de aplicaciones y juegos locales
- 🔀 Drag and drop para reordenar
- 🦊 Arrastrar desde Firefox para crear links
- 🌐 Abrir links en Chrome obligatoriamente

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

## 📁 Estructura

| Archivo | Descripción |
|---------|-------------|
| `index.html` | Estructura con header compacto + layout ultrawide |
| `css/styles.css` | Estilos (misma piel que la Bóveda) |
| `js/data.js` | Estado, persistencia, favicons, defaults |
| `js/widgets.js` | Widgets: reloj, resets, noticias, Twitch, YouTube |
| `js/drag-drop.js` | Drag and drop interno + externo |
| `js/modal.js` | Modal de edición universal |
| `js/app.js` | Init, render, lanzador |
| `docs/chrome-open.bat` | Backup del script para Chrome-forced |

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
- Backup y Restaurar JSON en el header
- Migración automática de datos viejos
- Los defaults se cargan solo si no hay datos previos

## 🎨 Estética

- Misma paleta que la Bóveda: `#0e0e10`, `#ffd966`, `#7bc2ff`
- Hover: `translateY(-3px)` + shadow profunda
- Border-left semántico por widget
- Transiciones: `0.22s cubic-bezier(0.2, 0.9, 0.4, 1.1)`

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