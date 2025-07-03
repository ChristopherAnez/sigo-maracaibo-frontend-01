// src/js/loader.js
import { LOADER_DELAY } from "./config.js";

export function initLoader() {
  const loader = document.getElementById("loader");
  loader.innerHTML = `
    <img src="images/sun-logo.png" class="loader-img" alt="Cargando…" />
    <p class="loader-text">Cargando la aplicación…</p>
  `;
}

export function hideLoader(showCallback) {
  setTimeout(() => {
    document.getElementById("loader").style.display = "none";
    showCallback();
  }, LOADER_DELAY);
}
