// src/js/dashboard.js

import { initUserManagement } from './users.js';

// Protección del dashboard: si no hay JWT, redirige a login
if (!localStorage.getItem('accessToken')) {
  window.location.href = "index.html";
}

// --- Sidebar y UI ---
const sidebar   = document.querySelector(".sidebar");
const mainContent = document.querySelector(".main-content");
const toggleBtn = document.getElementById("sidebarToggle");

// Calcula y aplica la posición del toggle junto al borde del sidebar
function updateTogglePosition() {
  const sbWidth = sidebar.offsetWidth;
  const tgWidth = toggleBtn.offsetWidth;
  if (window.innerWidth > 768) {
    if (sidebar.classList.contains("collapsed")) {
      toggleBtn.style.left = "15px";
    } else {
      toggleBtn.style.left = `${sbWidth - tgWidth / 2}px`;
    }
  } else {
    toggleBtn.style.left = "15px";
  }
}

// Inicial: colapsado en móvil y posiciona
if (window.innerWidth <= 768) {
  sidebar.classList.add("collapsed");
  mainContent.classList.add("collapsed");
}
updateTogglePosition();

// Handler del botón toggle
toggleBtn.addEventListener("click", () => {
  if (window.innerWidth <= 768) {
    // móvil: overlay
    const isOpen = sidebar.classList.toggle("open");
    document.body.classList.toggle("sidebar-open", isOpen);
  } else {
    // escritorio: collapsible
    sidebar.classList.toggle("collapsed");
    mainContent.classList.toggle("collapsed");
  }
  toggleBtn.classList.toggle("toggled");
  updateTogglePosition();
});

// Submenús
document.querySelectorAll(".has-sub > a").forEach(anchor => {
  anchor.addEventListener("click", e => {
    e.preventDefault();
    const parent = anchor.parentElement;
    parent.classList.toggle("open");
    const submenu = parent.querySelector(".submenu");
    submenu.style.display = parent.classList.contains("open") ? "block" : "none";
  });
});

// Logout: limpia el token y vuelve a login
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("username");
  localStorage.removeItem("email");
  localStorage.removeItem("userId");
  window.location.href = "index.html";
});

// Al cambiar tamaño
window.addEventListener("resize", () => {
  if (window.innerWidth > 768) {
    sidebar.classList.remove("open", "collapsed");
    mainContent.classList.remove("collapsed");
    document.body.classList.remove("sidebar-open");
    toggleBtn.classList.remove("toggled");
  } else {
    sidebar.classList.add("collapsed");
    mainContent.classList.add("collapsed");
  }
  updateTogglePosition();
});

// --- Helpers para fetch autenticado ---
export function authFetch(url, options = {}) {
  const token = localStorage.getItem('accessToken');
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      'Authorization': 'Bearer ' + token,
    }
  });
}

// --- Mostrar el usuario logueado ---
const username = localStorage.getItem("username") || "Usuario";
const userInfoDiv = document.querySelector(".user-info strong");
if (userInfoDiv) {
  userInfoDiv.textContent = username;
}

// --- Integrar gestión de usuarios ---
initUserManagement();

// --- Evento para volver al dashboard ---
document.addEventListener("DOMContentLoaded", () => {
  const backBtn = document.getElementById('backToDashboardBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      document.getElementById('user-management').style.display = 'none';
      document.getElementById('dashboardHome').style.display = '';
    });
  }
});

// Mostrar sección principal al cargar (ocultar gestión usuarios)
document.getElementById('dashboardHome').style.display = '';
document.getElementById('user-management').style.display = 'none';