import '../../styles/global.css';
import './style.css';
import { ApiService } from '../../services/apiService';



document.addEventListener('DOMContentLoaded', () => {


    const usernameInput = document.getElementById('username') as HTMLInputElement | null;
    const passwordInput = document.getElementById('password') as HTMLInputElement | null;
    const togglePasswordBtn = document.querySelector('.password-toggle') as HTMLElement | null;
    const loginButton = document.querySelector('.btn-primary') as HTMLElement | null;
    const errorContainer = document.getElementById('login-error') as HTMLElement | null;
    const darkModeToggle = document.getElementById('darkModeToggle');

    init();

    function init(): void {
        initDarkMode();
        setupEventListeners();
    }

    function initDarkMode() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.body.classList.add('dark-mode');
            updateDarkModeIcon(true);
        } else {
            updateDarkModeIcon(false);
        }
    }

    function toggleDarkMode() {
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateDarkModeIcon(isDark);
    }

    function updateDarkModeIcon(isDark: boolean) {
        if (darkModeToggle) {
            const icon = darkModeToggle.querySelector('.material-symbols-outlined');
            if (icon) icon.textContent = isDark ? 'dark_mode' : 'light_mode';
        }
    }

    function setupEventListeners(): void {
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', toggleDarkMode);
        }

        if (togglePasswordBtn && passwordInput) {
            togglePasswordBtn.addEventListener('click', handlePasswordToggle);
            togglePasswordBtn.style.cursor = 'pointer';
        }

        if (loginButton) {

            loginButton.addEventListener('click', handleLogin);
        } else {

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

            // Using ApiService for consistent request handling
            const response = await ApiService.post<{ user: { role: string; id: string; name: string; username: string }, token: string }>('/auth/login', { username, password });



            // Save user and token to localStorage
            if (response.user) {
                localStorage.setItem('user', JSON.stringify(response.user));
            }
            if (response.token) {
                localStorage.setItem('token', response.token);
            }

            // Redirect based on role
            if (response.user.role === 'waiter') {
                window.location.href = 'waiterMain.html';
            } else {
                // Default for admin, manager, kitchen, etc.
                window.location.href = 'gestMain.html';
            }

        } catch (error: any) {
            // console.error('Login error:', error);
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
