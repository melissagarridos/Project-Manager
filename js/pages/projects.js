// js/pages/projects.js
// Shows project list with CRUD (manager) or status update (collaborator)

// We keep projects in memory so we can filter without re-fetching
let allProjects = [];

async function renderProjects() {
  const user = getSession();
  const app  = document.getElementById('app');

  app.innerHTML = `<div class="loader">Loading projects...</div>`;

  try {
    allProjects = await getProjects();
    displayProjects(allProjects);
  } catch (err) {
    app.innerHTML = `<p style="color:red">Error loading projects. Is json-server running?</p>`;
  }
}

// ---- DISPLAY ----

function displayProjects(projects) {
  const user = getSession();
  const app  = document.getElementById('app');

  // Collaborators only see their own projects
  let visibleProjects = projects;
  if (isCollaborator()) {
    visibleProjects = projects.filter(p => p.assignedTo === user.id);
  }

  // Build the add button (manager only)
  const addButton = isManager()
    ? `<button class="btn btn-success" onclick="openCreateModal()">+ New Project</button>`
    : '';

  // Build each project card
  const cards = visibleProjects.length === 0
    ? `<div class="empty-state"><p>No projects found.</p></div>`
    : visibleProjects.map(p => buildProjectCard(p)).join('');

  app.innerHTML = `
    <div class="page-header">
      <h2 class="page-title" style="margin:0">Projects</h2>
      ${addButton}
    </div>

    <!-- Search & filter -->
    <div class="filters">
      <input
        type="text"
        id="search-input"
        placeholder="Search by name..."
        oninput="filterProjects()"
      />
      <select id="status-filter" onchange="filterProjects()">
        <option value="">All statuses</option>
        <option>Active</option>
        <option>In Progress</option>
        <option>Finished</option>
        <option>Pending</option>
      </select>
    </div>

    <div class="projects-grid" id="projects-grid">
      ${cards}
    </div>
  `;
}

function buildProjectCard(project) {
  const user = getSession();

  // Manager actions: edit + delete
  const managerActions = isManager() ? `
    <button class="btn btn-warning btn-sm" onclick="openEditModal(${project.id})">Edit</button>
    <button class="btn btn-danger btn-sm"  onclick="confirmDelete(${project.id})">Delete</button>
  ` : '';

  // Collaborator can only update status of their own projects
  const collaboratorAction = (isCollaborator() && project.assignedTo === user.id) ? `
    <select class="filters" onchange="handleStatusChange(${project.id}, this.value)"
      style="padding:4px 8px; font-size:0.82rem; border-radius:6px; border:1px solid #cbd5e1;">
      <option ${project.status === 'Active'      ? 'selected' : ''}>Active</option>
      <option ${project.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
      <option ${project.status === 'Finished'    ? 'selected' : ''}>Finished</option>
      <option ${project.status === 'Pending'     ? 'selected' : ''}>Pending</option>
    </select>
  ` : '';

  return `
    <div class="project-card" id="card-${project.id}">
      <h3>${project.name}</h3>
      <p>${project.description}</p>
      <div>${getBadge(project.status)}</div>
      <div class="project-meta">Created: ${project.createdAt}</div>
      <div class="project-actions">
        ${managerActions}
        ${collaboratorAction}
      </div>
    </div>
  `;
}

// ---- FILTER ----

function filterProjects() {
  const search = document.getElementById('search-input').value.toLowerCase();
  const status = document.getElementById('status-filter').value;

  let filtered = allProjects;

  if (isCollaborator()) {
    const user = getSession();
    filtered = filtered.filter(p => p.assignedTo === user.id);
  }

  if (search) {
    filtered = filtered.filter(p => p.name.toLowerCase().includes(search));
  }

  if (status) {
    filtered = filtered.filter(p => p.status === status);
  }

  const grid = document.getElementById('projects-grid');
  if (grid) {
    grid.innerHTML = filtered.length === 0
      ? `<div class="empty-state"><p>No projects match your search.</p></div>`
      : filtered.map(p => buildProjectCard(p)).join('');
  }
}

// ---- COLLABORATOR STATUS UPDATE ----

async function handleStatusChange(id, newStatus) {
  try {
    await updateProject(id, { status: newStatus });
    // Update in memory too
    const idx = allProjects.findIndex(p => p.id === id);
    if (idx !== -1) allProjects[idx].status = newStatus;
    showToast('Status updated!', 'success');
  } catch (err) {
    showToast('Error updating status', 'error');
  }
}

