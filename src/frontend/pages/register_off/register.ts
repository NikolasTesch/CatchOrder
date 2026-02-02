import './style.css';
import { ModalService } from '../../utils/modalService';

document.addEventListener('DOMContentLoaded', () => {
    const nameInput = document.getElementById('name') as HTMLInputElement | null;
    const usernameInput = document.getElementById('username') as HTMLInputElement | null;
    const roleInput = document.getElementById('role') as HTMLSelectElement | null;
    const passwordInput = document.getElementById('password') as HTMLInputElement | null;
    const registerButton = document.querySelector('.btn-primary') as HTMLElement | null;
    const errorContainer = document.getElementById('register-error') as HTMLElement | null;

    init();

    function init(): void {
        setupEventListeners();
    }

    function setupEventListeners(): void {
        if (registerButton) {
            registerButton.addEventListener('click', handleRegister);
        }

        // Clear error on input
        const inputs = [nameInput, usernameInput, roleInput, passwordInput];
        inputs.forEach(input => {
            if (input) input.addEventListener('input', clearError);
        });
    }

    async function handleRegister(e: Event): Promise<void> {
        if (e) e.preventDefault();

        // Basic Null Checks
        if (!nameInput || !usernameInput || !roleInput || !passwordInput) return;

        const name = nameInput.value.trim();
        const username = usernameInput.value.trim();
        const role = roleInput.value;
        const password = passwordInput.value.trim();

        // Reset error
        clearError();

        // Validation
        if (!name) {
            showError('Por favor, insira seu nome.');
            return;
        }

        if (!username) {
            showError('Por favor, crie um nome de usuário.');
            return;
        }

        if (!role) {
            showError('Por favor, selecione um cargo.');
            return;
        }

        if (!password) {
            showError('Por favor, crie uma senha.');
            return;
        }

        if (password.length < 3) { // Adjusted from 8 for testing convenience, or sticking to strict? Let's say 3 for now as minimal.
            // Although the placeholder says 8. Let's respect the placeholder if we want strictness, but 3 is easier for dev. 
            // I'll stick to a reasonable checks.
        }

        // specific check for 8 chars if we want to follow UI text
        if (password.length < 8) {
            showError('A senha deve ter no mínimo 8 caracteres.');
            return;
        }

        // Success - Loading State
        setLoadingState(true);

        try {
            const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : (window.location.pathname.includes('/server09/') ? '/server09/api' : '/api');
            const response = await fetch(`${API_BASE}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, username, password, role }),
            });

            const data = await response.json();

            if (response.ok) {
                // console.log('Registration successful');
                ModalService.alert('Sucesso', 'Conta criada com sucesso! Redirecionando para o login...', 'success', () => {
                    // Redirect to login page
                    window.location.href = 'landingPage.html';
                });
            } else {
                showError(data.message || 'Falha ao criar conta. Tente novamente.');
            }
        } catch (error) {
            // console.error('Registration error:', error);
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
        if (!registerButton) return;

        if (isLoading) {
            registerButton.classList.add('btn-loading');

            // Create and append spinner if it doesn't exist
            if (!registerButton.querySelector('.spinner')) {
                const spinner = document.createElement('div');
                spinner.className = 'spinner';
                registerButton.appendChild(spinner);
            }
        } else {
            registerButton.classList.remove('btn-loading');
            const spinner = registerButton.querySelector('.spinner');
            if (spinner) {
                spinner.remove();
            }
        }
    }
});
