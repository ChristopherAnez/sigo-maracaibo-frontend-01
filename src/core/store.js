// src/core/store.js

/**
 * Sistema de gestión de estado simple para la aplicación
 * Permite compartir datos entre componentes mediante suscripción a cambios
 */

class Store {
  constructor() {
    this.state = {
      user: null,
      isAuthenticated: false,
      currentView: null,
      notifications: [],
      isLoading: false
    };
    this.listeners = [];
  }

  /**
   * Actualiza el estado de la aplicación
   * @param {Object} newState - Nuevo estado parcial
   */
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notify();
  }

  /**
   * Obtiene el estado actual
   * @returns {Object} Estado actual
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Suscribe una función al cambio de estado
   * @param {Function} listener - Función que se ejecutará cuando cambie el estado
   * @returns {Function} Función para cancelar la suscripción
   */
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notifica a todos los listeners de un cambio en el estado
   */
  notify() {
    this.listeners.forEach(listener => listener(this.state));
  }
}

export const store = new Store();
