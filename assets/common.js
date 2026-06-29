function showToast(message, duration = 2000) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

async function copyToClipboard(text, successMessage = '클립보드에 복사되었습니다.') {
  try {
    await navigator.clipboard.writeText(text);
    showToast(successMessage);
    return true;
  } catch (err) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showToast(successMessage);
      return true;
    } catch (e) {
      showToast('복사에 실패했습니다.');
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

function renderNav(activePage) {
  const nav = document.getElementById('nav');
  if (!nav) return;
  nav.innerHTML = `
    <a href="../generate/" class="nav-link ${activePage === 'generate' ? 'active' : ''}">패스워드 생성</a>
    <a href="../encrypt/" class="nav-link ${activePage === 'encrypt' ? 'active' : ''}">AES 암/복호화</a>
    <button type="button" id="themeToggle" class="theme-toggle" title="테마 전환" aria-label="테마 전환">
      <span class="theme-knob"></span>
    </button>
  `;
  initThemeToggle();
}

function getPreferredTheme() {
  if (localStorage.getItem('theme')) return localStorage.getItem('theme');
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

function initThemeToggle() {
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;
  applyTheme(getPreferredTheme());
  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', next);
    applyTheme(next);
  });
}
