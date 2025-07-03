// src/services/auth.js

import { api } from './api.js';
import { store } from '../core/store.js';
import { CONFIG } from '../core/config.js';

/**
 * Servicio para gestionar la autenticación
 */
class AuthService {
  /**
   * Inicia sesión de un usuario
   * @param {string} username - Nombre de usuario
   * @param {string} password - Contraseña
   * @returns {Promise<Object>} Datos del usuario autenticado
   */
  async login(username, password) {
    try {
      const data = await api.post('/api/auth/login', { username, password });
      
      // Debug - Analizar la respuesta del login
      console.log('Respuesta del login:', data);
      
      // Verifica que tengamos un token válido
      if (!data || !data.accessToken) {
        throw new Error('Respuesta de autenticación inválida del servidor');
      }
      
      // Guarda el token en localStorage
      localStorage.setItem(CONFIG.STORAGE.TOKEN_KEY, data.accessToken);
      
      // Analizar la estructura de los roles
      let userRoles = [];
      if (data.roles) {
        // Si roles es un array directo
        if (Array.isArray(data.roles)) {
          userRoles = data.roles;
          console.log('Roles (array):', userRoles);
        } else {
          // Si es un objeto o string, intentar adaptarlo
          console.log('Roles (no array):', data.roles);
          try {
            if (typeof data.roles === 'string') {
              // Si es un string, intentar parsearlo como JSON
              userRoles = JSON.parse(data.roles);
            } else {
              // Si es un objeto, usarlo directamente
              userRoles = [data.roles];
            }
          } catch (e) {
            console.error('Error al parsear roles:', e);
            userRoles = [];
          }
        }
      }
      
      // Asegurar que tengamos la información de administrador si corresponde
      // Si sabemos que el usuario con ID 1 es administrador, asegurarlo
      if (data.userId === 1) {
        console.log('Usuario ID 1 detectado, asegurando rol de administrador');
        const hasAdminRole = userRoles.some(role => 
          (typeof role === 'string' && role === 'ADMIN') || 
          (role && role.name === 'ADMIN')
        );
        
        if (!hasAdminRole) {
          console.log('Agregando rol de administrador manualmente');
          userRoles.push({ id: 1, name: 'ADMIN' });
        }
      }
      
      // Guarda información del usuario en un solo objeto
      const userData = {
        id: data.userId || '',
        username: data.username || username,
        email: data.email || '',
        roles: userRoles
      };
      
      localStorage.setItem(CONFIG.STORAGE.USER_KEY, JSON.stringify(userData));
      
      // Actualiza el estado global
      store.setState({
        user: userData,
        isAuthenticated: true
      });
      
      return userData;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      
      // Limpia cualquier dato de sesión que pudiera haber quedado
      localStorage.removeItem(CONFIG.STORAGE.TOKEN_KEY);
      localStorage.removeItem(CONFIG.STORAGE.USER_KEY);
      
      // Asegura que el usuario no quede autenticado en caso de error
      store.setState({
        user: null,
        isAuthenticated: false
      });
      
      // Enriquecemos el error con información más detallada para el usuario
      if (error.message && (
          error.message.includes('401') || 
          error.message.includes('Unauthorized') || 
          error.message.includes('credentials')
        )) {
        throw new Error('Credenciales incorrectas. Por favor, verifique su nombre de usuario y contraseña.');
      } else if (error.message === 'Failed to fetch' || 
                (error.message && error.message.includes('NetworkError'))) {
        throw new Error('No se pudo conectar con el servidor. Por favor, verifique su conexión a internet.');
      } else if (error.message && error.message.includes('timeout')) {
        throw new Error('La solicitud ha tardado demasiado. Por favor, inténtelo de nuevo más tarde.');
      } else {
        throw new Error(error.message || 'Error al iniciar sesión. Por favor, intente nuevamente.');
      }
    }
  }

  /**
   * Cierra la sesión del usuario actual
   */
  logout() {
    // Limpia localStorage
    localStorage.removeItem(CONFIG.STORAGE.TOKEN_KEY);
    localStorage.removeItem(CONFIG.STORAGE.USER_KEY);
    
    // Actualiza el estado global
    store.setState({
      user: null,
      isAuthenticated: false
    });
  }

