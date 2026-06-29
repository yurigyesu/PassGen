const keyInput = document.getElementById('keyInput');
const ivInput = document.getElementById('ivInput');
const ivPanel = document.getElementById('ivPanel');
const ivToggleBtn = document.getElementById('ivToggleBtn');
const ivToggleIcon = document.getElementById('ivToggleIcon');
const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const encryptBtn = document.getElementById('encryptBtn');
const decryptBtn = document.getElementById('decryptBtn');
const clearBtn = document.getElementById('clearBtn');
const copyResultBtn = document.getElementById('copyResultBtn');
const fileInput = document.getElementById('fileInput');
const downloadBtn = document.getElementById('downloadBtn');

const NULL_IV = CryptoJS.enc.Utf8.parse('\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0');

function getKey() {
  const raw = keyInput.value;
  if (!raw) throw new Error('비밀키를 입력하세요.');
  return CryptoJS.enc.Utf8.parse(raw.padEnd(16, ' ').slice(0, 16));
}

function getKeyAliStyle() {
  const raw = keyInput.value;
  if (!raw) throw new Error('비밀키를 입력하세요.');
  let padded = raw;
  while (padded.length < 16) padded += '\0';
  if (padded.length > 16) padded = padded.substring(0, 16);
  return CryptoJS.enc.Utf8.parse(padded);
}

function getIv() {
  const raw = ivInput.value;
  if (raw) {
    return CryptoJS.enc.Utf8.parse(raw.padEnd(16, ' ').slice(0, 16));
  }
  return CryptoJS.lib.WordArray.random(16);
}

function wordArrayToBase64(wordArray) {
  return CryptoJS.enc.Base64.stringify(wordArray);
}

function base64ToWordArray(base64) {
  return CryptoJS.enc.Base64.parse(base64);
}

function encrypt() {
  try {
    const key = getKey();
    const iv = getIv();
    const plain = inputText.value;
    if (!plain) throw new Error('암호화할 문자열을 입력하세요.');

    const encrypted = CryptoJS.AES.encrypt(plain, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    const ivBase64 = wordArrayToBase64(iv);
    const cipherBase64 = encrypted.ciphertext.toString(CryptoJS.enc.Base64);
    const result = ivBase64 + ':' + cipherBase64;

    outputText.value = result;
    ivInput.value = CryptoJS.enc.Utf8.stringify(iv);
    showToast('암호화가 완료되었습니다.');
  } catch (err) {
    showToast('암호화 실패: ' + err.message);
  }
}

function decrypt() {
  try {
    const input = inputText.value.trim();
    if (!input) throw new Error('복호화할 문자열을 입력하세요.');

    let key, iv, cipherBase64;

    if (input.includes(':')) {
      const parts = input.split(':');
      key = getKey();
      iv = base64ToWordArray(parts[0]);
      cipherBase64 = parts[1];
    } else {
      const rawIv = ivInput.value;
      if (rawIv) {
        key = getKey();
        iv = CryptoJS.enc.Utf8.parse(rawIv.padEnd(16, ' ').slice(0, 16));
      } else {
        key = getKeyAliStyle();
        iv = NULL_IV;
      }
      cipherBase64 = input;
    }

    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: base64ToWordArray(cipherBase64)
    });

    const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    const result = decrypted.toString(CryptoJS.enc.Utf8);
    if (!result) throw new Error('복호화 결과가 없습니다. 키 또는 IV를 확인하세요.');

    outputText.value = result;
    showToast('복호화가 완료되었습니다.');
  } catch (err) {
    showToast('복호화 실패: ' + err.message);
  }
}

function toggleIvPanel() {
  const isHidden = ivPanel.style.display === 'none';
  ivPanel.style.display = isHidden ? 'block' : 'none';
  ivToggleBtn.setAttribute('aria-expanded', String(isHidden));
  ivToggleIcon.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
}

function clearAll() {
  keyInput.value = '';
  ivInput.value = '';
  inputText.value = '';
  outputText.value = '';
  fileInput.value = '';
}

function downloadResult() {
  const content = outputText.value;
  if (!content) {
    showToast('다운로드할 결과가 없습니다.');
    return;
  }
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'encrypted.aes';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('파일이 다운로드되었습니다.');
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    inputText.value = e.target.result;
    showToast('파일을 불러왔습니다.');
  };
  reader.onerror = () => showToast('파일 읽기에 실패했습니다.');
  reader.readAsText(file);
}

function init() {
  renderNav('encrypt');
  encryptBtn.addEventListener('click', encrypt);
  decryptBtn.addEventListener('click', decrypt);
  clearBtn.addEventListener('click', clearAll);
  copyResultBtn.addEventListener('click', () => copyToClipboard(outputText.value, '결과가 복사되었습니다.'));
  downloadBtn.addEventListener('click', downloadResult);
  fileInput.addEventListener('change', handleFileUpload);
  ivToggleBtn.addEventListener('click', toggleIvPanel);
}

init();
