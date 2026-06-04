// js/modules/auth.js
// Login logic: find user in db.json and validate

async function login(email, password) {
  // Fetch all users from the API
  const users = await getUsers();

  // Find one that matches email AND password
  const found = users.find(
    (u) => u.email === email && u.password === password
  );

  if (found) {
    // Save to localStorage so the session persists
    saveSession(found);
    return found;
  }

  // Return null if credentials don't match
  return null;
}

function logout() {
  clearSession();
  // Hide navbar and go back to login
  document.getElementById('navbar').classList.add('hidden');
  navigate('login');
}
