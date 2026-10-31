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
| RG-4 | Widgets: panel «Agregar un widget», cuenta regresiva con selector de fecha | Pendiente |
| RG-5 | Editor plegado, avisos y confirmación con «Deshacer»; revisión en 19 themes, teclado y celular | Pendiente |
| RG-6 | `next/` reemplaza a la raíz | Pendiente |

Desde RG-2, `next/index.html` se edita a mano: ya no es una copia de la raíz. Lo único que la raíz puede perder en la vista previa es lo que figura en `QUITADOS` de `tests/next-preview.test.cjs` (hoy: `heroBadges`).

Tests: `node --test tests/*.test.cjs` (`kit.test.cjs`, `next-preview.test.cjs`, `header.test.cjs` y `cards.test.cjs` son de esta etapa).
