// js/pages/login.js
// Renders the login form and handles submit

function renderLogin() {
  const app = document.getElementById('app');

  app.innerHTML = `
    <div class="login-wrapper">
      <div class="login-box">
        <h2>📋 ProjectHub</h2>
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="login-email" placeholder="manager@test.com" />
          <span class="error-msg" id="err-email">Please enter a valid email</span>
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" id="login-password" placeholder="••••••" />
          <span class="error-msg" id="err-password">Password is required</span>
        </div>
        <span class="error-msg" id="err-credentials" style="display:block; margin-bottom:12px">
          Invalid email or password
        </span>
        <button class="btn btn-primary" id="btn-login">Log In</button>
      </div>
    </div>
  `;

  // Hide credentials error initially
  document.getElementById('err-credentials').style.display = 'none';

  // Attach click event
  document.getElementById('btn-login').addEventListener('click', handleLogin);

  // Also allow Enter key
  document.getElementById('login-password').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleLogin();
  });
}

async function handleLogin() {
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value.trim();

  // Simple validation
  let hasError = false;

  if (!email || !email.includes('@')) {
    document.getElementById('err-email').style.display = 'block';
    hasError = true;
  } else {
    document.getElementById('err-email').style.display = 'none';
  }

  if (!password) {
    document.getElementById('err-password').style.display = 'block';
    hasError = true;
  } else {
    document.getElementById('err-password').style.display = 'none';
  }

  if (hasError) return;

  // Hide previous error
  document.getElementById('err-credentials').style.display = 'none';

  // Disable button while loading
  const btn = document.getElementById('btn-login');
  btn.disabled = true;
  btn.textContent = 'Loading...';

  try {
    const user = await login(email, password);

    if (!user) {
      document.getElementById('err-credentials').style.display = 'block';
      btn.disabled = false;
      btn.textContent = 'Log In';
      return;
    }

    // Show navbar
    showNavbar(user);
    showToast(`Welcome, ${user.name}!`, 'success');
    navigate('dashboard');

  } catch (err) {
    showToast('Could not connect to server. Is json-server running?', 'error');
    btn.disabled = false;
    btn.textContent = 'Log In';
  }
}
