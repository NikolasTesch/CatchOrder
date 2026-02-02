// --- Logic for Login Form ---
const loginForm = document.getElementById('loginForm') as HTMLFormElement;
const usernameInput = document.getElementById('username') as HTMLInputElement;
const passwordInput = document.getElementById('password') as HTMLInputElement;
const errorMessage = document.getElementById('errorMessage') as HTMLElement;
const errorText = document.getElementById('errorText') as HTMLElement;
const submitBtn = document.getElementById('submitBtn') as HTMLButtonElement;
const togglePasswordBtn = document.getElementById(
  'togglePasswordBtn',
) as HTMLButtonElement;

// Toggle Password Visibility
if (togglePasswordBtn && passwordInput) {
  togglePasswordBtn.addEventListener('click', () => {
    const type =
      passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    const iconSpan = togglePasswordBtn.querySelector('span');
    if (iconSpan) {
      iconSpan.textContent =
        type === 'password' ? 'visibility_off' : 'visibility';
    }
  });
}

// Manual Validation & Submission
if (loginForm) {
  loginForm.addEventListener('submit', (e: Event) => {
    e.preventDefault();

    // Clear previous states
    errorMessage.classList.remove('visible');
    usernameInput.classList.remove('input-error');
    passwordInput.classList.remove('input-error');

    const usernameVal = usernameInput.value.trim();
    const passwordVal = passwordInput.value;

    let isValid = true;
    let errors: string[] = [];

    // Validate Username (Non-empty)
    if (!usernameVal) {
      usernameInput.classList.add('input-error');
      errors.push('O usuário é obrigatório.');
      isValid = false;
    }

    // Validate Password (Min 6 chars)
    if (passwordVal.length < 6) {
      passwordInput.classList.add('input-error');
      errors.push('A senha deve ter no mínimo 6 caracteres.');
      isValid = false;
    }

    if (!isValid) {
      errorText.textContent = errors[0]; // Show first error
      errorMessage.classList.add('visible');
      return;
    }

    // Simulate Server Request
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    setTimeout(() => {
      // Simulate success for demo
      const randomSuccess = true; // FORCEI SUCESSO PARA TESTE

      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;

      if (randomSuccess) {
        // REDIRECIONAMENTO AQUI:
        // Vai para a pasta 'gest_main' que está uma pasta acima (..)
        window.location.href = '../gest_main/gestMain.html';
      } else {
        errorMessage.classList.add('visible');
        errorText.textContent = 'Credenciais inválidas. Tente novamente.';
        usernameInput.classList.add('input-error');
        passwordInput.classList.add('input-error');
      }
    }, 1500);
  });
}

// Remove errors on input
[usernameInput, passwordInput].forEach((input) => {
  if (input) {
    input.addEventListener('input', () => {
      if (input.classList.contains('input-error')) {
        input.classList.remove('input-error');
        errorMessage.classList.remove('visible');
      }
    });
  }
});

// --- Logic for Modals ---
(window as any).openModal = function (modalId: string): void {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
};

(window as any).closeModal = function (modalId: string): void {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
};

document.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    const activeModals = document.querySelectorAll('.modal.active');
    activeModals.forEach((modal) => {
      (window as any).closeModal(modal.id);
    });
  }
});

(window as any).handleDemoSubmit = function (e: Event): void {
  e.preventDefault();
  const demoBtn = document.getElementById('demoSubmitBtn') as HTMLButtonElement;
  const demoForm = document.getElementById(
    'demoRequestForm',
  ) as HTMLFormElement;

  if (!demoBtn) return;

  const originalText = demoBtn.textContent;
  demoBtn.textContent = 'Enviando...';
  demoBtn.disabled = true;
  demoBtn.style.opacity = '0.7';

  setTimeout(() => {
    alert('Solicitação enviada com sucesso! Entraremos em contato em breve.');
    (window as any).closeModal('demoModal');
    if (demoForm) demoForm.reset();

    demoBtn.textContent = originalText;
    demoBtn.disabled = false;
    demoBtn.style.opacity = '1';
  }, 1500);
};
