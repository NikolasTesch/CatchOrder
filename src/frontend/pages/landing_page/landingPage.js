// --- Definição dos Elementos (Com proteção de tipo) ---
var loginForm = document.getElementById('loginForm');
var usernameInput = document.getElementById('username');
var passwordInput = document.getElementById('password');
var errorMessage = document.getElementById('errorMessage');
var errorText = document.getElementById('errorText');
var submitBtn = document.getElementById('submitBtn');
var togglePasswordBtn = document.getElementById('togglePasswordBtn');
// --- Lógica do Login ---
// Mostrar/Ocultar Senha
if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener('click', function () {
        var type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        var iconSpan = togglePasswordBtn.querySelector('span');
        if (iconSpan) {
            iconSpan.textContent =
                type === 'password' ? 'visibility_off' : 'visibility';
        }
    });
}
// Validação e Envio
if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        // Limpar estados anteriores
        if (errorMessage)
            errorMessage.classList.remove('visible');
        if (usernameInput)
            usernameInput.classList.remove('input-error');
        if (passwordInput)
            passwordInput.classList.remove('input-error');
        var usernameVal = usernameInput ? usernameInput.value.trim() : '';
        var passwordVal = passwordInput ? passwordInput.value : '';
        var isValid = true;
        var errors = [];
        // Validação Simples
        if (!usernameVal) {
            if (usernameInput)
                usernameInput.classList.add('input-error');
            errors.push('O usuário é obrigatório.');
            isValid = false;
        }
        if (passwordVal.length < 6) {
            if (passwordInput)
                passwordInput.classList.add('input-error');
            errors.push('A senha deve ter no mínimo 6 caracteres.');
            isValid = false;
        }
        if (!isValid) {
            if (errorText)
                errorText.textContent = errors[0];
            if (errorMessage)
                errorMessage.classList.add('visible');
            return;
        }
        // Simulação de Carregamento
        if (submitBtn) {
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
        }
        setTimeout(function () {
            // SUCESSO FORÇADO PARA TESTE
            var randomSuccess = true;
            if (submitBtn) {
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
            }
            if (randomSuccess) {
                // REDIRECIONAMENTO
                window.location.href = '../gest_main/gestMain.html';
            }
            else {
                if (errorMessage)
                    errorMessage.classList.add('visible');
                if (errorText)
                    errorText.textContent = 'Credenciais inválidas.';
                if (usernameInput)
                    usernameInput.classList.add('input-error');
                if (passwordInput)
                    passwordInput.classList.add('input-error');
            }
        }, 1500);
    });
}
// Remover erros visualmente ao digitar
[usernameInput, passwordInput].forEach(function (input) {
    if (input) {
        input.addEventListener('input', function () {
            if (input.classList.contains('input-error')) {
                input.classList.remove('input-error');
                if (errorMessage)
                    errorMessage.classList.remove('visible');
            }
        });
    }
});
// --- Lógica dos Modais (Sem Logs e Sem Alerts) ---
window.openModal = function (modalId) {
    var modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
};
window.closeModal = function (modalId) {
    var modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
};
// Fechar com ESC
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        var activeModals = document.querySelectorAll('.modal.active');
        activeModals.forEach(function (modal) {
            window.closeModal(modal.id);
        });
    }
});
// Lógica do Demo (Sem Alert chato)
window.handleDemoSubmit = function (e) {
    e.preventDefault();
    var demoBtn = document.getElementById('demoSubmitBtn');
    var demoForm = document.getElementById('demoRequestForm');
    if (!demoBtn)
        return;
    var originalText = demoBtn.textContent;
    // Feedback visual no botão
    demoBtn.textContent = 'Enviando...';
    demoBtn.disabled = true;
    demoBtn.style.opacity = '0.7';
    setTimeout(function () {
        // Feedback de sucesso no botão antes de fechar
        demoBtn.textContent = 'Enviado!';
        setTimeout(function () {
            // Fecha o modal suavemente sem alert
            window.closeModal('demoModal');
            if (demoForm)
                demoForm.reset();
            // Reseta o botão
            demoBtn.textContent = originalText;
            demoBtn.disabled = false;
            demoBtn.style.opacity = '1';
        }, 500); // Espera meio segundo para o usuário ler "Enviado!"
    }, 1500);
};
