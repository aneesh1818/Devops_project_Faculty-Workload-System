// public/js/login.js
document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const errEl    = document.getElementById('loginError');
  const btn      = document.getElementById('loginBtn');
  const btnText  = document.getElementById('btnText');
  const btnLoader = document.getElementById('btnLoader');

  if (!email || !password) {
    showError('Please enter your email and password.');
    return;
  }

  // Loading state
  btn.disabled = true;
  btnText.style.display  = 'none';
  btnLoader.style.display = 'inline';
  errEl.style.display = 'none';

  try {
    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.success) {
      window.location.href = '/dashboard';
    } else {
      showError(data.message || 'Invalid credentials. Please try again.');
    }
  } catch (err) {
    showError('Connection error. Please try again.');
  } finally {
    btn.disabled = false;
    btnText.style.display  = 'inline';
    btnLoader.style.display = 'none';
  }
});

function showError(msg) {
  const errEl = document.getElementById('loginError');
  errEl.textContent = msg;
  errEl.style.display = 'block';
}
