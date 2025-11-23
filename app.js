// Simple auth stored client-side (no backend).
// Change or extend 'users' if you want new demo accounts.
const users = {
  "admin": "1234",
  "user": "pass"
};

function requireLogin() {
  if (!localStorage.getItem('quiz_logged_in')) {
    window.location.href = 'index.html';
  }
}

function isLoggedIn() {
  return !!localStorage.getItem('quiz_logged_in');
}

document.addEventListener('DOMContentLoaded', () => {
  // index.html login
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      const u = document.getElementById('username').value.trim();
      const p = document.getElementById('password').value.trim();
      if (users[u] && users[u] === p) {
        localStorage.setItem('quiz_logged_in', 'true');
        localStorage.setItem('quiz_user', u);
        window.location.href = 'dashboard.html';
      } else {
        document.getElementById('loginError').textContent = 'Invalid username or password';
      }
    });
  }

  // logout (dashboard)
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('quiz_logged_in');
      localStorage.removeItem('quiz_user');
      window.location.href = 'index.html';
    });
  }

  // End quiz button (quiz.html)
  const endBtn = document.getElementById('endBtn');
  if (endBtn) {
    endBtn.addEventListener('click', () => {
      if (confirm('End quiz and view results?')) {
        finishQuizAndShowResults();
      }
    });
  }

  // Back to dashboard from results
  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => window.location.href = 'dashboard.html');
  }
});
