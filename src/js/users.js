// src/js/users.js

// Modular: importar helpers solo si no existen en el global
import { API_BASE } from './config.js';

export function authFetch(url, options = {}) {
  const token = localStorage.getItem('accessToken');
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      'Authorization': 'Bearer ' + token,
    }
  });
}

let rolesCache = [];

// Toast/Feedback
function showToast(message, type = "success") {
  let toast = document.getElementById('appToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'appToast';
    document.body.appendChild(toast);
  }
  toast.className = `toast ${type}`;
  toast.innerText = message;
  toast.style.display = 'block';
  setTimeout(() => {
    toast.className += ' fadeout';
    setTimeout(() => {
      toast.style.display = 'none';
      toast.className = '';
      toast.innerText = '';
    }, 600);
  }, 2100);
}

// Modal Loader
function showModalLoader(active, text = "Guardando...") {
  const loader = document.getElementById('modalLoader');
  if (!loader) return;
  loader.classList.toggle('active', !!active);
  loader.querySelector('.loader-text').innerText = text;
}

// Modal Feedback
function showModalFeedback(message, type = "success") {
  const feedback = document.getElementById('modalFeedback');
  if (!feedback) return;
  feedback.innerText = message || '';
  feedback.style.display = message ? 'block' : 'none';
  feedback.className = 'modal-feedback ' + (type || 'success');
}

// Main init
export function initUserManagement() {
  document.getElementById('userManagementLink').addEventListener('click', e => {
    e.preventDefault();
    document.querySelectorAll('.main-content > section').forEach(sec => sec.style.display = 'none');
    document.getElementById('user-management').style.display = '';
    document.getElementById('dashboardHome').style.display = 'none';
    loadUsersAndRoles();
    setupBackBtn();
  });

  document.getElementById('newUserBtn').addEventListener('click', showNewUserModal);

  // Modal click fuera cierra
  window.onclick = function(event) {
    const modal = document.getElementById('userModal');
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
}

// Botón volver con ripple visual
function setupBackBtn() {
  const backBtn = document.getElementById('backToDashboardBtn');
  if (!backBtn) return;

  // Si ya tiene ripple, no duplicar
  if (!backBtn.querySelector('.ripple')) {
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    backBtn.appendChild(ripple);
  }

  backBtn.onclick = function(e) {
    const ripple = backBtn.querySelector('.ripple');
    // Calcular posición del clic dentro del botón
    const rect = backBtn.getBoundingClientRect();
    const size = Math.max(backBtn.offsetWidth, backBtn.offsetHeight);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size/2) + 'px';
    ripple.classList.add('ripple-active');
    setTimeout(() => ripple.classList.remove('ripple-active'), 400);

    document.getElementById('user-management').style.display = 'none';
    document.getElementById('dashboardHome').style.display = '';
  };
}

// Load users + roles
function loadUsersAndRoles() {
  Promise.all([
    authFetch(`${API_BASE}/admin/users`).then(r => r.json()),
    authFetch(`${API_BASE}/admin/roles`).then(r => r.json()),
  ]).then(([users, roles]) => {
    rolesCache = roles;
    console.log(users);
    renderUsersTable(users);
  }).catch(() => {
    document.getElementById('usersTableWrapper').innerHTML = "<p>Error al cargar usuarios o roles.</p>";
  });
}

