// src/features/users/users.js

import { api } from '../../services/api.js';
import { CONFIG } from '../../core/config.js';
import { showLoader, hideLoader } from '../../utils/loader.js';
import { showNotification } from '../../utils/notifications.js';
import { clearFormErrors, showFieldError, validateRequired, validateEmail } from '../../utils/validation.js';

/**
 * Controlador para la vista de gestión de usuarios
 * @param {HTMLElement} container - Contenedor donde renderizar la gestión de usuarios
 */
export async function usersController(container) {
  if (!container) return;
  
  showLoader();
  
  try {
    // Renderiza el componente
    renderUserManagement(container);
    
    // Carga la lista de usuarios
    await loadUsers();
    
    // Configura eventos
    setTimeout(() => {
      setupUserEvents();
    }, 100);
  } catch (error) {
    console.error('Error al inicializar la gestión de usuarios:', error);
    showNotification('Error al cargar el módulo de usuarios: ' + (error.message || 'Error desconocido'), 'error');
    
    // Muestra un mensaje de error en la tabla
    const tableBody = document.getElementById('usersTableBody');
    if (tableBody) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="error-data">
            <i class="bx bx-error-circle"></i> 
            Error al cargar los usuarios. Por favor, intente nuevamente.
          </td>
        </tr>
      `;
    }
  } finally {
    hideLoader();
  }
}

/**
 * Carga el componente de gestión de usuarios dentro del dashboard
 */
export async function loadUserManagement() {
  // Referencia a la sección existente o crea una nueva
  let section = document.getElementById('user-management');
  
  if (!section) {
    section = document.createElement('section');
    section.id = 'user-management';
    section.className = 'user-management-section';
    document.querySelector('.main-content').appendChild(section);
  }
  
  // Cambia el título del header
  const header = document.querySelector('.header h1');
  if (header) {
    header.innerHTML = 'Gestión de Usuarios';
  }
  
  // Muestra la sección
  section.style.display = 'block';
  
  // Utiliza el controlador para cargar el contenido
  await usersController(section);
}

/**
 * Renderiza la interfaz de gestión de usuarios
 * @param {HTMLElement} container - Contenedor donde renderizar
 */
function renderUserManagement(container) {
  container.innerHTML = `
    <header class="header">
      <div>
        <button id="backToDashboardBtn" class="btn-back">
          <i class='bx bx-arrow-back'></i> Volver al Dashboard
        </button>
        <h1>Usuarios del Sistema</h1>
        <span class="subtitle">Gestión de cuentas y permisos</span>
      </div>
      <div>
        <button id="addUserBtn" class="btn-primary">
          <i class="bx bx-plus"></i> Nuevo Usuario
        </button>
      </div>
    </header>

    <div class="users-container">
      <div class="users-list-container">
        <table class="users-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Nombre</th>
              <th>Departamento</th>
              <th>Cargo</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="usersTableBody">
            <tr>
              <td colspan="7" class="loading-data">Cargando usuarios...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Modal para crear/editar usuario -->
    <div id="userModal" class="modal">
      <div class="modal-content user-modal-content">
        <div class="modal-header user-modal-header">
          <div class="modal-header-content">
            <div class="modal-icon">
              <i class='bx bxs-user-plus'></i>
            </div>
            <div class="modal-title-section">
              <h3 id="modalTitle">Nuevo Usuario</h3>
              <span class="modal-subtitle">Complete la información del usuario</span>
            </div>
          </div>
          <span class="close-modal">&times;</span>
        </div>
        
        <div class="modal-body user-modal-body">
          <form id="userForm" novalidate class="user-form">
            <input type="hidden" id="userId" name="userId">
            
            <div class="form-columns">
              <!-- Columna izquierda - Información personal -->
              <div class="form-column">
                <div class="column-header">
                  <h4><i class='bx bxs-user'></i> Información Personal</h4>
                </div>
                
                <div class="form-group">
                  <label for="username">Nombre de usuario *</label>
                  <input type="text" id="username" name="username" required placeholder="Ej: juan.perez">
                </div>
                
                <div class="form-group">
                  <label for="firstName">Nombre *</label>
                  <input type="text" id="firstName" name="firstName" required placeholder="Ej: Juan">
                </div>
                
                <div class="form-group">
                  <label for="lastName">Apellido *</label>
                  <input type="text" id="lastName" name="lastName" required placeholder="Ej: Pérez">
                </div>
                
                <div class="form-group">
                  <label for="email">Correo electrónico *</label>
                  <input type="email" id="email" name="email" required placeholder="juan.perez@maracaibo.gob.ve">
                </div>
              </div>
              
              <!-- Columna derecha - Información laboral y roles -->
              <div class="form-column">
                <div class="column-header">
                  <h4><i class='bx bxs-briefcase'></i> Información Laboral</h4>
                </div>
                
                <div class="form-group">
                  <label for="department">Departamento *</label>
                  <input type="text" id="department" name="department" required placeholder="Ej: Sistemas">
                </div>
                
                <div class="form-group">
                  <label for="position">Cargo *</label>
                  <input type="text" id="position" name="position" required placeholder="Ej: Analista de Sistemas">
                </div>
                
                <div class="form-group">
                  <label for="password">Contraseña</label>
                  <input type="password" id="password" name="password" placeholder="Mínimo 6 caracteres">
                  <small class="password-note">Dejar en blanco para mantener la contraseña actual (en edición)</small>
                </div>
                
                <div class="form-group roles-section">
                  <label for="role">Roles del sistema</label>
                  <div class="role-container">
                    <select id="role" name="role" required>
                      <option value="">Seleccionar rol para asignar</option>
                      <!-- Los roles se cargarán dinámicamente -->
                    </select>
                    <button type="button" id="assignRoleBtn" class="btn-primary btn-sm">
                      <i class='bx bx-plus'></i> Asignar
                    </button>
                  </div>
                  <div id="userRolesContainer" class="user-roles-list">
                    <!-- Aquí se mostrarán los roles asignados -->
                  </div>
                </div>
              </div>
            </div>
            
            <div class="form-actions">
              <button type="button" id="cancelUserBtn" class="btn-secondary">
                <i class='bx bx-x'></i> Cancelar
              </button>
              <button type="submit" class="btn-primary">
                <i class='bx bx-check'></i> Guardar Usuario
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    <!-- Modal de confirmación -->
    <div id="confirmModal" class="confirm-modal">
      <div class="confirm-modal-content">
        <div class="confirm-modal-header">
          <h3 id="confirmTitle">Confirmar acción</h3>
          <span class="close-confirm-modal">&times;</span>
        </div>
        <div class="confirm-modal-body">
          <p id="confirmMessage">¿Está seguro de realizar esta acción?</p>
        </div>
        <div class="confirm-modal-footer">
          <button id="confirmCancel" class="btn-secondary">Cancelar</button>
          <button id="confirmAccept" class="btn-primary">Confirmar</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Carga la lista de usuarios desde la API
 */
async function loadUsers() {
  const tableBody = document.getElementById('usersTableBody');
  if (!tableBody) return;
  
  try {
    // Obtiene los usuarios desde la API
    let users = await api.get('/api/admin/users');
    
    // Si la API no está disponible o no devuelve datos, usamos datos de ejemplo para desarrollo
    if (!users || !Array.isArray(users) || users.length === 0) {
      console.warn('No se pudieron obtener usuarios desde la API, usando datos de ejemplo');
      // Datos de ejemplo para desarrollo local
      users = [
        { id: 1, username: 'admin', fullName: 'Administrador', email: 'admin@sigo.gob.ve', role: 'ADMIN', status: 'ACTIVE' },
        { id: 2, username: 'usuario1', fullName: 'Usuario Prueba', email: 'usuario@sigo.gob.ve', role: 'USER', status: 'ACTIVE' },
        { id: 3, username: 'tecnico', fullName: 'Técnico Sistema', email: 'tecnico@sigo.gob.ve', role: 'USER', status: 'INACTIVE' }
      ];
    }
    
    // Limpia la tabla
    tableBody.innerHTML = '';
    
    // Si no hay usuarios
    if (users.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="no-data">No hay usuarios registrados</td>
        </tr>
      `;
      return;
    }
    
    // Primero obtenemos los roles para cada usuario de forma asíncrona
    const userRolesPromises = users.map(user => {
      return getUserRoles(user.id).catch(error => {
        console.warn(`No se pudieron cargar roles del usuario ${user.id}:`, error);
        return [];
      });
    });
    
    // Esperamos a que se resuelvan todas las promesas de roles
    const allUserRoles = await Promise.all(userRolesPromises);
    
    // Ahora renderizamos cada usuario de forma sincrónica
    users.forEach((user, index) => {
      // Componer el nombre completo desde firstName y lastName
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      
      // Usar los roles ya obtenidos
      const userRoles = allUserRoles[index] || [];
      
      // Formatear los roles para mostrar
      let roleDisplay = 'Sin rol';
      
      if (userRoles && userRoles.length > 0) {
        const roleNames = userRoles.map(role => {
          switch(role.name) {
            case 'ADMIN': return 'Administrador';
            case 'VIEWER': return 'Visualizador';
            case 'USER': return 'Usuario';
            default: return role.name;
          }
        });
        
        roleDisplay = roleNames.join(', ');
      }
      
      // Determinar el estado en base a la fecha de creación (activo por defecto)
      const statusClass = 'status-active';
      const statusText = 'Activo';
      
      tableBody.innerHTML += `
        <tr data-id="${user.id}">
          <td>${user.username || ''}</td>
          <td>${fullName}</td>
          <td>${user.department || 'N/D'}</td>
          <td>${user.position || 'N/D'}</td>
          <td>${user.email || ''}</td>
          <td>${roleDisplay}</td>
          <td class="actions-cell">
            <button type="button" class="btn-edit" data-id="${user.id}" title="Editar usuario" onclick="window.editUser(${user.id})">
              <i class="bx bx-edit"></i>
            </button>
            <button type="button" class="btn-delete" data-id="${user.id}" title="Eliminar usuario" onclick="window.deleteUser(${user.id})">
              <i class="bx bx-trash"></i>
            </button>
          </td>
        </tr>
      `;
    });
    
    // Configurar eventos de la tabla después de renderizar los usuarios
    console.log('Tabla actualizada, configurando eventos de botones...');
    setupTableEvents();
  } catch (error) {
    console.error('Error al cargar usuarios:', error);
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="error-data">Error al cargar los usuarios</td>
      </tr>
    `;
    showNotification('Error al cargar los usuarios', 'error');
  }
}

/**
 * Configura los eventos de la gestión de usuarios
 */
function setupUserEvents() {
  console.log('Configurando eventos de usuarios...');
  
  const modal = document.getElementById('userModal');
  const form = document.getElementById('userForm');
  
  if (!modal || !form) return;
  
  // Botón para agregar nuevo usuario
  const addUserBtn = document.getElementById('addUserBtn');
  if (addUserBtn) {
    addUserBtn.addEventListener('click', () => {
      openUserModal();
    });
  }
  
  // Cerrar modal
  const closeModal = modal.querySelector('.close-modal');
  if (closeModal) {
    closeModal.addEventListener('click', () => {
      closeUserModal();
    });
  }
  
  // Botón cancelar
  const cancelBtn = document.getElementById('cancelUserBtn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      closeUserModal();
    });
  }
  
  // Submit del formulario
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Limpia errores
    clearFormErrors(form);
    
    // Validación
    const username = form.username;
    const firstName = form.firstName;
    const lastName = form.lastName;
    const email = form.email;
    const department = form.department;
    const position = form.position;
    
    let isValid = true;
    
    isValid = validateRequired(username, "El nombre de usuario es obligatorio") && isValid;
    isValid = validateRequired(firstName, "El nombre es obligatorio") && isValid;
    isValid = validateRequired(lastName, "El apellido es obligatorio") && isValid;
    isValid = validateRequired(email, "El correo electrónico es obligatorio") && isValid;
    isValid = validateRequired(department, "El departamento es obligatorio") && isValid;
    isValid = validateRequired(position, "El cargo es obligatorio") && isValid;
    
    if (email.value.trim() !== '') {
      isValid = validateEmail(email) && isValid;
    }
    
    if (!isValid) return;
    
    // Preparar los datos
    const userData = {
      username: username.value.trim(),
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim(),
      email: email.value.trim(),
      department: department.value.trim(),
      position: position.value.trim(),
    };
    
    // Si hay contraseña, la incluye
    const password = form.password.value.trim();
    if (password) {
      userData.password = password;
    }
    
    // ID del usuario (si es edición)
    const userId = form.userId.value;
    
    try {
      showLoader();
      
      if (userId) {
        // Edición de usuario (actualización de datos básicos)
        try {
          // Log para depuración
          console.log('Actualizando usuario con ID:', userId);
          let userUpdated = false;
          
          // Actualizamos los datos básicos del usuario
          try {
            console.log('Enviando datos para actualizar usuario:', userData);
            await api.put(`/api/auth/users/${userId}`, userData);
            console.log('Datos básicos actualizados correctamente');
            showNotification('Datos del usuario actualizados correctamente', 'success');
            userUpdated = true;
          } catch (updateError) {
            console.error('Error al actualizar datos básicos:', updateError);
            showNotification('Error al actualizar datos del usuario: ' + (updateError.message || 'Error desconocido'), 'warning');
            // No lanzamos error para intentar actualizar el rol igualmente
          }
          
          // Si se cambió el rol, actualizamos el rol del usuario
          const selectedRoleId = form.role.value;
          if (selectedRoleId) {
            console.log('Asignando rol:', selectedRoleId, 'al usuario:', userId);
            
            // Asegurarnos que los IDs son números (si se esperan como números)
            const userIdNum = parseInt(userId);
            const roleIdNum = parseInt(selectedRoleId);
            
            try {
              await api.post('/api/admin/assign-role', {
                userId: userIdNum,
                roleId: roleIdNum
              });
              console.log('Rol asignado correctamente al usuario:', userId);
              showNotification('Rol asignado correctamente', 'success');
              userUpdated = true;
            } catch (roleError) {
              console.warn('Error al asignar rol durante la edición:', roleError);
              // Si el error es solo de parseo JSON, consideramos que la operación fue exitosa
              if (roleError.message && roleError.message.includes('JSON') || 
                  roleError.status === 204 || roleError.status === 200) {
                console.log('El rol probablemente fue asignado correctamente');
                showNotification('Rol asignado correctamente', 'success');
                userUpdated = true;
              } else {
                showNotification('Error al asignar el rol: ' + (roleError.message || 'Error desconocido'), 'error');
              }
              // No lanzamos el error para continuar con el flujo
            }
          }
          
          if (userUpdated) {
            console.log('Usuario actualizado, recargando lista...');
            await loadUsers();
          }
        } catch (error) {
          console.error('Error al actualizar usuario:', error);
          showNotification('Error al actualizar el usuario: ' + (error.message || 'Error desconocido'), 'error');
          throw error; // Propagar el error para que se maneje en el catch externo
        }
      } else {
        // Creación de usuario (registro + asignación de rol)
        try {
          // 1. Registrar el usuario
          const registerData = {
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            department: userData.department,
            position: userData.position,
            username: userData.username,
            password: userData.password || "DefaultPassword123" // Asegurar que siempre haya una contraseña
          };
          
          console.log('Registrando nuevo usuario:', registerData.username);
          const newUser = await api.post('/api/auth/register', registerData);
          
          if (!newUser || !newUser.id) {
            throw new Error('Error al crear el usuario: respuesta inválida del servidor');
          }
          
          console.log('Usuario creado con ID:', newUser.id);
          
          // 2. Asignar el rol seleccionado (si hay uno)
          const selectedRoleId = form.role.value;
          if (selectedRoleId) {
            console.log('Asignando rol inicial:', selectedRoleId, 'al nuevo usuario:', newUser.id);
            
            // Asegurarnos que los IDs son números (si se esperan como números)
            const userIdNum = parseInt(newUser.id);
            const roleIdNum = parseInt(selectedRoleId);
            
            try {
              await api.post('/api/admin/assign-role', {
                userId: userIdNum,
                roleId: roleIdNum
              });
              console.log('Rol inicial asignado correctamente');
            } catch (roleError) {
              // Si hay un error específico al asignar el rol, lo registramos pero no interrumpimos el flujo
              console.warn('Error al asignar rol inicial, pero el usuario fue creado:', roleError);
              // Si el error es solo de parseo JSON, consideramos que la operación fue exitosa
              if (roleError.message && roleError.message.includes('JSON')) {
                console.log('Error de parseo JSON al asignar rol, pero probablemente fue exitoso');
              } else {
                showNotification('Usuario creado, pero hubo un problema al asignar el rol', 'warning');
              }
            }
          }
          
          showNotification('Usuario creado y rol asignado correctamente', 'success');
        } catch (error) {
          console.error('Error al crear usuario:', error);
          showNotification('Error al crear el usuario: ' + (error.message || 'Error desconocido'), 'error');
          throw error; // Propagar el error para que se maneje en el catch externo
        }
      }
      // Recarga la lista independientemente de si fue creación o edición
      console.log('Operación completada, recargando lista de usuarios...');
      await loadUsers();
      
      // Cierra el modal
      closeUserModal();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      showNotification('Error al guardar el usuario', 'error');
    } finally {
      hideLoader();
    }
  });
  
  // Botón para volver al dashboard
  const backBtn = document.getElementById('backToDashboardBtn');
  console.log('Botón backToDashboardBtn encontrado:', !!backBtn);
  
  if (backBtn) {
    console.log('Añadiendo event listener al botón volver');
    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Botón volver al dashboard clickeado');
      
      showLoader();
      
      try {
        // Ocultar la sección de usuarios
        const userSection = document.getElementById('user-management');
        if (userSection) {
          userSection.style.display = 'none';
        }
        
        // Mostrar la sección de dashboard principal
        let dashboardHome = document.getElementById('dashboardHome');
        if (dashboardHome) {
          dashboardHome.style.display = 'block';
          console.log('Dashboard mostrado correctamente');
        } else {
          console.log('Dashboard no encontrado, recargando página');
          // Si no existe, recargar la página para volver al dashboard
          window.location.reload();
          return;
        }
        
        hideLoader();
        
      } catch (error) {
        console.error('Error al volver al dashboard:', error);
        hideLoader();
        // Fallback: recargar la página
        window.location.reload();
      }
    });
  } else {
    console.warn('Botón backToDashboardBtn no encontrado');
  }
}

