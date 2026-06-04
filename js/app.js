// js/app.js
// Main file: routing, navbar, toast, modal helpers

// ---- ROUTER ----
// navigate() is called from anywhere to change the "page"

function navigate(page) {
  const user = getSession();

  // Guard: if not logged in, always go to login
  if (!user && page !== 'login') {
    renderLogin();
    return;
  }

  // Guard: collaborator cannot access admin pages
  // (in this app the only real "admin" page is projects with full CRUD,
  //  but we render a limited version for collaborators so we allow it)
  if (page === 'login' && user) {
    // Already logged in, redirect to dashboard
    navigate('dashboard');
    return;
  }

  // Render the right page
  if (page === 'login')     renderLogin();
  if (page === 'dashboard') renderDashboard();
  if (page === 'projects')  renderProjects();
}

// ---- NAVBAR ----

function showNavbar(user) {
  const navbar = document.getElementById('navbar');
  navbar.classList.remove('hidden');
  document.getElementById('nav-username').textContent = `${user.name} (${user.role})`;
}

// ---- MODAL HELPERS ----

function showModal(html) {
  // Remove any existing modal first
  closeModal();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'modal-overlay';

  // Close when clicking the background
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  overlay.innerHTML = `<div class="modal">${html}</div>`;
  document.body.appendChild(overlay);
}

function closeModal() {
  const existing = document.getElementById('modal-overlay');
  if (existing) existing.remove();
}

// ---- TOAST ----

function showToast(message, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.remove('hidden');

  // Auto-hide after 3 seconds
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

// ---- APP INIT ----
// This runs when the page loads

function init() {
  const user = getSession();

  if (user) {
    // Session exists → restore navbar and go to dashboard
    showNavbar(user);
    navigate('dashboard');
  } else {
    // No session → show login
    navigate('login');
  }
}

// Start the app
init();