// Render tabla (¡Sin fila fantasma!)
function renderUsersTable(users) {
  const wrapper = document.getElementById('usersTableWrapper');

  // Filtra solo usuarios completamente válidos (¡esto es la clave!)
  const validUsers = Array.isArray(users)
    ? users.filter(
        u => u && typeof u === 'object' && u.id && u.firstName && u.username
      )
    : [];

  if (!validUsers.length) {
    wrapper.innerHTML = "<p>No hay usuarios registrados.</p>";
    return;
  }

  let html = `<div class="responsive-table"><table class="users-table">
    <thead>
      <tr>
        <th>Nombre</th>
        <th>Email</th>
        <th>Departamento</th>
        <th>Puesto</th>
        <th>Username</th>
        <th>Roles</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      ${validUsers.map(user => `
        <tr>
          <td data-label="Nombre">${user.firstName} ${user.lastName}</td>
          <td data-label="Email">${user.email}</td>
          <td data-label="Departamento">${user.department || ''}</td>
          <td data-label="Puesto">${user.position || ''}</td>
          <td data-label="Username">${user.username}</td>
          <td data-label="Roles">${(user.roles || []).map(r => r.name).join(', ')}</td>
          <td data-label="Acciones" class="actions-cell">
            <button class="btn btn-edit" data-id="${user.id}">Editar</button>
            <button class="btn btn-delete" data-id="${user.id}">Eliminar</button>
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table></div>`;

  wrapper.innerHTML = html;

  wrapper.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => showEditUserModal(btn.dataset.id, validUsers));
  });
  wrapper.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => deleteUser(btn.dataset.id));
  });
}


// Nuevo usuario
function showNewUserModal() {
  renderUserModal("Nuevo Usuario", {}, rolesCache, saveNewUser, false);
}

// Editar usuario
function showEditUserModal(userId, users) {
  const user = users.find(u => u.id == userId);
  renderUserModal("Editar Usuario", user, rolesCache, (formData) => saveEditUser(user.id, formData, user), true);
}

// Render modal avanzado
function renderUserModal(title, user = {}, roles = [], onSave, isEdit = false) {
  const modal = document.getElementById('userModal');
  // Monta el contenido del modal
  modal.innerHTML = `
    <div class="modal-content">
      <div id="modalLoader"><div style="display:flex;flex-direction:column;align-items:center;">
        <img src="images/sun-logo.png" alt="Cargando..." class="loader-img" />
        <span class="loader-text">Guardando usuario...</span>
      </div></div>
      <div id="modalFeedback" class="modal-feedback"></div>
      <h3 id="modalTitle">${title}</h3>
      <form id="userForm" autocomplete="off">
        <div class="user-form-fields">
          <div class="form-group">
            <label for="firstName">Nombre</label>
            <input type="text" id="firstName" name="firstName" required>
          </div>
          <div class="form-group">
            <label for="lastName">Apellido</label>
            <input type="text" id="lastName" name="lastName" required>
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required>
          </div>
          <div class="form-group">
            <label for="department">Departamento</label>
            <input type="text" id="department" name="department">
          </div>
          <div class="form-group">
            <label for="position">Puesto</label>
            <input type="text" id="position" name="position">
          </div>
          <div class="form-group">
            <label for="username">Usuario</label>
            <input type="text" id="username" name="username" required>
          </div>
          <div class="form-group" id="passwordFieldGroup">
            <label for="password">Contraseña</label>
            <input type="password" id="password" name="password" ${isEdit ? "" : "required"}>
          </div>
          <div class="form-group">
            <label for="roles">Roles</label>
            <select id="roles" name="roles" multiple required>
              ${roles.map(r => `<option value="${r.id}" ${(user.roles||[]).map(u=>u.id).includes(r.id) ? 'selected' : ''}>${r.name}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-delete" id="cancelUserModal">Cancelar</button>
          <button type="submit" class="btn">${isEdit ? "Guardar Cambios" : "Crear Usuario"}</button>
        </div>
      </form>
      <button class="close-modal" id="closeUserModal" title="Cerrar">&times;</button>
    </div>
  `;
  modal.style.display = 'block';

  // Autofocus inteligente
  setTimeout(() => {
    let focusable = modal.querySelector('input[name="firstName"]');
    if (focusable) focusable.focus();
  }, 120);

  // Prellenado de campos
  modal.querySelector('[name="firstName"]').value = user.firstName || '';
  modal.querySelector('[name="lastName"]').value = user.lastName || '';
  modal.querySelector('[name="email"]').value = user.email || '';
  modal.querySelector('[name="department"]').value = user.department || '';
  modal.querySelector('[name="position"]').value = user.position || '';
  modal.querySelector('[name="username"]').value = user.username || '';
  modal.querySelector('[name="username"]').readOnly = !!user.id;
  modal.querySelector('[name="password"]').value = '';
  modal.querySelector('[name="password"]').placeholder = isEdit ? 'Dejar en blanco para no cambiar' : '';

  showModalFeedback('', 'none');
  showModalLoader(false);

  modal.querySelector('#cancelUserModal').onclick =
  modal.querySelector('#closeUserModal').onclick = () => modal.style.display = 'none';

  modal.querySelector('#userForm').onsubmit = async function(e) {
    e.preventDefault();

    if (!this.checkValidity()) {
      showModalFeedback('Por favor complete todos los campos requeridos.', 'error');
      const firstInvalid = this.querySelector(':invalid');
      if (firstInvalid) firstInvalid.focus();
      return false;
    }

    const formData = Object.fromEntries(new FormData(this));
    formData.roleIds = Array.from(this.roles.selectedOptions).map(opt => Number(opt.value));

    showModalLoader(true, user.id ? 'Actualizando usuario...' : 'Guardando usuario...');
    showModalFeedback('', 'none');

    try {
      await onSave(formData);
      showModalLoader(false);
      showToast(user.id ? 'Usuario actualizado con éxito.' : 'Usuario creado con éxito.', 'success');
      modal.style.display = 'none';
      loadUsersAndRoles();
    } catch (err) {
      showModalLoader(false);
      showModalFeedback(err?.message || 'Ocurrió un error inesperado.', 'error');
      showToast(err?.message || 'Error', 'error');
    }
    return false;
  };
}

// Guardar nuevo usuario
async function saveNewUser(formData) {
  const { firstName, lastName, email, department, position, username, password, roleIds } = formData;
  let userCreated = null;
  try {
    const res = await authFetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName, email, department, position, username, password })
    });
    if (!res.ok) throw new Error('Error al registrar usuario.');
    userCreated = await res.json();
  } catch {
    throw new Error('Error al registrar usuario.');
  }
  try {
    for (let roleId of roleIds) {
      await authFetch(`${API_BASE}/admin/assign-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userCreated.id, roleId })
      });
    }
  } catch {
    throw new Error('Usuario creado, pero error al asignar roles.');
  }
}

// Guardar edición de usuario (PUT + roles)
async function saveEditUser(userId, formData, oldUser) {
  const { firstName, lastName, email, department, position, username, password, roleIds } = formData;
  // 1. Actualizar datos del usuario usando PUT (con o sin contraseña)
  try {
    const res = await authFetch(`${API_BASE}/auth/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName, lastName, email, department, position, username,
        password: password ?? ""
      })
    });
    if (!res.ok) throw new Error('Error al actualizar usuario.');
  } catch {
    throw new Error('Error al actualizar usuario.');
  }

  // 2. Actualizar roles
  const nuevos = roleIds.map(Number);
  const actuales = (oldUser.roles || []).map(r => r.id);
  const aAgregar = nuevos.filter(r => !actuales.includes(r));
  const aQuitar = actuales.filter(r => !nuevos.includes(r));

  try {
    for (let roleId of aAgregar) {
      await authFetch(`${API_BASE}/admin/assign-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, roleId })
      });
    }
    for (let roleId of aQuitar) {
      await authFetch(`${API_BASE}/admin/remove-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, roleId })
      });
    }
  } catch {
    throw new Error('Error al actualizar roles.');
  }
}

// Eliminar usuario
function deleteUser(userId) {
  if (!confirm("¿Seguro que deseas eliminar este usuario?")) return;
  authFetch(`${API_BASE}/admin/users/${userId}`, { method: 'DELETE' })
    .then(res => {
      if (res.ok) {
        showToast("Usuario eliminado.", "success");
        loadUsersAndRoles();
      }
      else showToast("Error al eliminar usuario.", "error");
    });
}