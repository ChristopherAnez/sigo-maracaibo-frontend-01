import { showLoader, hideLoader, initLoader } from '../../utils/loader.js';
import { showNotification } from '../../utils/notifications.js';
import { authService } from '../../services/auth.js';
import { showFieldError, validateRequired } from '../../utils/validation.js';

/**
 * Controlador de la vista de login
 * @param {HTMLElement} container - Contenedor donde renderizar el login
 */
export async function loginController(container) {
  // Renderiza la interfaz de login
  renderLogin(container);
  
  // Inicializa el loader
  showLoader();
  hideLoader(() => {
    // Cuando termina de cargar, muestra el contenedor de login
    const loginContainer = document.querySelector('.login-container');
    if (loginContainer) {
      loginContainer.style.visibility = 'visible';
      loginContainer.classList.add('fade-in');
    }
  });
  
  // Configura el formulario
  setupLoginForm();
}

/**
 * Renderiza la interfaz de login
 * @param {HTMLElement} container - Contenedor donde renderizar el login
 */
export function renderLogin(container) {
  const targetContainer = container || document.querySelector(".login-container");
  if (!targetContainer) return;
  
  targetContainer.innerHTML = `
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
      <form id="loginForm" novalidate autocomplete="off" onsubmit="return false;">
        <div class="input-box">
          <input type="text" name="username" placeholder="Nombre de usuario" autocomplete="username" required />
          <i class="bx bxs-user"></i>
        </div>
        <div class="input-box">
          <input type="password" name="password" placeholder="Contraseña" autocomplete="current-password" required />
          <i class="bx bxs-lock-alt"></i>
        </div>
        <!-- Espacio para mensajes de error -->
        <div class="form-error-container"></div>
        <button type="submit" class="btn">
          <i class="bx bx-log-in"></i>
          <span>Iniciar Sesión</span>
        </button>
      </form>
    </div>
  `;
  targetContainer.style.visibility = "visible";
}

/**
 * Configura el formulario de login
 */
function setupLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Limpiar todos los errores previos
    form.querySelectorAll(".input-box").forEach(box => {
      box.classList.remove("error");
      const msg = box.querySelector(".error-text");
      if (msg) msg.remove();
    });
    
    // Limpiar error global si existe
    const errorContainer = form.querySelector('.form-error-container');
    if (errorContainer) {
      errorContainer.innerHTML = '';
    }
    
    // Validar campos requeridos
    const username = form.username;
    const password = form.password;
    
    const isUsernameValid = validateRequired(username, "El nombre de usuario es obligatorio.");
    const isPasswordValid = validateRequired(password, "La contraseña es obligatoria.");
    
    if (!isUsernameValid || !isPasswordValid) return;
    
    // Obtener referencia al botón
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnContent = submitBtn.innerHTML;
    
    // Cambiar estado del botón a cargando
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i><span>Iniciando sesión...</span>';
    submitBtn.style.opacity = '0.8';
    
    // Mostrar loader global
    showLoader();
    
    try {
      // Intentar login
      event.preventDefault();
      
      await authService.login(username.value.trim(), password.value.trim());
      
      // Login exitoso
      submitBtn.innerHTML = '<i class="bx bx-check"></i><span>¡Éxito!</span>';
      submitBtn.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';
      
      showNotification('Sesión iniciada correctamente', 'success');
      
      // Redirigir después de un breve delay
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 800);
      
    } catch (err) {
      // Error de login
      hideLoader();
      
      // Restaurar botón
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnContent;
      submitBtn.style.opacity = '1';
      submitBtn.style.background = '';
      
      // Mensaje de error
      const errorMessage = err.message || 'Error al iniciar sesión. Verifique sus credenciales.';
      showNotification(errorMessage, 'error');
      
      // Efecto visual de error en campos
      const inputs = form.querySelectorAll('input');
      inputs.forEach(input => {
        input.style.borderColor = '#e74c3c';
        input.style.boxShadow = '0 0 0 3px rgba(231, 76, 60, 0.1)';
        
        // Restaurar colores después de un tiempo
        setTimeout(() => {
          input.style.borderColor = '';
          input.style.boxShadow = '';
        }, 3000);
      });
      
      // Animación de "shake" en el contenedor
      const container = document.querySelector('.login-container');
      if (container) {
        container.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
          container.style.animation = '';
        }, 500);
      }
    }
  });
}
