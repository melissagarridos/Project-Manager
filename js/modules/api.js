// js/modules/api.js
// All fetch calls to json-server go here

const API_URL = 'http://localhost:3000';

// ---- USERS ----

async function getUsers() {
  const res = await fetch(`${API_URL}/users`);
  return res.json();
}

// ---- PROJECTS ----

async function getProjects() {
  const res = await fetch(`${API_URL}/projects`);
  return res.json();
}

async function getProjectById(id) {
  const res = await fetch(`${API_URL}/projects/${id}`);
  return res.json();
}

async function createProject(data) {
  const res = await fetch(`${API_URL}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

async function updateProject(id, data) {
  const res = await fetch(`${API_URL}/projects/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

async function deleteProject(id) {
  await fetch(`${API_URL}/projects/${id}`, { method: 'DELETE' });
}