// ---- CREATE MODAL ----

function openCreateModal() {
  showModal(`
    <h3>New Project</h3>
    <div class="form-group">
      <label>Name</label>
      <input type="text" id="f-name" placeholder="Project name" />
      <span class="error-msg" id="err-name">Name is required</span>
    </div>
    <div class="form-group">
      <label>Description</label>
      <textarea id="f-desc" placeholder="Brief description"></textarea>
    </div>
    <div class="form-group">
      <label>Status</label>
      <select id="f-status">
        <option>Active</option>
        <option>In Progress</option>
        <option>Pending</option>
        <option>Finished</option>
      </select>
    </div>
    <div class="form-group">
      <label>Assigned To (user id)</label>
      <input type="number" id="f-assigned" placeholder="e.g. 2" />
    </div>
    <div class="modal-actions">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn btn-success" onclick="handleCreate()">Create</button>
    </div>
  `);
}

async function handleCreate() {
  const name     = document.getElementById('f-name').value.trim();
  const desc     = document.getElementById('f-desc').value.trim();
  const status   = document.getElementById('f-status').value;
  const assigned = parseInt(document.getElementById('f-assigned').value);

  if (!name) {
    document.getElementById('err-name').style.display = 'block';
    return;
  }

  const newProject = {
    name,
    description: desc,
    status,
    assignedTo: assigned || null,
    createdAt: new Date().toISOString().split('T')[0]
  };

  try {
    const created = await createProject(newProject);
    allProjects.push(created);
    closeModal();
    displayProjects(allProjects);
    showToast('Project created!', 'success');
  } catch (err) {
    showToast('Error creating project', 'error');
  }
}

// ---- EDIT MODAL ----

function openEditModal(id) {
  const project = allProjects.find(p => p.id === id);
  if (!project) return;

  showModal(`
    <h3>Edit Project</h3>
    <div class="form-group">
      <label>Name</label>
      <input type="text" id="f-name" value="${project.name}" />
    </div>
    <div class="form-group">
      <label>Description</label>
      <textarea id="f-desc">${project.description}</textarea>
    </div>
    <div class="form-group">
      <label>Status</label>
      <select id="f-status">
        <option ${project.status === 'Active'      ? 'selected':''}>Active</option>
        <option ${project.status === 'In Progress' ? 'selected':''}>In Progress</option>
        <option ${project.status === 'Pending'     ? 'selected':''}>Pending</option>
        <option ${project.status === 'Finished'    ? 'selected':''}>Finished</option>
      </select>
    </div>
    <div class="form-group">
      <label>Assigned To (user id)</label>
      <input type="number" id="f-assigned" value="${project.assignedTo || ''}" />
    </div>
    <div class="modal-actions">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn btn-warning" onclick="handleEdit(${id})">Save</button>
    </div>
  `);
}

async function handleEdit(id) {
  const name     = document.getElementById('f-name').value.trim();
  const desc     = document.getElementById('f-desc').value.trim();
  const status   = document.getElementById('f-status').value;
  const assigned = parseInt(document.getElementById('f-assigned').value);

  if (!name) {
    showToast('Name cannot be empty', 'error');
    return;
  }

  const updates = { name, description: desc, status, assignedTo: assigned || null };

  try {
    const updated = await updateProject(id, updates);
    // Update in memory
    const idx = allProjects.findIndex(p => p.id === id);
    if (idx !== -1) allProjects[idx] = updated;
    closeModal();
    displayProjects(allProjects);
    showToast('Project updated!', 'success');
  } catch (err) {
    showToast('Error updating project', 'error');
  }
}

// ---- DELETE ----

function confirmDelete(id) {
  const project = allProjects.find(p => p.id === id);
  if (!project) return;

  showModal(`
    <h3>Delete Project</h3>
    <p style="margin-bottom:20px; color:#64748b">
      Are you sure you want to delete <strong>${project.name}</strong>? This cannot be undone.
    </p>
    <div class="modal-actions">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn btn-danger" onclick="handleDelete(${id})">Delete</button>
    </div>
  `);
}

async function handleDelete(id) {
  try {
    await deleteProject(id);
    allProjects = allProjects.filter(p => p.id !== id);
    closeModal();
    displayProjects(allProjects);
    showToast('Project deleted', 'success');
  } catch (err) {
    showToast('Error deleting project', 'error');
  }
}
