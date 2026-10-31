# La Guarida — vista previa del restyle (`next/`)

Acá se arma el restyle de La Guarida sin tocar la de todos los días. Propuestas aprobadas por Pablo el 2026-10-31: [RG-0](../docs/propuestas/propuesta-restyle-rg0.html) (todo menos la cabecera) y [RG-0b](../docs/propuestas/propuesta-restyle-rg0b.html) (cabecera compacta de dos filas, consejo como franja fina, contadores en los encabezados, backup como punto en «⋯», un color por sección).

- **Dirección:** https://pablosnchz.github.io/la-guarida/next/
- **Datos:** los mismos que La Guarida de siempre (mismo origen, misma clave `la_guarida_data_v1`). Un favorito que agregues acá aparece también allá, y al revés.
- **Cómo funciona:** `next/index.html` usa `<base href="../">`, así comparte `css/`, `js/`, `assets/` y los 19 themes con la raíz. Lo nuevo vive en `next/` y cada paso reemplaza una pieza. `next/js/preview.js` hace que los enlaces `#sección` se queden en la vista previa y pone la marca «Vista previa».
- **Al terminar (RG-6):** `next/` pasa a ser La Guarida, se borra esta carpeta y se actualiza el README principal.

| Paso | Qué | Estado |
|------|-----|--------|
| RG-1 | Vista previa + `next/js/kit.js` 1.0.0 (reloj común y avisos, todavía sin usar) + `next/css/kit.css` + tests | Hecho 2026-10-31 |
| RG-2 | Cabecera de dos filas (`next/js/header.js` 1.0.0 + `next/css/header.css`): relojes con íconos de La Bóveda, temporada de la Cámara del Brujo desde `/v2/wizardsvault` (una vez por día, clave `guarida:temporada:v1`, solo `{ end, t }`), consejo de Shiruvana como franja, «⋯» con backup (punto dorado a los 30 días), Link in Bio y Ecosistema; «Lo de siempre» pasa a Favoritos; sin resumen grande ni badges | Hecho 2026-10-31 |
| RG-3 | Tarjetas (`next/css/cards.css` 1.0.0, solo CSS): línea de color arriba de cada panel; Favoritos ámbar (ícono en baldosa), Categorías violeta (borde izquierdo, título violeta claro solo en el theme oficial), Lanzador turquesa (ícono en baldosa); los colores fijos nunca como texto en otros themes; estado vacío con el gato robot `assets/brand/gato-en-construccion-256.webp` | Hecho 2026-10-31 |
| RG-3b | Mi cara nueva (`next/js/header.js` 1.1.0): portal cerrado `hola`, portal abierto `pensando`, consejo `explica` (u `ojo` si es del backup), desde `assets/brand/shiruvana/*-cara-128.webp`; si una imagen no carga, vuelve el avatar anterior. `shiruvana.js` no cambia | Hecho 2026-10-31 |
| RG-4 | Widgets (`next/js/widgets-ui.js` 1.0.0 + `next/css/widgets.css`, `js/widgets.js` sin cambios): panel «Agregar un widget» con ícono, nombre, para qué sirve y cuántos tenés (reemplaza el `prompt()` con números); cuenta regresiva con título y selector de fecha (reemplaza dos `prompt()` y un `alert()`), cada contador se edita a sí mismo; la fecha se muestra en hora local (antes en Argentina mostraba el día anterior); se oculta la fila «Season» del widget de reinicios (fija en 2026-09-15; la temporada real está en la cabecera). Mismo formato de datos (`YYYY-MM-DD`) | Hecho 2026-10-31 |
| RG-5 | Editor y avisos (`next/js/editor.js` 1.0.0 + `next/css/editor.css`; `app.js`, `modal.js` y `data.js` sin cambios): borrar ya no pregunta, borra y ofrece «Deshacer» 10 s (cualquier otro guardado lo cancela); los `alert()` pasan a avisos abajo a la derecha; en el editor el foco va al nombre, Enter guarda y el foco vuelve al cerrar; ícono y emoji plegados en «Ícono y emoji». Revisión de los 19 themes con contraste medido (`tests/themes-contraste.test.cjs`, mínimo 4,5:1): `kit.css` 1.0.1 (reloj «cerca», etiqueta del reloj, botón principal violeta, avisos opacos y por encima del editor), `header.css` 1.0.1 y `widgets.css` 1.0.1. Celular: falta la prueba a mano de Pablo | Hecho 2026-10-31 |
| RG-6 | `next/` reemplaza a la raíz | Pendiente |

Desde RG-2, `next/index.html` se edita a mano: ya no es una copia de la raíz. Lo único que la raíz puede perder en la vista previa es lo que figura en `QUITADOS` de `tests/next-preview.test.cjs` (hoy: `heroBadges`).

Tests: `node --test tests/*.test.cjs` (`kit.test.cjs`, `next-preview.test.cjs`, `header.test.cjs`, `cards.test.cjs`, `widgets-ui.test.cjs`, `editor.test.cjs` y `themes-contraste.test.cjs` son de esta etapa).

Pendiente fuera del restyle (anotado en RG-4): `js/widgets.js` tiene escritos el token de Twitch y la clave de YouTube en un repositorio público, y cada `renderAll()` arranca otro reloj de un segundo sin frenar el anterior. No se tocan en la vista previa. Del theme One Dark (RG-5): su texto secundario (`--gn-muted` de `styles.css`) queda en 2,9:1 sobre el panel; es del theme, no de next/.
