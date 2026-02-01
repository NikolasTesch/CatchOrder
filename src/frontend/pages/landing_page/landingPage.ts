import './style.css';
import { ApiService } from '../../services/apiService';

console.log('Landing Page Script Loaded'); // Debug 1

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded'); // Debug 2

    const usernameInput = document.getElementById('username') as HTMLInputElement | null;
    const passwordInput = document.getElementById('password') as HTMLInputElement | null;
    const togglePasswordBtn = document.querySelector('.password-toggle') as HTMLElement | null;
    const loginButton = document.querySelector('.btn-primary') as HTMLElement | null;
    const errorContainer = document.getElementById('login-error') as HTMLElement | null;

    console.log('Elements found:', {
        usernameInput: !!usernameInput,
        passwordInput: !!passwordInput,
        loginButton: !!loginButton
    }); // Debug 3

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
            console.log('Attaching click listener to login button'); // Debug 4
            loginButton.addEventListener('click', handleLogin);
        } else {
            console.error('Login button NOT found'); // Debug Error
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
        console.log('Login button clicked'); // Debug 5
        if (e) e.preventDefault();

        if (!usernameInput || !passwordInput) return;

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        console.log('Values:', { username, password }); // Debug 6

        // Reset error
        clearError();

        // Validation - Backend Match: Both required
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
            console.log('Sending request to /auth/login...'); // Debug 7
            // Using ApiService for consistent request handling
            const response = await ApiService.post<{ user: { role: string; id: string; name: string; username: string } }>('/auth/login', { username, password });

            console.log('Login successful', response);

            // Save user to localStorage
            if (response.user) {
                localStorage.setItem('user', JSON.stringify(response.user));
            }

            // Redirect based on role
            if (response.user.role === 'waiter') {
                window.location.href = 'waiterMain.html';
            } else {
                // Default for admin, manager, kitchen, etc.
                window.location.href = 'gestMain.html';
            }

        } catch (error: any) {
            console.error('Login error:', error);
            showError(error.message || 'Falha no login. Verifique suas credenciais.');
        } finally {
            setLoadingState(false);
        }
    }

    function showError(message: string): void {
        if (errorContainer) {
            errorContainer.textContent = message;
            errorContainer.style.display = 'block';
        }
    }

    function clearError(): void {
        if (errorContainer) {
            errorContainer.textContent = '';
            errorContainer.style.display = 'none';
        }
    }

    function setLoadingState(isLoading: boolean): void {
        if (!loginButton) return;

        if (isLoading) {
            loginButton.classList.add('btn-loading');

            // Create and append spinner if it doesn't exist
            if (!loginButton.querySelector('.btn-label')) {
                // Backup original text if necessary, for now assuming it's replaced
            }

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
