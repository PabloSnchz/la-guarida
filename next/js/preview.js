/*!
 * next/js/preview.js — Vista previa de La Guarida en /next/ (1.0.0, 2026-10-31, RG-1)
 *
 * next/index.html usa <base href="../">: así comparte css/, js/, assets/ y los
 * 19 themes con La Guarida de siempre, y lee los mismos datos (mismo origen, misma
 * clave la_guarida_data_v1). Con <base>, un enlace «#seccion» apuntaría a la raíz y
 * sacaría a Pablo de la vista previa: acá esos enlaces se quedan en esta página.
 * También pone una marca chica «Vista previa» con un enlace a La Guarida de siempre.
 * Se borra en RG-6, cuando la vista previa pase a ser La Guarida.
 */
(function (root) {
  'use strict';
  if (!root || !root.document) return;
  var doc = root.document;

  // Enlaces internos (#id): scroll en esta página, sin navegar a la raíz.
  doc.addEventListener('click', function (ev) {
    var t = ev.target;
    var a = t && t.closest ? t.closest('a[href^="#"]') : null;
    if (!a || ev.defaultPrevented || ev.button !== 0 || ev.ctrlKey || ev.metaKey || ev.shiftKey) return;
    var id = a.getAttribute('href').slice(1);
    ev.preventDefault();
    var el = id ? doc.getElementById(id) : null;
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (a.classList.contains('skip-link')) {
        if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
        el.focus({ preventScroll: true });
      }
    }
    if (root.history && root.history.replaceState) {
      root.history.replaceState(null, '', root.location.pathname + root.location.search + (id ? '#' + id : ''));
    }
  }, true);

  function marca() {
    var m = doc.createElement('a');
    m.className = 'gk-preview';
    m.href = './';
    m.title = 'Estás en la vista previa del restyle. Tus datos son los mismos que en La Guarida de siempre.';
    m.innerHTML = '<b>Vista previa</b><span>RG-1 · volver a La Guarida</span>';
    doc.body.appendChild(m);
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', marca);
  else marca();
})(typeof window !== 'undefined' ? window : this);
