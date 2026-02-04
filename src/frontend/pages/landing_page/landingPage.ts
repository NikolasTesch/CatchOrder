import './style.css';
import { ApiService } from '../../services/apiService';

type Nullable<T> = T | null;

function getEl<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Elemento com id="${id}" não encontrado.`);
  return el as T;
}

function qs<T extends Element>(
  selector: string,
  parent: ParentNode = document,
): T {
  const el = parent.querySelector(selector);
  if (!el)
    throw new Error(`Seletor "${selector}" não encontrou nenhum elemento.`);
  return el as T;
}

// ---------- Elements ----------
const loginForm = getEl<HTMLFormElement>('loginForm');
const usernameInput = getEl<HTMLInputElement>('username');
const passwordInput = getEl<HTMLInputElement>('password');
const errorMessage = getEl<HTMLDivElement>('errorMessage');
const errorText = getEl<HTMLSpanElement>('errorText');
const submitBtn = getEl<HTMLButtonElement>('submitBtn');
const togglePasswordBtn = getEl<HTMLButtonElement>('togglePasswordBtn');

// ---------- Limits ----------
const MAX_LEN = 20;
const MIN_PASS = 6;

// garante pelo JS também (caso alguém remova maxlength no HTML)
[usernameInput, passwordInput].forEach((inp) => {
  inp.maxLength = MAX_LEN;
  inp.addEventListener('input', () => {
    if (inp.value.length > MAX_LEN) inp.value = inp.value.slice(0, MAX_LEN);
  });
});

// ---------- Password toggle ----------
togglePasswordBtn.addEventListener('click', () => {
  const currentType = passwordInput.getAttribute('type');
  const nextType = currentType === 'password' ? 'text' : 'password';

  passwordInput.setAttribute('type', nextType);

  const iconSpan = qs<HTMLSpanElement>('span', togglePasswordBtn);
  iconSpan.textContent =
    nextType === 'password' ? 'visibility_off' : 'visibility';
});

// ---------- Anti spam submit (client-side) ----------
let isSubmitting = false;

// cooldown simples
const COOLDOWN_MS = 2000;
let lastSubmitAt = 0;

// limite de tentativas por janela (anti click-spam)
const WINDOW_MS = 60_000; // 1 min
const MAX_ATTEMPTS_PER_WINDOW = 10;
const attempts: number[] = [];

function canAttemptNow(): { ok: true } | { ok: false; reason: string } {
  const now = Date.now();

  // remove tentativas antigas
  while (attempts.length && now - attempts[0] > WINDOW_MS) attempts.shift();

  if (now - lastSubmitAt < COOLDOWN_MS) {
    const wait = Math.ceil((COOLDOWN_MS - (now - lastSubmitAt)) / 1000);
    return { ok: false, reason: `Aguarde ${wait}s antes de tentar novamente.` };
  }

  if (attempts.length >= MAX_ATTEMPTS_PER_WINDOW) {
    return {
      ok: false,
      reason: 'Muitas tentativas. Aguarde 1 minuto e tente novamente.',
    };
  }

  return { ok: true };
}

function setLoading(loading: boolean): void {
  if (loading) {
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    submitBtn.setAttribute('aria-disabled', 'true');
  } else {
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
    submitBtn.removeAttribute('aria-disabled');
  }
}

// ---------- Login submit + validation ----------
loginForm.addEventListener('submit', (e: SubmitEvent) => {
  e.preventDefault();

  // trava re-entrância
  if (isSubmitting) return;

  // anti spam/cooldown
  const check = canAttemptNow();
  if (!check.ok) {
    errorText.textContent = check.reason;
    errorMessage.classList.add('visible');
    return;
  }

  errorMessage.classList.remove('visible');
  usernameInput.classList.remove('input-error');
  passwordInput.classList.remove('input-error');

  const usernameVal = usernameInput.value.trim().slice(0, MAX_LEN);
  const passwordVal = passwordInput.value.slice(0, MAX_LEN);

  // mantém valores limitados
  usernameInput.value = usernameVal;
  passwordInput.value = passwordVal;

  let isValid = true;
  const errors: string[] = [];

  if (!usernameVal) {
    usernameInput.classList.add('input-error');
    errors.push('O usuário é obrigatório.');
    isValid = false;
  }

  if (passwordVal.length < MIN_PASS) {
    passwordInput.classList.add('input-error');
    errors.push(`A senha deve ter no mínimo ${MIN_PASS} caracteres.`);
    isValid = false;
  }

  if (!isValid) {
    errorText.textContent = errors[0] ?? 'Dados inválidos.';
    errorMessage.classList.add('visible');
    return;
  }

  // registra tentativa
  const now = Date.now();
  attempts.push(now);
  lastSubmitAt = now;

  isSubmitting = true;
  setLoading(true);

  ApiService.post<any>('/auth/login', {
    username: usernameVal,
    password: passwordVal,
  })
    .then((data) => {
      // Login Success
      setLoading(false);
      isSubmitting = false;

      // Store auth data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect based on role
      if (data.user.role === 'waiter') {
        window.location.href = 'waiterMain.html';
      } else {
        // Admin or Manager -> Gestão
        window.location.href = 'gestMain.html';
      }
    })
    .catch((err) => {
      // Login Failed
      setLoading(false);
      isSubmitting = false;

      errorMessage.classList.add('visible');
      errorText.textContent =
        err.message || 'Credenciais inválidas. Tente novamente.';
      usernameInput.classList.add('input-error');
      passwordInput.classList.add('input-error');
    });
});

([usernameInput, passwordInput] as HTMLInputElement[]).forEach((input) => {
  input.addEventListener('input', () => {
    if (input.classList.contains('input-error')) {
      input.classList.remove('input-error');
      errorMessage.classList.remove('visible');
    }
  });
});