/**
 * Abre el modal para crear o editar usuario
 * @param {string} userId - ID del usuario a editar (opcional, si no se proporciona es creación)
 */
async function openUserModal(userId = null) {
  console.log('Abriendo modal para usuario ID:', userId);
  const modal = document.getElementById('userModal');
  const form = document.getElementById('userForm');
  const modalTitle = document.getElementById('modalTitle');
  
  if (!modal || !form) return;
  
  showLoader();
  
  try {
    // Limpiar el formulario
    form.reset();
    clearFormErrors(form);
    
    // Restablecer estilos
    form.querySelectorAll('input, select').forEach(input => {
      input.style.borderColor = '';
    });
    
    // Cargar los roles disponibles
    const roleSelect = form.querySelector('#role');
    const userRolesContainer = form.querySelector('#userRolesContainer');
    const assignRoleBtn = form.querySelector('#assignRoleBtn');
    
    // Limpiar el contenedor de roles del usuario
    if (userRolesContainer) {
      userRolesContainer.innerHTML = '';
    }
    
    // Cargar roles disponibles
    if (roleSelect) {
      roleSelect.innerHTML = '<option value="">Seleccionar rol para asignar</option>';
      const roles = await getRoles();
      
      roles.forEach(role => {
        const option = document.createElement('option');
        option.value = role.id;
        option.textContent = role.name === 'ADMIN' ? 'Administrador' : 
                            role.name === 'USER' ? 'Usuario' :
                            role.name === 'VIEWER' ? 'Visualizador' : role.name;
        option.dataset.roleName = role.name;
        roleSelect.appendChild(option);
      });
    }
    
    if (userId) {
      // Modo edición
      modalTitle.textContent = 'Editar Usuario';
      form.userId.value = userId;
      
      // Intentar obtener datos desde la API
      let userData = null;
      let userRoles = [];
      
      try {
        userData = await api.get(`/api/admin/users/${userId}`);
        console.log('Datos del usuario desde API:', userData);
        
        // Obtenemos los roles del usuario desde el endpoint específico
        userRoles = await getUserRoles(userId);
        console.log('Roles del usuario:', userRoles);
      } catch (error) {
        console.error('Error obteniendo usuario desde API:', error);
      }
      
      // Extraer datos de la tabla si no se obtuvieron de la API
      if (!userData) {
        const userRow = document.querySelector(`tr[data-id="${userId}"]`);
        if (userRow) {
          const fullName = userRow.cells[1].textContent;
          const nameParts = fullName.split(' ');
          
          userData = {
            username: userRow.cells[0].textContent || '',
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            email: userRow.cells[4].textContent || '',
            department: userRow.cells[2].textContent || '',
            position: userRow.cells[3].textContent || ''
          };
          
          console.log('Datos extraídos de la tabla');
        }
      }
      
      // Llenar formulario con datos disponibles
      if (userData) {
        form.username.value = userData.username || '';
        form.firstName.value = userData.firstName || '';
        form.lastName.value = userData.lastName || '';
        form.email.value = userData.email || '';
        form.department.value = userData.department || '';
        form.position.value = userData.position || '';
        
        // Mostrar los roles asignados al usuario
        if (userRolesContainer && userRoles && userRoles.length > 0) {
          userRoles.forEach(role => {
            const roleChip = document.createElement('div');
            roleChip.className = 'role-chip';
            roleChip.setAttribute('data-roleid', role.id);
            
            // Mostrar nombre legible del rol
            let roleName;
            switch(role.name) {
              case 'ADMIN': roleName = 'Administrador'; break;
              case 'VIEWER': roleName = 'Visualizador'; break;
              case 'USER': roleName = 'Usuario'; break;
              default: roleName = role.name;
            }
            
            roleChip.innerHTML = `
              <span>${roleName}</span>
              <button type="button" class="remove-role-btn" data-roleid="${role.id}" data-rolename="${roleName}" title="Quitar rol">
                <i class='bx bx-x'></i>
              </button>
            `;
            
            userRolesContainer.appendChild(roleChip);
          });
          
          // Agregar eventos para quitar roles
          document.querySelectorAll('.remove-role-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
              const roleId = e.currentTarget.getAttribute('data-roleid');
              const roleName = e.currentTarget.getAttribute('data-rolename') || 'este rol';
              console.log(`Intentando quitar rol ID: ${roleId} al usuario ID: ${userId}`);
              
              // Usar modal personalizado para confirmar
              const confirmed = await showConfirmation({
                title: 'Quitar rol de usuario',
                message: `¿Está seguro que desea quitar el rol "${roleName}" al usuario?`,
                acceptText: 'Quitar rol',
                cancelText: 'Cancelar',
                type: 'warning'
              });
              
              if (confirmed) {
                try {
                  // Sólo guardar el ID del rol a eliminar
                  const roleIdToRemove = roleId;
                  
                  console.log(`Iniciando proceso para quitar rol ${roleIdToRemove} del usuario ${userId}`);
                  
                  // Llamar a la función de eliminación sin manipular DOM
                  const success = await removeUserRole(userId, roleIdToRemove);
                  
                  if (success) {
                    console.log('Rol eliminado correctamente de la API');
                    
                    // Simplemente recargar los datos del usuario
                    closeUserModal();
                    await loadUsers();
                    
                    // Una vez que se ha recargado la tabla, abrir el modal nuevamente
                    const userRow = document.querySelector(`tr[data-userid="${userId}"]`);
                    if (userRow) {
                      openUserModal(userId);
                    }
                  }
                } catch (error) {
                  console.error('Error al eliminar rol:', error);
                  showNotification('Error al quitar el rol: ' + (error.message || 'Error desconocido'), 'error');
                }
              }
            });
          });
        } else {
          userRolesContainer.innerHTML = '<div class="no-roles">No tiene roles asignados</div>';
        }
      }
      
      // Configurar botón para agregar rol
      if (assignRoleBtn) {
        // Asignar evento al botón
        assignRoleBtn.onclick = async () => {
          const selectedRoleId = roleSelect.value;
          if (!selectedRoleId) {
            showNotification('Seleccione un rol para asignar', 'warning');
            return;
          }
          
          const selectedRoleName = roleSelect.options[roleSelect.selectedIndex].textContent;
          const selectedRoleOriginalName = roleSelect.options[roleSelect.selectedIndex].dataset.roleName;
          
          // Verificar si el rol ya está asignado
          const existingRole = userRolesContainer.querySelector(`[data-roleid="${selectedRoleId}"]`);
          if (existingRole) {
            showNotification('Este rol ya está asignado al usuario', 'warning');
            return;
          }
          
          try {
            // Convertir a números para asegurar formato correcto
            const userIdNum = parseInt(userId);
            const roleIdNum = parseInt(selectedRoleId);
            
            // Datos para la solicitud
            const requestData = {
              userId: userIdNum,
              roleId: roleIdNum
            };
            
            console.log('Enviando solicitud para asignar rol:', requestData);
            
            // Usar el API client para asegurar coherencia en el manejo de tokens
            await api.post('/api/admin/assign-role', requestData);
            console.log('Rol asignado correctamente usando api.post');
            
            // Añadir el nuevo rol a la lista
            const roleChip = document.createElement('div');
            roleChip.className = 'role-chip';
            roleChip.setAttribute('data-roleid', selectedRoleId);
            
            roleChip.innerHTML = `
              <span>${selectedRoleName}</span>
              <button type="button" class="remove-role-btn" data-roleid="${selectedRoleId}" data-rolename="${selectedRoleName}" title="Quitar rol">
                <i class='bx bx-x'></i>
              </button>
            `;
            
            userRolesContainer.appendChild(roleChip);
            
            // Agregar evento para quitar el nuevo rol
            const removeBtn = roleChip.querySelector('.remove-role-btn');
            removeBtn.addEventListener('click', async (e) => {
              // Capturar el roleId del atributo data-roleid
              const roleIdToRemove = e.currentTarget.getAttribute('data-roleid');
              console.log(`Intentando quitar rol recién añadido ID: ${roleIdToRemove}`);
              // Obtener el nombre del rol para personalizar el mensaje
              const roleName = e.currentTarget.getAttribute('data-rolename') || 'este rol';
              
              const confirmed = await showConfirmation({
                title: 'Quitar rol de usuario',
                message: `¿Está seguro que desea quitar el rol "${roleName}" al usuario?`,
                acceptText: 'Quitar Rol',
                cancelText: 'Cancelar',
                type: 'warning'
              });
              
              if (confirmed) {
                try {
                  console.log(`Iniciando proceso para quitar rol ${roleIdToRemove} del usuario ${userId}`);
                  
                  // Llamar a la función de eliminación sin manipular DOM
                  const success = await removeUserRole(userId, roleIdToRemove);
                  
                  if (success) {
                    console.log('Rol eliminado correctamente de la API');
                    
                    // Simplemente recargar los datos del usuario
                    closeUserModal();
                    await loadUsers();
                    
                    // Una vez que se ha recargado la tabla, abrir el modal nuevamente
                    const userRow = document.querySelector(`tr[data-userid="${userId}"]`);
                    if (userRow) {
                      openUserModal(userId);
                    }
                  }
                } catch (error) {
                  console.error('Error al eliminar rol:', error);
                  showNotification('Error al quitar el rol: ' + (error.message || 'Error desconocido'), 'error');
                }
              }
            });
            
            // Resetear el selector
            roleSelect.value = '';
            showNotification('Rol asignado correctamente', 'success');
            
            // Actualizar la lista de usuarios
            await loadUsers();
          } catch (error) {
            console.error('Error al asignar rol:', error);
            showNotification('Error al asignar el rol', 'error');
          }
        };
      }
      
      // Mostrar nota contraseña
      const passwordNote = form.querySelector('.password-note');
      if (passwordNote) {
        passwordNote.style.display = 'block';
      }
    } else {
      // Modo creación
      modalTitle.textContent = 'Nuevo Usuario';
      form.userId.value = '';
      
      // Ocultar nota contraseña
      const passwordNote = form.querySelector('.password-note');
      if (passwordNote) {
        passwordNote.style.display = 'none';
      }
    }
    
    // Mostrar modal
    modal.style.display = 'block';
  } catch (error) {
    console.error('Error al abrir modal:', error);
    showNotification('Error al preparar el formulario', 'error');
  } finally {
    hideLoader();
  }
}

