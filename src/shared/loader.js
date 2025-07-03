import { LOADER_DELAY } from "./config.js";

// Módulo desacoplado: solo gestiona el loader
export function initLoader() {
  const loader = document.getElementById("loader");
  loader.innerHTML = `
    <img src="images/sun-logo.png" class="loader-img" alt="Cargando…" />
    <p class="loader-text">Cargando la aplicación…</p>
  `;
}

export function hideLoader(showCallback) {
  setTimeout(() => {
    const loader = document.getElementById("loader");
    if (loader) {
      loader.classList.add("hide");
      setTimeout(() => {
        loader.style.display = "none";
        if (typeof showCallback === 'function') showCallback();
      }, 400);
    } else if (typeof showCallback === 'function') {
      showCallback();
    }
  }, LOADER_DELAY);
}
