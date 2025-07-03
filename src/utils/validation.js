// src/utils/validation.js

/**
 * Utilidades para la validación de formularios
 */

/**
 * Muestra un error en un campo específico
 * @param {HTMLElement} input - Elemento input
 * @param {string} message - Mensaje de error
 */
export function showFieldError(input, message) {
  const box = input.parentElement;
  box.classList.add("error");
  
  // Evita duplicar mensajes de error
  if (!box.querySelector(".error-text")) {
    const span = document.createElement("span");
    span.className = "error-text";
    span.innerText = message;
    box.appendChild(span);
  }
}

/**
 * Limpia todos los errores de un formulario
 * @param {HTMLFormElement} form - Elemento form
 */
export function clearFormErrors(form) {
  form.querySelectorAll(".error").forEach(element => {
    element.classList.remove("error");
    const errorText = element.querySelector(".error-text");
    if (errorText) errorText.remove();
  });
}

/**
 * Valida un campo requerido
 * @param {HTMLInputElement} input - Elemento input
 * @param {string} message - Mensaje de error personalizado
 * @returns {boolean} - true si es válido, false si no
 */
export function validateRequired(input, message = "Este campo es obligatorio") {
  const value = input.value.trim();
  
  if (!value) {
    showFieldError(input, message);
    return false;
  }
  
  return true;
}

/**
 * Valida un email
 * @param {HTMLInputElement} input - Elemento input
 * @param {string} message - Mensaje de error personalizado
 * @returns {boolean} - true si es válido, false si no
 */
export function validateEmail(input, message = "Introduce un email válido") {
  const value = input.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(value)) {
    showFieldError(input, message);
    return false;
  }
  
  return true;
}

/**
 * Valida una contraseña por fortaleza
 * @param {HTMLInputElement} input - Elemento input
 * @param {string} message - Mensaje de error personalizado
 * @returns {boolean} - true si es válido, false si no
 */
export function validatePassword(input, message = "La contraseña debe tener al menos 8 caracteres, una mayúscula y un número") {
  const value = input.value.trim();
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  
  if (!passwordRegex.test(value)) {
    showFieldError(input, message);
    return false;
  }
  
  return true;
}

/**
 * Valida que dos contraseñas coincidan
 * @param {HTMLInputElement} input - Elemento input
 * @param {HTMLInputElement} confirmInput - Elemento input de confirmación
 * @param {string} message - Mensaje de error personalizado
 * @returns {boolean} - true si coinciden, false si no
 */
export function validatePasswordMatch(input, confirmInput, message = "Las contraseñas no coinciden") {
  if (input.value !== confirmInput.value) {
    showFieldError(confirmInput, message);
    return false;
  }
  
  return true;
}