  /**
   * Comprueba si hay una sesión activa
   * @returns {boolean} true si hay sesión, false en caso contrario
   */
  checkSession() {
    try {
      const token = localStorage.getItem(CONFIG.STORAGE.TOKEN_KEY);
      const userDataStr = localStorage.getItem(CONFIG.STORAGE.USER_KEY);
      
      if (!token || !userDataStr) {
        return false;
      }
      
      console.log('Datos de usuario en localStorage:', userDataStr);
      
      const userData = JSON.parse(userDataStr);
      console.log('Sesión recuperada:', userData);
      
      // Asegurarnos que haya información de roles
      if (!userData.roles || !Array.isArray(userData.roles) || userData.roles.length === 0) {
        console.log('No hay roles en la sesión recuperada');
        
        // Si es el usuario con ID 1 y no tiene roles, agregar el rol de administrador
        if (userData.id === 1 || userData.id === '1') {
          console.log('Agregando rol de administrador para el usuario ID 1');
          userData.roles = [{ id: 1, name: 'ADMIN' }];
        }
      } else {
        console.log('Roles recuperados:', userData.roles);
      }
      
      // Actualiza el estado global
      store.setState({
        user: userData,
        isAuthenticated: true
      });
      
      return true;
    } catch (error) {
      console.error('Error al comprobar la sesión:', error);
      this.logout();
      return false;
    }
  }

  /**
   * Verifica si el usuario actual tiene un rol específico
   * @param {string} roleName - Nombre del rol a verificar
   * @returns {boolean} True si el usuario tiene el rol, false en caso contrario
   */
  hasRole(roleName) {
    const { user } = store.getState();
    
    // Debug logs para analizar los roles
    console.log('Verificando rol:', roleName);
    console.log('Usuario actual:', user);
    
    // Si no hay usuario o roles, retorna false
    if (!user) {
      console.log('No hay usuario autenticado');
      return false;
    }
    
    // Intentar obtener los roles desde localStorage si no están en el estado
    let userRoles = user.roles;
    if (!userRoles || !Array.isArray(userRoles) || userRoles.length === 0) {
      try {
        const userDataStr = localStorage.getItem(CONFIG.STORAGE.USER_KEY);
        if (userDataStr) {
          const userData = JSON.parse(userDataStr);
          userRoles = userData.roles || [];
          console.log('Roles obtenidos desde localStorage:', userRoles);
        }
      } catch (error) {
        console.error('Error al obtener roles desde localStorage:', error);
      }
    }
    
    // Si aún no hay roles, retornar false
    if (!userRoles || !Array.isArray(userRoles) || userRoles.length === 0) {
      console.log('No hay roles disponibles');
      return false;
    }
    
    // Analizar la estructura de roles y buscar el rol solicitado
    console.log('Estructura de roles:', JSON.stringify(userRoles));
    
    // Verificar si alguno de los roles coincide con el solicitado
    const hasRole = userRoles.some(role => {
      // El rol puede ser un objeto con propiedades o simplemente un string
      if (typeof role === 'string') {
        return role === roleName;
      } else if (role && typeof role === 'object') {
        return role.name === roleName;
      }
      return false;
    });
    
    console.log(`¿Tiene el rol ${roleName}?:`, hasRole);
    return hasRole;
  }
  
  /**
   * Verifica si el usuario actual es administrador
   * @returns {boolean} True si el usuario es administrador, false en caso contrario
   */
  isAdmin() {
    // Intentar verificar directamente desde localStorage por si acaso
    try {
      const userDataStr = localStorage.getItem(CONFIG.STORAGE.USER_KEY);
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        const roles = userData.roles || [];
        
        // Verificar si alguno de los roles es ADMIN
        for (const role of roles) {
          if ((typeof role === 'string' && role === 'ADMIN') || 
              (typeof role === 'object' && role.name === 'ADMIN')) {
            console.log('Es administrador (verificado desde localStorage)');
            return true;
          }
        }
      }
    } catch (error) {
      console.error('Error al verificar rol de administrador desde localStorage:', error);
    }
    
    // Si no se encontró en localStorage, usar el método normal
    return this.hasRole('ADMIN');
  }
}

export const authService = new AuthService();
