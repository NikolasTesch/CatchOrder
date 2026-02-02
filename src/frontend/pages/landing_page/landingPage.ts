// --- Definição dos Elementos (Com proteção de tipo) ---
const loginForm = document.getElementById('loginForm') as HTMLFormElement;
const usernameInput = document.getElementById('username') as HTMLInputElement;
const passwordInput = document.getElementById('password') as HTMLInputElement;
const errorMessage = document.getElementById('errorMessage') as HTMLElement;
const errorText = document.getElementById('errorText') as HTMLElement;
const submitBtn = document.getElementById('submitBtn') as HTMLButtonElement;
const togglePasswordBtn = document.getElementById(
  'togglePasswordBtn',
) as HTMLButtonElement;

// --- Lógica do Login ---

// Mostrar/Ocultar Senha
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

// Validação e Envio
if (loginForm) {
  loginForm.addEventListener('submit', (e: Event) => {
    e.preventDefault();

    // Limpar estados anteriores
    if (errorMessage) errorMessage.classList.remove('visible');
    if (usernameInput) usernameInput.classList.remove('input-error');
    if (passwordInput) passwordInput.classList.remove('input-error');

    const usernameVal = usernameInput ? usernameInput.value.trim() : '';
    const passwordVal = passwordInput ? passwordInput.value : '';

    let isValid = true;
    let errors: string[] = [];

    // Validação Simples
    if (!usernameVal) {
      if (usernameInput) usernameInput.classList.add('input-error');
      errors.push('O usuário é obrigatório.');
      isValid = false;
    }

    if (passwordVal.length < 6) {
      if (passwordInput) passwordInput.classList.add('input-error');
      errors.push('A senha deve ter no mínimo 6 caracteres.');
      isValid = false;
    }

    if (!isValid) {
      if (errorText) errorText.textContent = errors[0];
      if (errorMessage) errorMessage.classList.add('visible');
      return;
    }

    // Simulação de Carregamento
    if (submitBtn) {
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;
    }

    setTimeout(() => {
      // SUCESSO FORÇADO PARA TESTE
      const randomSuccess = true;

      if (submitBtn) {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
      }

      if (randomSuccess) {
        // REDIRECIONAMENTO
        window.location.href = '../gest_main/gestMain.html';
      } else {
        if (errorMessage) errorMessage.classList.add('visible');
        if (errorText) errorText.textContent = 'Credenciais inválidas.';
        if (usernameInput) usernameInput.classList.add('input-error');
        if (passwordInput) passwordInput.classList.add('input-error');
      }
    }, 1500);
  });
}

// Remover erros visualmente ao digitar
[usernameInput, passwordInput].forEach((input) => {
  if (input) {
    input.addEventListener('input', () => {
      if (input.classList.contains('input-error')) {
        input.classList.remove('input-error');
        if (errorMessage) errorMessage.classList.remove('visible');
      }
    });
  }
});

// --- Lógica dos Modais (Sem Logs e Sem Alerts) ---

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

// Fechar com ESC
document.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    const activeModals = document.querySelectorAll('.modal.active');
    activeModals.forEach((modal) => {
      (window as any).closeModal(modal.id);
    });
  }
});

// Lógica do Demo (Sem Alert chato)
(window as any).handleDemoSubmit = function (e: Event): void {
  e.preventDefault();
  const demoBtn = document.getElementById('demoSubmitBtn') as HTMLButtonElement;
  const demoForm = document.getElementById(
    'demoRequestForm',
  ) as HTMLFormElement;

  if (!demoBtn) return;

  const originalText = demoBtn.textContent;
  // Feedback visual no botão
  demoBtn.textContent = 'Enviando...';
  demoBtn.disabled = true;
  demoBtn.style.opacity = '0.7';

  setTimeout(() => {
    // Feedback de sucesso no botão antes de fechar
    demoBtn.textContent = 'Enviado!';

    setTimeout(() => {
      // Fecha o modal suavemente sem alert
      (window as any).closeModal('demoModal');
      if (demoForm) demoForm.reset();

      // Reseta o botão
      demoBtn.textContent = originalText;
      demoBtn.disabled = false;
      demoBtn.style.opacity = '1';
    }, 500); // Espera meio segundo para o usuário ler "Enviado!"
  }, 1500);
};
