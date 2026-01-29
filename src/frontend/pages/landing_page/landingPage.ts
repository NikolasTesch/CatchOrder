import './style.css';

document.addEventListener('DOMContentLoaded', () => {
    const usernameInput = document.getElementById('username') as HTMLInputElement | null;
    const passwordInput = document.getElementById('password') as HTMLInputElement | null;
    const togglePasswordBtn = document.querySelector('.password-toggle') as HTMLElement | null;
    const loginButton = document.querySelector('.btn-primary') as HTMLElement | null;
    const errorContainer = document.getElementById('login-error') as HTMLElement | null;

    init();

    function init(): void {
        setupEventListeners();
    }

    function setupEventListeners(): void {
        if (togglePasswordBtn && passwordInput) {
            togglePasswordBtn.addEventListener('click', handlePasswordToggle);
            togglePasswordBtn.style.cursor = 'pointer';
        }

        if (loginButton) {
            loginButton.addEventListener('click', handleLogin);
        }

        // Clear error on input
        if (usernameInput) usernameInput.addEventListener('input', clearError);
        if (passwordInput) passwordInput.addEventListener('input', clearError);
    }

    function handlePasswordToggle(): void {
        if (!passwordInput || !togglePasswordBtn) return;

        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);

        // Update icon
        const icon = togglePasswordBtn.querySelector('.material-symbols-outlined');
        if (icon) {
            icon.textContent = type === 'password' ? 'visibility' : 'visibility_off';
        }
    }

    async function handleLogin(e: Event): Promise<void> {
        if (e) e.preventDefault();

        if (!usernameInput || !passwordInput) return;

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        // Reset error
        clearError();

        // Validation
        if (!username) {
            showError('Por favor, insira seu usuário.');
            return;
        }

        if (!password) {
            showError('Por favor, insira sua senha.');
            return;
        }

        // Success - Loading State
        setLoadingState(true);

        try {
            const response = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Assuming cookie is set by backend (httpOnly), but checking for token just in case
                console.log('Login successful');

                // Redirect to orders page
                window.location.href = '../orders/orders.html';
            } else {
                showError(data.message || 'Falha no login. Verifique suas credenciais.');
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('Erro ao conectar com o servidor. Tente novamente mais tarde.');
        } finally {
            setLoadingState(false);
        }
    }

    function showError(message: string): void {
        if (errorContainer) {
            errorContainer.textContent = message;
        }
    }

    function clearError(): void {
        if (errorContainer) {
            errorContainer.textContent = '';
        }
    }

    function setLoadingState(isLoading: boolean): void {
        if (!loginButton) return;

        if (isLoading) {
            loginButton.classList.add('btn-loading');

            // Create and append spinner if it doesn't exist
            if (!loginButton.querySelector('.spinner')) {
                const spinner = document.createElement('div');
                spinner.className = 'spinner';
                loginButton.appendChild(spinner);
            }
        } else {
            loginButton.classList.remove('btn-loading');
            const spinner = loginButton.querySelector('.spinner');
            if (spinner) {
                spinner.remove();
            }
        }
    }
});