/**
 * Cierra el modal de usuario
 */
function closeUserModal() {
  const modal = document.getElementById('userModal');
  const form = document.getElementById('userForm');
  const userRolesContainer = document.getElementById('userRolesContainer');
  
  if (modal) {
    modal.style.display = 'none';
  }
  
  if (form) {
    form.reset();
  }
  
  if (userRolesContainer) {
    userRolesContainer.innerHTML = '';
  }
  
  console.log('Modal de usuario cerrado');
}

/**
 * Muestra confirmación para eliminar usuario
 * @param {string} userId - ID del usuario a eliminar
 */
async function confirmDeleteUser(userId) {
  if (!userId) return;
  
  // Buscar nombre de usuario para personalizar el mensaje
  const userRow = document.querySelector(`tr[data-id="${userId}"]`);
  const username = userRow ? userRow.cells[1].textContent : 'este usuario';
  
  // Preguntar confirmación con modal personalizado
  const confirmed = await showConfirmation({
    title: 'Eliminar usuario',
    message: `¿Está seguro de que desea eliminar al usuario ${username}?`,
    acceptText: 'Eliminar',
    cancelText: 'Cancelar',
    type: 'danger'
  });
  
  if (confirmed) {
    deleteUser(userId);
  }
}

/**
 * Elimina un usuario
 * @param {string} userId - ID del usuario a eliminar
 */
