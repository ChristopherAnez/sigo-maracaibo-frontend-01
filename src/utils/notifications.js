// src/utils/notifications.js

import { CONFIG } from '../core/config.js';
import { store } from '../core/store.js';

/**
 * Muestra una notificación en forma de toast
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de notificación (success, error, warning, info)
 * @param {number} duration - Duración en milisegundos
 */
export function showNotification(message, type = 'info', duration = CONFIG.UI.TOAST_DURATION) {
  // Agrega la notificación al estado global
  const notifications = store.getState().notifications || [];
  const id = Date.now().toString();
  
  const notification = { id, message, type };
  store.setState({
    notifications: [...notifications, notification]
  });
  
  // Crea y muestra el elemento visual
  showToast(notification, duration);
  
  // Elimina la notificación después de la duración
  setTimeout(() => {
    removeNotification(id);
  }, duration);
}

/**
 * Muestra un toast visual
 * @param {Object} notification - Datos de la notificación
 * @param {number} duration - Duración en milisegundos
 */
function showToast(notification, duration) {
  // Verifica si existe el contenedor, si no lo crea
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
    `;
    document.body.appendChild(container);
  }

  // Crea el toast
  const toast = document.createElement('div');
  toast.id = `toast-${notification.id}`;
  toast.className = `toast toast-${notification.type}`;
  toast.style.cssText = `
    background-color: #fff;
    color: #333;
    padding: 12px 16px;
    margin-bottom: 10px;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    min-width: 200px;
    max-width: 400px;
    animation: fadeIn 0.3s, fadeOut 0.3s ${duration - 300}ms;
    border-left: 4px solid #ccc;
  `;

  // Configura el estilo según el tipo
  switch (notification.type) {
    case 'success':
      toast.style.borderLeftColor = '#4CAF50';
      break;
    case 'error':
      toast.style.borderLeftColor = '#F44336';
      break;
    case 'warning':
      toast.style.borderLeftColor = '#FF9800';
      break;
    case 'info':
      toast.style.borderLeftColor = '#2196F3';
      break;
  }

  // Agrega el mensaje
  toast.innerHTML = `
    <span>${notification.message}</span>
    <button aria-label="Cerrar" style="
      background: transparent;
      border: none;
      cursor: pointer;
      margin-left: auto;
      font-size: 18px;
      line-height: 1;
      padding: 0 6px;
    ">&times;</button>
  `;

  // Agrega el evento para cerrar
  toast.querySelector('button').addEventListener('click', () => {
    removeNotification(notification.id);
  });

  // Agrega el toast al contenedor
  container.appendChild(toast);
}

/**
 * Elimina una notificación por su ID
 * @param {string} id - ID de la notificación a eliminar
 */
function removeNotification(id) {
  // Elimina el elemento visual
  const toast = document.getElementById(`toast-${id}`);
  if (toast) {
    toast.classList.add('toast-hiding');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }
  
  // Actualiza el estado global
  const notifications = store.getState().notifications || [];
  store.setState({
    notifications: notifications.filter(n => n.id !== id)
  });
}

/**
 * Agrega los estilos necesarios para las animaciones de las notificaciones
 */
export function initNotifications() {
  // Agrega estilos para las animaciones
  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.innerHTML = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-10px); }
      }
      .toast-hiding {
        opacity: 0;
        transform: translateY(-10px);
        transition: opacity 0.3s, transform 0.3s;
      }
    `;
    document.head.appendChild(style);
  }
}
