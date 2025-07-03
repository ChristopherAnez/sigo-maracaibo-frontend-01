// src/core/router.js

import { store } from './store.js';
import { dashboardController } from '../features/dashboard/dashboard.js';
import { usersController } from '../features/users/users.js';

/**
 * Router simple para manejar la navegación dentro de una SPA
 */
class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    this.rootElement = null;
  }

  /**
   * Inicializa el router en el elemento raíz
   * @param {HTMLElement} rootElement - Elemento donde se renderizará el contenido
   */
  init(rootElement) {
    if (!rootElement) throw new Error("Router requiere un elemento root válido");
    this.rootElement = rootElement;
    
    // Maneja la navegación por la historia del navegador
    window.addEventListener('popstate', () => this.handleRouteChange());
    
    // Configuración inicial
    this.handleRouteChange();
  }

  /**
   * Registra una ruta
   * @param {string} path - Ruta a registrar
   * @param {Function} handler - Función que maneja la ruta
   * @param {Object} meta - Metadatos de la ruta (título, requiereAutenticación, etc)
   */
  register(path, handler, meta = {}) {
    this.routes[path] = { handler, meta };
    return this;
  }

  /**
   * Navega a una ruta específica
   * @param {string} path - Ruta a la que navegar
   * @param {Object} params - Parámetros para la ruta
   */
  navigate(path, params = {}) {
    const fullPath = this.buildPath(path, params);
    window.history.pushState({}, '', fullPath);
    this.handleRouteChange();
  }

  /**
   * Construye una ruta con parámetros
   * @param {string} path - Ruta base
   * @param {Object} params - Parámetros
   * @returns {string} Ruta completa
   */
  buildPath(path, params) {
    if (Object.keys(params).length === 0) return path;
    
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      queryParams.append(key, value);
    });
    
    return `${path}?${queryParams.toString()}`;
  }

  /**
   * Maneja el cambio de ruta
   */
  async handleRouteChange() {
    const path = window.location.pathname;
    const route = this.routes[path] || this.routes['*']; // Fallback a ruta por defecto
    
    if (!route) {
      console.error(`Ruta no encontrada: ${path}`);
      return;
    }
    
    // Verifica si la ruta requiere autenticación
    if (route.meta.requiresAuth && !store.getState().isAuthenticated) {
      this.navigate('/login');
      return;
    }
    
    // Actualiza el estado con la ruta actual
    store.setState({ currentView: path });
    
    // Actualiza el título si está definido
    if (route.meta.title) {
      document.title = `SIGO Maracaibo - ${route.meta.title}`;
    }
    
    // Ejecuta el controlador de la ruta
    try {
      await route.handler(this.rootElement);
      this.currentRoute = path;
    } catch (error) {
      console.error(`Error al cargar la ruta ${path}:`, error);
    }
  }
}

// Instancia del router
export const router = new Router();

/**
 * Configura las rutas de la aplicación
 */
export function initializeRouter(rootElement) {
  router
    .register('/', dashboardController, { 
      title: 'Dashboard', 
      requiresAuth: true 
    })
    .register('/users', usersController, { 
      title: 'Gestión de Usuarios', 
      requiresAuth: true 
    })
    .register('*', () => {
      // Ruta por defecto, redirige al dashboard
      router.navigate('/');
    });
  
  // Inicializa el router
  router.init(rootElement);
}
