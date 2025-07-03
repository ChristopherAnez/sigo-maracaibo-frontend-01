// src/features/dashboard/dashboard.js

import { store } from '../../core/store.js';
import { showLoader, hideLoader } from '../../utils/loader.js';
import { showNotification } from '../../utils/notifications.js';
import { authService } from '../../services/auth.js';
import { CONFIG } from '../../core/config.js';

/**
 * Controlador para la vista del dashboard
 * @param {HTMLElement} container - Contenedor donde renderizar el dashboard
 */
export async function dashboardController(container) {
  // Verifica autenticación
  if (!authService.checkSession()) {
    window.location.href = 'index.html';
    return;
  }
  
  // Muestra loader
  showLoader();
  
  // Renderiza el dashboard
  renderDashboard(container);
  
  // Configura eventos
  setupDashboardEvents();
  
  // Oculta el loader
  hideLoader();
}

/**
 * Renderiza la interfaz del dashboard
 * @param {HTMLElement} container - Contenedor donde renderizar
 */
function renderDashboard(container) {
  if (!container) return;
  
  // Obtiene el usuario actual
  const { user } = store.getState();
  const username = user ? user.username : 'Usuario';
  
  // Verifica si el usuario tiene rol de administrador
  const isAdmin = authService.isAdmin();
  
  // Actualiza el contenido
  container.innerHTML = `
    <header class="header">
      <div>
        <h1>Dashboard</h1>
        <span class="subtitle">Sistema de Gestión Operativa</span>
      </div>
      <div class="user-info">
        <i class="bx bxs-user-circle"></i>
        <span>${username}</span>
        ${isAdmin ? '<span class="admin-badge" title="Tienes privilegios de administrador">Admin</span>' : ''}
      </div>
    </header>

    <section class="content" id="dashboardHome">
      <div class="welcome-card">
        <div>
          <h2>Bienvenido al SIGO Maracaibo</h2>
          <p>Sistema Integrado de Gestión Operativa de la Alcaldía de Maracaibo</p>
        </div>
        <div class="welcome-icon">
          <i class='bx bx-building-house'></i>
        </div>
      </div>
      
      <h2 class="section-title">Módulos del sistema</h2>
      
      <div class="dashboard-cards">
        <div class="card">
          <i class="bx bxs-file-doc"></i>
          <h3>Presupuestos</h3>
          <p>Gestión y control de presupuestos municipales, APUs y proyectos</p>
          <button class="btn-card" data-module="budgets">
            <span>Acceder al módulo</span>
            <i class='bx bx-right-arrow-alt'></i>
          </button>
        </div>
        
        <div class="card">
          <i class="bx bxs-data"></i>
          <h3>Datos maestros</h3>
          <p>Administración de partidas, equipos, materiales y recursos del sistema</p>
          <button class="btn-card" data-module="masterdata">
            <span>Acceder al módulo</span>
            <i class='bx bx-right-arrow-alt'></i>
          </button>
        </div>
        
        ${isAdmin ? `
        <div class="card">
          <i class="bx bxs-user-detail"></i>
          <h3>Usuarios</h3>
          <p>Gestión de usuarios, permisos y roles del sistema</p>
          <button class="btn-card" data-module="users">
            <span>Acceder al módulo</span>
            <i class='bx bx-right-arrow-alt'></i>
          </button>
        </div>
        ` : ''}
        
        <div class="card">
          <i class="bx bxs-report"></i>
          <h3>Informes</h3>
          <p>Generación de reportes, estadísticas y análisis de datos</p>
          <button class="btn-card" data-module="reports">
            <span>Acceder al módulo</span>
            <i class='bx bx-right-arrow-alt'></i>
          </button>
        </div>
      </div>
      
      <div class="quick-stats">
        <h2 class="section-title">Resumen</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <i class='bx bxs-calendar'></i>
            </div>
            <div class="stat-content">
              <span class="stat-value">Junio 2025</span>
              <span class="stat-label">Periodo actual</span>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <i class='bx bxs-file'></i>
            </div>
            <div class="stat-content">
              <span class="stat-value">0</span>
              <span class="stat-label">Proyectos activos</span>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <i class='bx bxs-user'></i>
            </div>
            <div class="stat-content">
              <span class="stat-value">0</span>
              <span class="stat-label">Usuarios registrados</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

/**
 * Configura los eventos del dashboard
 */
function setupDashboardEvents() {
  // Toggle del sidebar simplificado y más robusto
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.querySelector('.sidebar');
  
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', function() {
      // Toggle de la clase en el body
      document.body.classList.toggle('sidebar-collapsed');
      
      // Cambia el icono según el estado
      if (document.body.classList.contains('sidebar-collapsed')) {
        this.innerHTML = '<i class="bx bx-menu"></i>';
      } else {
        this.innerHTML = '<i class="bx bx-x"></i>';
      }
    });
    
    // Establecer icono inicial
    if (document.body.classList.contains('sidebar-collapsed')) {
      sidebarToggle.innerHTML = '<i class="bx bx-menu"></i>';
    } else {
      sidebarToggle.innerHTML = '<i class="bx bx-x"></i>';
    }
  }
  
  // No necesitamos verificar el estado inicial del sidebar,
  // ya que el CSS se encargará de posicionar correctamente el botón toggle

  // Eventos para los botones de módulos
  document.querySelectorAll('.btn-card').forEach(btn => {
    btn.addEventListener('click', () => {
      const module = btn.dataset.module;
      navigateToModule(module);
    });
  });
  
  // Enlaces del sidebar
  document.querySelectorAll('.menu a').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      
      // Si no es un enlace externo (#)
      if (href === '#') {
        e.preventDefault();
        
        // Toggle del submenu si existe
        const parent = link.parentElement;
        const submenu = parent.querySelector('.submenu');
        if (submenu) {
          parent.classList.toggle('open');
        }
      }
    });
  });
  
  // Botón de logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      authService.logout();
      window.location.href = 'index.html';
    });
  }
  
  // Enlace a gestión de usuarios - solo visible para administradores
  const userManagementLink = document.getElementById('userManagementLink');
  if (userManagementLink) {
    // Recuperar información de usuario y verificar roles manualmente
    const userData = JSON.parse(localStorage.getItem(CONFIG.STORAGE.USER_KEY) || '{}');
    console.log('Verificando acceso a gestión de usuarios:', userData);
    
    // Verificar si es usuario administrador (ID 1 o tiene rol ADMIN)
    const isAdmin = userData.id === 1 || userData.id === '1' || 
                    (userData.roles && userData.roles.some(role => 
                      (typeof role === 'string' && role === 'ADMIN') || 
                      (role && role.name === 'ADMIN')
                    ));
                    
    console.log('¿Es administrador?', isAdmin);
    
    // Siempre mostrar el enlace para propósitos de depuración
    userManagementLink.addEventListener('click', (e) => {
      e.preventDefault();
      
      if (isAdmin) {
        console.log('Accediendo a gestión de usuarios como administrador');
        navigateToModule('users');
      } else {
        console.log('Acceso denegado a gestión de usuarios');
        showNotification('No tienes permisos para acceder a la gestión de usuarios', 'error');
      }
    });
    
    // Si no es administrador, al menos agregar una marca visual
    if (!isAdmin) {
      userManagementLink.style.opacity = '0.7';
      userManagementLink.setAttribute('title', 'Solo disponible para administradores');
    }
  }
}

/**
 * Navega a un módulo específico
 * @param {string} moduleName - Nombre del módulo
 */
function navigateToModule(moduleName) {
  showLoader();
  
  // Oculta todas las secciones
  document.querySelectorAll('section[id]').forEach(section => {
    section.style.display = 'none';
  });
  
  // Muestra la sección correspondiente o cárgala si no existe
  switch (moduleName) {
    case 'users':
      // Verificar si el usuario tiene permisos de administrador directamente desde localStorage
      try {
        const userData = JSON.parse(localStorage.getItem(CONFIG.STORAGE.USER_KEY) || '{}');
        console.log('Datos de usuario para verificación de acceso:', userData);
        
        // Consideramos administrador si:
        // 1. El ID es 1 (sabemos que este usuario es administrador)
        // 2. O tiene explícitamente el rol ADMIN
        const isAdmin = userData.id === 1 || userData.id === '1' || 
                      (userData.roles && userData.roles.some(role => 
                        (typeof role === 'string' && role === 'ADMIN') || 
                        (role && role.name === 'ADMIN')
                      ));
        
        console.log('¿Es administrador para acceso al módulo?', isAdmin);
        
        // Si no es admin, denegar acceso
        if (!isAdmin) {
          showNotification('No tienes permisos para acceder a la gestión de usuarios', 'error');
          document.getElementById('dashboardHome').style.display = 'block';
          hideLoader();
          return;
        }
        
        // Continuar si es admin - permitimos el acceso
        console.log('Acceso permitido al módulo de usuarios');
      } catch (error) {
        console.error('Error al verificar permisos:', error);
        // En caso de error, permitimos el acceso (para depuración)
      }
      
      // Importación dinámica del módulo de usuarios
      import('../users/users.js')
        .then(module => {
          module.loadUserManagement();
          hideLoader();
        })
        .catch(error => {
          console.error('Error al cargar el módulo de usuarios:', error);
          showNotification('Error al cargar el módulo de usuarios', 'error');
          hideLoader();
        });
      break;
      
    case 'budgets':
      // Placeholder para futura implementación
      document.getElementById('dashboardHome').style.display = 'block';
      showNotification('Módulo de presupuestos en desarrollo', 'info');
      hideLoader();
      break;
      
    case 'masterdata':
      // Placeholder para futura implementación
      document.getElementById('dashboardHome').style.display = 'block';
      showNotification('Módulo de datos maestros en desarrollo', 'info');
      hideLoader();
      break;
      
    case 'reports':
      // Placeholder para el módulo de informes
      document.getElementById('dashboardHome').style.display = 'block';
      showNotification('Módulo de informes en desarrollo', 'info');
      hideLoader();
      break;
      
    default:
      // Vuelve al dashboard principal
      document.getElementById('dashboardHome').style.display = 'block';
      hideLoader();
  }
}
