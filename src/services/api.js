// src/services/api.js

import { CONFIG } from '../core/config.js';
import { store } from '../core/store.js';
import { showNotification } from '../utils/notifications.js';

/**
 * Cliente API centralizado para todas las peticiones al backend
 */
class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  /**
   * Obtiene los headers para las peticiones
   * @returns {Object} Headers de la petición
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };

    const token = localStorage.getItem(CONFIG.STORAGE.TOKEN_KEY);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Realiza una petición a la API
   * @param {string} endpoint - Endpoint de la API
   * @param {Object} options - Opciones de fetch
   * @returns {Promise<any>} Respuesta de la API
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const fetchOptions = {
      headers: this.getHeaders(),
      ...options
    };

    try {
      store.setState({ isLoading: true });
      
      const response = await fetch(url, fetchOptions);
      
      // Manejo de respuesta no OK (excepto 204 No Content que es un éxito sin contenido)
      if (!response.ok && response.status !== 204) {
        let errorMessage = 'Error en la solicitud';
        
        try {
          // Intenta leer el error como JSON si tiene contenido
          const contentType = response.headers.get('Content-Type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } else {
            // Si no es JSON, intenta obtener texto
            const errorText = await response.text();
            if (errorText) {
              errorMessage = errorText;
            }
          }
        } catch (parseError) {
          console.warn('Error al parsear respuesta de error:', parseError);
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        
        // Si es un error de autenticación y ya existía una sesión (token), limpia las credenciales
        if (response.status === 401 && localStorage.getItem(CONFIG.STORAGE.TOKEN_KEY)) {
          localStorage.removeItem(CONFIG.STORAGE.TOKEN_KEY);
          localStorage.removeItem(CONFIG.STORAGE.USER_KEY);
          store.setState({ isAuthenticated: false, user: null });
          
          // Muestra notificación de sesión expirada
          showNotification('Tu sesión ha expirado. Por favor inicia sesión nuevamente.', 'error');
          
          // Redirige a login solo si ya estaba autenticado
          window.location.href = 'index.html';
        }
        
        throw new Error(errorMessage);
      }

      // Si la respuesta está vacía o es 204 No Content, devuelve un objeto vacío
      if (response.status === 204) {
        return {};
      }
      
      // Intenta parsear la respuesta como JSON
      try {
        return await response.json();
      } catch (parseError) {
        console.warn('Error al parsear respuesta como JSON:', parseError);
        // Si no se puede parsear como JSON pero la respuesta fue exitosa, devolvemos un objeto vacío
        return {};
      }
    } catch (error) {
      console.error(`Error en petición a ${url}:`, error);
      throw error;
    } finally {
      store.setState({ isLoading: false });
    }
  }

  /**
   * Realiza una petición GET
   * @param {string} endpoint - Endpoint de la API
   * @param {Object} params - Parámetros de query
   * @returns {Promise<any>} Respuesta de la API
   */
  async get(endpoint, params = {}) {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    
    return this.request(url.pathname + url.search, {
      method: 'GET'
    });
  }

  /**
   * Realiza una petición POST
   * @param {string} endpoint - Endpoint de la API
   * @param {Object} data - Datos a enviar
   * @returns {Promise<any>} Respuesta de la API
   */
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  /**
   * Realiza una petición PUT
   * @param {string} endpoint - Endpoint de la API
   * @param {Object} data - Datos a enviar
   * @returns {Promise<any>} Respuesta de la API
   */
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  /**
   * Realiza una petición DELETE
   * @param {string} endpoint - Endpoint de la API
   * @returns {Promise<any>} Respuesta de la API
   */
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }
}

// Exporta una instancia única de ApiClient
export const api = new ApiClient(CONFIG.API.BASE_URL);
