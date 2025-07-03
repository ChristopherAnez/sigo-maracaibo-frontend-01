// src/utils/loader.js

import { CONFIG } from '../core/config.js';
import { store } from '../core/store.js';

/**
 * Módulo desacoplado: gestiona el loader de la aplicación
 */

/**
 * Inicializa el loader
 */
export function initLoader() {
  const loader = document.getElementById("loader");
  if (!loader) return;

  loader.innerHTML = `
    <img src="images/sun-logo.png" class="loader-img" alt="Cargando…" />
    <p class="loader-text">Cargando la aplicación…</p>
  `;
}

/**
 * Oculta el loader y ejecuta un callback opcional
 * @param {Function} showCallback - Función a ejecutar después de ocultar el loader
 */
export function hideLoader(showCallback) {
  const delay = CONFIG.UI.ANIMATIONS_ENABLED ? CONFIG.UI.LOADER_DELAY : 0;
  
  setTimeout(() => {
    const loader = document.getElementById("loader");
    if (!loader) {
      if (typeof showCallback === 'function') showCallback();
      return;
    }
    
    if (CONFIG.UI.ANIMATIONS_ENABLED) {
      loader.classList.add("hide");
      setTimeout(() => {
        loader.style.display = "none";
        if (typeof showCallback === 'function') showCallback();
        store.setState({ isLoading: false });
      }, 400);
    } else {
      loader.style.display = "none";
      if (typeof showCallback === 'function') showCallback();
      store.setState({ isLoading: false });
    }
  }, delay);
}

/**
 * Muestra el loader
 */
export function showLoader() {
  const loader = document.getElementById("loader");
  if (!loader) return;
  
  loader.classList.remove("hide");
  loader.style.display = "flex";
  store.setState({ isLoading: true });
}
