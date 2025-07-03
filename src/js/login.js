import { initLoader, hideLoader } from "./loader.js";
import { API_BASE } from "./config.js";

export function showFieldError(input, message) {
  const box = input.parentElement;
  box.classList.add("error");
  if (!box.querySelector(".error-text")) {
    const span = document.createElement("span");
    span.className = "error-text";
    span.innerText = message;
    box.appendChild(span);
  }
}

export async function loginUser(username, password) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  if (!response.ok) {
    let errorMsg = 'Credenciales inválidas';
    try {
      const err = await response.json();
      errorMsg = err.message || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }
  return await response.json();
}

export function renderLogin() {
  const container = document.querySelector(".login-container");
  container.innerHTML = `
    <div class="logo-wrapper">
      <img src="images/alcaldia-maracaibo-logo.png" alt="Logo Alcaldía Maracaibo" />
    </div>
    <div class="welcome-text">¡Bienvenido!</div>
    <div class="system-name">
      SIGO Maracaibo<br/>
      <span class="system-subname">
        Sistema de Gestión Operativa de la Alcaldía de Maracaibo
      </span>
    </div>
    <div class="form-box">
      <form id="loginForm" novalidate>
        <div class="input-box">
          <input type="text" name="username" placeholder="Nombre de usuario" autocomplete="username" />
          <i class="bx bxs-user"></i>
        </div>
        <div class="input-box">
          <input type="password" name="password" placeholder="Contraseña" autocomplete="current-password" />
          <i class="bx bxs-lock-alt"></i>
        </div>
        <button type="submit" class="btn">Entrar</button>
      </form>
    </div>
  `;
  container.style.visibility = "visible";
  const form = document.getElementById("loginForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    form.querySelectorAll(".input-box").forEach(box => {
      box.classList.remove("error");
      const msg = box.querySelector(".error-text");
      if (msg) msg.remove();
    });
    const username = form.username.value.trim();
    const password = form.password.value.trim();
    let valid = true;
    if (!username) {
      showFieldError(form.username, "El nombre de usuario es obligatorio.");
      valid = false;
    }
    if (!password) {
      showFieldError(form.password, "La contraseña es obligatoria.");
      valid = false;
    }
    if (!valid) return;
    try {
      const data = await loginUser(username, password);
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("username", data.username || username);
      localStorage.setItem("email", data.email || "");
      localStorage.setItem("userId", data.userId || "");
      window.location.href = "dashboard.html";
    } catch (err) {
      form.querySelectorAll(".input-box").forEach(box => {
        box.classList.add("error");
        if (!box.querySelector(".error-text")) {
          const span = document.createElement("span");
          span.className = "error-text";
          span.innerText = err.message;
          box.appendChild(span);
        }
      });
    }
  });
}

// Inicialización automática solo si es login
if (document.body.classList.contains('login-page')) {
  initLoader();
  window.addEventListener("load", () => hideLoader(renderLogin));
}