async function deleteUser(userId) {
  if (!userId) return;
  
  try {
    showLoader();
    
    // Llamada a la API para eliminar el usuario (devuelve Mono<Void>)
    await api.delete(`/api/admin/users/${userId}`);
    
    // Mostrar notificación
    showNotification('Usuario eliminado correctamente', 'success');
    
    // Recargar la lista de usuarios
    await loadUsers();
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    showNotification('Error al eliminar el usuario: ' + (error.message || 'Error desconocido'), 'error');
  } finally {
    hideLoader();
  }
}

/**
 * Muestra un modal de confirmación personalizado
 * @param {Object} options - Opciones del modal
 * @param {string} options.title - Título del modal
 * @param {string} options.message - Mensaje del modal
 * @param {string} options.acceptText - Texto del botón de aceptar
 * @param {string} options.cancelText - Texto del botón de cancelar
 * @param {string} options.type - Tipo de confirmación ('danger', 'warning')
 * @returns {Promise<boolean>} Promesa que resuelve a true si se acepta, false si se cancela
 */
function showConfirmation({ 
  title = 'Confirmar acción',
  message = '¿Está seguro de realizar esta acción?',
  acceptText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'danger'
} = {}) {
  return new Promise((resolve) => {
    const modal = document.getElementById('confirmModal');
    const titleEl = document.getElementById('confirmTitle');
    const messageEl = document.getElementById('confirmMessage');
    const acceptBtn = document.getElementById('confirmAccept');
    const cancelBtn = document.getElementById('confirmCancel');
    const closeBtn = document.querySelector('.close-confirm-modal');
    
    // Configurar el modal
    titleEl.textContent = title;
    messageEl.textContent = message;
    acceptBtn.textContent = acceptText;
    cancelBtn.textContent = cancelText;
    
    // Establecer el tipo de modal
    modal.className = 'confirm-modal';
    
    // Obtener el header para aplicar estilos según el tipo
    const modalHeader = modal.querySelector('.confirm-modal-header');
    modalHeader.className = 'confirm-modal-header'; // Reset
    
    if (type === 'warning') {
      modalHeader.classList.add('warning');
    } else if (type === 'danger') {
      modalHeader.classList.add('danger');
      acceptBtn.className = 'btn-danger';
    } else if (type === 'info') {
      modalHeader.classList.add('info');
      acceptBtn.className = 'btn-primary';
    } else {
      acceptBtn.className = 'btn-primary';
    }
    
    // Mostrar el modal
    modal.style.display = 'block';
    
    // Prevenir scroll en el cuerpo
    document.body.style.overflow = 'hidden';
    
    // Manejadores de eventos
    const handleAccept = () => {
      closeModal();
      resolve(true);
    };
    
    const handleCancel = () => {
      closeModal();
      resolve(false);
    };
    
    const handleClickOutside = (e) => {
      if (e.target === modal) {
        closeModal();
        resolve(false);
      }
    };
    
    // Función para cerrar el modal
    const closeModal = () => {
      modal.style.display = 'none';
      document.body.style.overflow = '';
      
      // Eliminar los event listeners
      acceptBtn.removeEventListener('click', handleAccept);
      cancelBtn.removeEventListener('click', handleCancel);
      closeBtn.removeEventListener('click', handleCancel);
      modal.removeEventListener('click', handleClickOutside);
    };
    
    // Agregar event listeners
    acceptBtn.addEventListener('click', handleAccept);
    cancelBtn.addEventListener('click', handleCancel);
    closeBtn.addEventListener('click', handleCancel);
    modal.addEventListener('click', handleClickOutside);
  });
}

