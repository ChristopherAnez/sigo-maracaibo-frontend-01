// src/core/config.js

/**
 * Configuración global del sistema
 * Centraliza los parámetros de configuración para facilitar cambios
 */

export const CONFIG = {
  API: {
    BASE_URL: "http://localhost:8080", // Sin /api al final para evitar duplicación
    TIMEOUT: 10000, // 10 segundos de timeout para las peticiones
    RETRY_ATTEMPTS: 2
  },
  UI: {
    LOADER_DELAY: 1500,
    ANIMATIONS_ENABLED: true,
    TOAST_DURATION: 3000 // 3 segundos para los mensajes toast
  },
  STORAGE: {
    TOKEN_KEY: "accessToken",
    USER_KEY: "userData"
  },
  VERSION: "1.0.0"
};
