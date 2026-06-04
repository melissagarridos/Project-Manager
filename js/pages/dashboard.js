// js/pages/dashboard.js
// Shows stats for manager or collaborator

async function renderDashboard() {
  const user = getSession();
  const app  = document.getElementById('app');

  app.innerHTML = `<div class="loader">Loading dashboard...</div>`;

  try {
    const projects = await getProjects();

    if (isManager()) {
      renderManagerDashboard(user, projects);
    } else {
      renderCollaboratorDashboard(user, projects);
    }

  } catch (err) {
    app.innerHTML = `<p style="color:red">Error loading data. Is json-server running?</p>`;
  }
}

function renderManagerDashboard(user, projects) {
  const app = document.getElementById('app');

  const total    = projects.length;
  const active   = projects.filter(p => p.status === 'Active').length;
  const progress = projects.filter(p => p.status === 'In Progress').length;
  const finished = projects.filter(p => p.status === 'Finished').length;

  app.innerHTML = `
    <h2 class="page-title">👋 Hello, ${user.name}</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-number">${total}</div>
        <div class="stat-label">Total Projects</div>
      </div>
      <div class="stat-card green">
        <div class="stat-number">${active}</div>
        <div class="stat-label">Active</div>
      </div>
      <div class="stat-card orange">
        <div class="stat-number">${progress}</div>
        <div class="stat-label">In Progress</div>
      </div>
      <div class="stat-card red">
        <div class="stat-number">${finished}</div>
        <div class="stat-label">Finished</div>
      </div>
    </div>
    <p style="color:#64748b; font-size:0.9rem">
      You have full access to manage all projects.
      <a href="#" onclick="navigate('projects')" style="color:#3b82f6">Go to Projects →</a>
    </p>
  `;
}

function renderCollaboratorDashboard(user, projects) {
  const app = document.getElementById('app');

  // Only show projects assigned to this collaborator
  const myProjects = projects.filter(p => p.assignedTo === user.id);

  const projectRows = myProjects.length === 0
    ? `<p class="empty-state">No projects assigned to you yet.</p>`
    : myProjects.map(p => `
        <div class="project-card">
          <h3>${p.name}</h3>
          <p>${p.description}</p>
          <div>${getBadge(p.status)}</div>
          <div class="project-meta">Created: ${p.createdAt}</div>
        </div>
      `).join('');

  app.innerHTML = `
    <h2 class="page-title">👋 Hello, ${user.name}</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-number">${myProjects.length}</div>
        <div class="stat-label">My Projects</div>
      </div>
    </div>
    <h3 style="margin-bottom:16px; color:#1e293b;">My Projects</h3>
    <div class="projects-grid">
      ${projectRows}
    </div>
  `;
}

// Returns a colored badge HTML based on status
function getBadge(status) {
  const map = {
    'Active':      'badge-active',
    'In Progress': 'badge-progress',
    'Finished':    'badge-finished',
    'Pending':     'badge-pending',
  };
  const cls = map[status] || 'badge-pending';
  return `<span class="badge ${cls}">${status}</span>`;
}