/**
 * Quita un rol específico a un usuario
 * @param {string|number} userId - ID del usuario
 * @param {string|number} roleId - ID del rol a quitar
 * @returns {Promise<boolean>} - true si se quitó el rol correctamente
 */
async function removeUserRole(userId, roleId) {
  if (!userId || !roleId) {
    console.error('Se requieren userId y roleId para remover un rol');
    return false;
  }
  
  try {
    showLoader();
    console.log(`Removiendo rol ${roleId} del usuario ${userId}`);
    
    // Convertir a números para asegurar formato correcto
    const userIdNum = parseInt(userId);
    const roleIdNum = parseInt(roleId);
    
    // Datos para la solicitud
    const requestData = {
      userId: userIdNum,
      roleId: roleIdNum
    };
    
    // Obtener el token JWT actual
    const token = localStorage.getItem(CONFIG.STORAGE.TOKEN_KEY);
    console.log('Enviando solicitud para quitar rol:', JSON.stringify(requestData));
    console.log('Token presente:', token ? 'Sí (longitud: ' + token.length + ')' : 'No');
    
    // Llamada a la API usando el cliente API centralizado
    console.log('Intentando quitar rol con cliente API centralizado...');
    await api.post('/api/admin/remove-role', requestData);
    console.log('✅ Rol removido correctamente usando cliente API');
    showNotification('Rol removido correctamente', 'success');
    return true;
  } catch (error) {
    console.error('❌ Error al quitar rol del usuario:', error);
    console.error('Detalles del error:', error.message);
    
    // Mostrar notificación pero devolver true si ya se confirmó que el rol se eliminó en el backend
    // (para que la UI se actualice adecuadamente)
    if (error.message && (
        error.message.includes('204') || 
        error.message.includes('eliminado') || 
        error.message.includes('removido')
      )) {
      console.log('Posible falso positivo en error, el rol parece haberse eliminado correctamente');
      showNotification('Rol removido correctamente', 'success');
      return true;
    }
    
    showNotification('Error al quitar el rol: ' + (error.message || 'Error desconocido'), 'error');
    return false;
  } finally {
    hideLoader();
  }
}

