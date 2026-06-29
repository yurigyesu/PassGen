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
  `;
}
