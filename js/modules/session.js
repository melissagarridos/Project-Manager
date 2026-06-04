// js/modules/session.js
// Handles saving/loading user from localStorage

function saveSession(user) {
  localStorage.setItem('currentUser', JSON.stringify(user));
}

function getSession() {
  const stored = localStorage.getItem('currentUser');
  return stored ? JSON.parse(stored) : null;
}

function clearSession() {
  localStorage.removeItem('currentUser');
}

function isLoggedIn() {
  return getSession() !== null;
}

function isManager() {
  const user = getSession();
  return user && user.role === 'manager';
}

function isCollaborator() {
  const user = getSession();
  return user && user.role === 'collaborator';
}