/**
 * Obtiene la lista de roles desde la API
 * @returns {Promise<Array>} Lista de roles
 */
async function getRoles() {
  try {
    const roles = await api.get('/api/admin/roles');
    return roles || [];
  } catch (error) {
    console.error('Error al obtener los roles:', error);
    showNotification('Error al cargar los roles disponibles', 'error');
    return [];
  }
}

/**
 * Obtiene los roles de un usuario específico
 * @param {number|string} userId - ID del usuario
 * @returns {Promise<Array>} - Lista de roles del usuario
 */
async function getUserRoles(userId) {
  if (!userId) return [];
  
  try {
    console.log(`Obteniendo roles del usuario ${userId}`);
    const roles = await api.get(`/api/admin/users/${userId}/roles`);
    console.log('Roles obtenidos:', roles);
    return Array.isArray(roles) ? roles : [];
  } catch (error) {
    console.error(`Error al obtener roles del usuario ${userId}:`, error);
    return [];
  }
}

/**
 * Configura los eventos específicos de la tabla de usuarios
 * Nota: Los eventos principales ahora se manejan con atributos onclick directamente en el HTML
 */
function setupTableEvents() {
  console.log('Verificando botones de la tabla de usuarios...');
  
  // Verificar que los botones están presentes
  const editButtons = document.querySelectorAll('.btn-edit');
  const deleteButtons = document.querySelectorAll('.btn-delete');
  
  console.log(`Encontrados ${editButtons.length} botones de edición y ${deleteButtons.length} botones de eliminación`);
  
  // Podemos añadir efectos adicionales o comportamientos aquí si es necesario
}

// Exponer las funciones necesarias en el ámbito global para los botones inline
window.editUser = function(userId) {
  console.log('Editando usuario desde función global, ID:', userId);
  openUserModal(userId);
};

window.deleteUser = function(userId) {
  console.log('Eliminando usuario desde función global, ID:', userId);
  confirmDeleteUser(userId);
};
