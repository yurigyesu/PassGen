const ALL_SYMBOLS = '!"#$%\u0026\u0027()*+,-./:;<=>?@[\\]^_`{|}~';
const COMMON_SYMBOLS = '!@#$%^';

const lengthSlider = document.getElementById('lengthSlider');
const lengthValue = document.getElementById('lengthValue');
const useLower = document.getElementById('useLower');
const useUpper = document.getElementById('useUpper');
const useDigits = document.getElementById('useDigits');
const useSymbols = document.getElementById('useSymbols');
const symbolSection = document.getElementById('symbolSection');
const symbolGrid = document.getElementById('symbolGrid');
const presetCommon = document.getElementById('presetCommon');
const selectAllSymbols = document.getElementById('selectAllSymbols');
const deselectAllSymbols = document.getElementById('deselectAllSymbols');
const passwordDisplay = document.getElementById('passwordDisplay');
const regenerateBtn = document.getElementById('regenerateBtn');
const copyBtn = document.getElementById('copyBtn');
const copyIcon = document.getElementById('copyIcon');
const strengthText = document.getElementById('strengthText');

let selectedSymbols = new Set(COMMON_SYMBOLS.split(''));

function init() {
  renderNav('generate');
  renderSymbolGrid();
  updateSymbolSection();
  generatePassword();
  bindEvents();
}

function renderSymbolGrid() {
  symbolGrid.innerHTML = '';
  for (const char of ALL_SYMBOLS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'symbol-btn' + (selectedSymbols.has(char) ? ' active' : '');
    btn.textContent = char;
    btn.dataset.char = char;
    btn.addEventListener('click', () => {
      if (selectedSymbols.has(char)) {
        selectedSymbols.delete(char);
      } else {
        selectedSymbols.add(char);
      }
      renderSymbolGrid();
      generatePassword();
    });
    symbolGrid.appendChild(btn);
  }
}

function updateSymbolSection() {
  symbolSection.style.display = useSymbols.checked ? 'block' : 'none';
}

function getCharacterPool() {
  let pool = '';
  if (useLower.checked) pool += 'abcdefghijklmnopqrstuvwxyz';
  if (useUpper.checked) pool += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (useDigits.checked) pool += '0123456789';
  if (useSymbols.checked) {
    const activeSymbols = Array.from(selectedSymbols).join('');
    pool += activeSymbols;
  }
  return pool;
}

function getRequiredCharacters() {
  const required = [];
  if (useLower.checked) required.push(randomChar('abcdefghijklmnopqrstuvwxyz'));
  if (useUpper.checked) required.push(randomChar('ABCDEFGHIJKLMNOPQRSTUVWXYZ'));
  if (useDigits.checked) required.push(randomChar('0123456789'));
  if (useSymbols.checked && selectedSymbols.size > 0) {
    required.push(randomChar(Array.from(selectedSymbols).join('')));
  }
  return required;
}

function randomChar(pool) {
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return pool[array[0] % pool.length];
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(window.crypto.getRandomValues(new Uint32Array(1))[0] / (0xFFFFFFFF + 1) * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function generatePassword() {
  const length = parseInt(lengthSlider.value, 10);
  const pool = getCharacterPool();

  if (pool.length === 0) {
    passwordDisplay.innerHTML = '';
    strengthText.textContent = '사용할 문자가 없습니다.';
    strengthText.className = 'font-semibold text-red-600';
    return;
  }

  const required = getRequiredCharacters();
  const remaining = Math.max(0, length - required.length);
  const passwordChars = [...required];

  for (let i = 0; i < remaining; i++) {
    passwordChars.push(randomChar(pool));
  }

  shuffle(passwordChars);
  const password = passwordChars.join('');
  renderPassword(password);
  updateStrength(length, pool.length);
}

function renderPassword(password) {
  passwordDisplay.innerHTML = '';
  for (const char of password) {
    const span = document.createElement('span');
    span.textContent = char;
    if (/[a-zA-Z]/.test(char)) {
      span.className = 'password-char-letter';
    } else if (/\d/.test(char)) {
      span.className = 'password-char-digit';
    } else {
      span.className = 'password-char-symbol';
    }
    passwordDisplay.appendChild(span);
  }
}

function updateStrength(length, poolSize) {
  const entropy = length * Math.log2(poolSize);
  let text, colorClass;
  if (entropy < 40) {
    text = '매우 약함';
    colorClass = 'text-red-600';
  } else if (entropy < 60) {
    text = '약함';
    colorClass = 'text-orange-500';
  } else if (entropy < 80) {
    text = '보통';
    colorClass = 'text-yellow-500';
  } else if (entropy < 120) {
    text = '강함';
    colorClass = 'text-green-600';
  } else {
    text = '매우 강함';
    colorClass = 'text-green-700';
  }
  strengthText.textContent = text;
  strengthText.className = 'font-semibold ' + colorClass;
}

function bindEvents() {
  lengthSlider.addEventListener('input', () => {
    lengthValue.textContent = lengthSlider.value;
    generatePassword();
  });

  [useLower, useUpper, useDigits, useSymbols].forEach(el => {
    el.addEventListener('change', () => {
      updateSymbolSection();
      generatePassword();
    });
  });

  presetCommon.addEventListener('click', () => {
    selectedSymbols = new Set(COMMON_SYMBOLS.split(''));
    renderSymbolGrid();
    generatePassword();
  });

  selectAllSymbols.addEventListener('click', () => {
    selectedSymbols = new Set(ALL_SYMBOLS.split(''));
    renderSymbolGrid();
    generatePassword();
  });

  deselectAllSymbols.addEventListener('click', () => {
    selectedSymbols.clear();
    renderSymbolGrid();
    generatePassword();
  });

  regenerateBtn.addEventListener('click', generatePassword);

  copyBtn.addEventListener('click', async () => {
    const password = passwordDisplay.textContent;
    if (!password) return;
    const ok = await copyToClipboard(password);
    if (ok) {
      copyBtn.classList.add('btn-success');
      copyBtn.classList.remove('btn-secondary');
      copyIcon.innerHTML = '<polyline points="20 6 9 17 4 12"></polyline>';
      copyIcon.setAttribute('viewBox', '0 0 24 24');
      copyIcon.innerHTML = '<polyline points="20 6 9 17 4 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></polyline>';
      setTimeout(() => {
        copyBtn.classList.remove('btn-success');
        copyBtn.classList.add('btn-secondary');
        copyIcon.innerHTML = '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>';
      }, 1500);
    }
  });
}

init();
