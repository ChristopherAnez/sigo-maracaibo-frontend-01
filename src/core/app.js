// src/core/app.js

import { initLoader, hideLoader, showLoader } from '../utils/loader.js';
import { initNotifications } from '../utils/notifications.js';
import { CONFIG } from './config.js';
import { authService } from '../services/auth.js';
import { store } from './store.js';

/**
 * Clase principal de la aplicación
 */
class App {
  constructor() {
    this.initialized = false;
  }

  /**
   * Inicializa la aplicación
   */
  async initialize() {
    if (this.initialized) return;
    
    // Inicializa componentes
    initLoader();
    initNotifications();
    
    // Muestra el loader inicial
    showLoader();
    
    // Verifica si hay una sesión activa
    const isLoggedIn = authService.checkSession();
    
    // Actualiza el estado
    store.setState({ 
      isAuthenticated: isLoggedIn,
      isInitialized: true
    });
    
    // Establece el estado inicializado
    this.initialized = true;
    
    return true;
  }
  
  /**
   * Inicializa la página de login
   */
  async initLoginPage() {
    await this.initialize();
    
    // Si ya está autenticado, redirige al dashboard
    if (store.getState().isAuthenticated) {
      window.location.href = "dashboard.html";
      return;
    }
    
    // Carga dinámicamente el módulo de login
    try {
      const { loginController } = await import('../features/login/login.js');
      const container = document.querySelector('.login-container');
      loginController(container);
    } catch (error) {
      console.error('Error al cargar el módulo de login:', error);
      hideLoader();
    }
  }
  
  /**
   * Inicializa el dashboard
   */
  async initDashboard() {
    await this.initialize();
    
    // Si no está autenticado, redirige al login
    if (!store.getState().isAuthenticated) {
      window.location.href = "index.html";
      return;
    }
    
    // Carga dinámicamente el módulo de dashboard
    try {
      const { dashboardController } = await import('../features/dashboard/dashboard.js');
      const container = document.querySelector('.main-content');
      dashboardController(container);
    } catch (error) {
      console.error('Error al cargar el dashboard:', error);
      hideLoader();
    }
  }
}

// Exporta una instancia única de la aplicación
export const app = new App();
