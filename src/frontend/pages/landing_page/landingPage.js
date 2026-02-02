// --- Logic for Login Form ---
var loginForm = document.getElementById('loginForm');
var usernameInput = document.getElementById('username');
var passwordInput = document.getElementById('password');
var errorMessage = document.getElementById('errorMessage');
var errorText = document.getElementById('errorText');
var submitBtn = document.getElementById('submitBtn');
var togglePasswordBtn = document.getElementById('togglePasswordBtn');
// Toggle Password Visibility
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
// Manual Validation & Submission
if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        // Clear previous states
        errorMessage.classList.remove('visible');
        usernameInput.classList.remove('input-error');
        passwordInput.classList.remove('input-error');
        var usernameVal = usernameInput.value.trim();
        var passwordVal = passwordInput.value;
        var isValid = true;
        var errors = [];
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
        setTimeout(function () {
            // Simulate success for demo
            var randomSuccess = true; // FORCEI SUCESSO PARA TESTE
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            if (randomSuccess) {
                // REDIRECIONAMENTO AQUI:
                // Vai para a pasta 'gest_main' que está uma pasta acima (..)
                window.location.href = '../gest_main/gestMain.html';
            }
            else {
                errorMessage.classList.add('visible');
                errorText.textContent = 'Credenciais inválidas. Tente novamente.';
                usernameInput.classList.add('input-error');
                passwordInput.classList.add('input-error');
            }
        }, 1500);
    });
}
// Remove errors on input
[usernameInput, passwordInput].forEach(function (input) {
    if (input) {
        input.addEventListener('input', function () {
            if (input.classList.contains('input-error')) {
                input.classList.remove('input-error');
                errorMessage.classList.remove('visible');
            }
        });
    }
});
// --- Logic for Modals ---
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
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        var activeModals = document.querySelectorAll('.modal.active');
        activeModals.forEach(function (modal) {
            window.closeModal(modal.id);
        });
    }
});
window.handleDemoSubmit = function (e) {
    e.preventDefault();
    var demoBtn = document.getElementById('demoSubmitBtn');
    var demoForm = document.getElementById('demoRequestForm');
    if (!demoBtn)
        return;
    var originalText = demoBtn.textContent;
    demoBtn.textContent = 'Enviando...';
    demoBtn.disabled = true;
    demoBtn.style.opacity = '0.7';
    setTimeout(function () {
        alert('Solicitação enviada com sucesso! Entraremos em contato em breve.');
        window.closeModal('demoModal');
        if (demoForm)
            demoForm.reset();
        demoBtn.textContent = originalText;
        demoBtn.disabled = false;
        demoBtn.style.opacity = '1';
    }, 1500);
};
