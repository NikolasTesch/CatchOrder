require('./style.css');
import { ApiService } from '../../services/apiService';

console.log('Create User Script Loaded');

document.addEventListener('DOMContentLoaded', () => {
    init();
});

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
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        const icon = darkModeToggle.querySelector('.material-symbols-outlined');
        if (icon) {
            icon.textContent = isDark ? 'dark_mode' : 'light_mode';
        }
    }
}

function setupEventListeners() {
    // Dark mode
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleDarkMode);
    }

    // Back button
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.history.back();
        });
    }

    // Form submission
    const userForm = document.getElementById('userForm') as HTMLFormElement | null;
    if (userForm) {
        userForm.addEventListener('submit', handleCreateUser);

        // Clear errors on input
        const inputs = userForm.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                clearError(input.id);
            });
        });
    }
}

async function handleCreateUser(e: Event) {
    e.preventDefault();
    console.log('Validating user creation form...');

    // Clear all previous errors
    clearAllErrors();

    const nameInput = document.getElementById('full-name') as HTMLInputElement;
    const usernameInput = document.getElementById('email') as HTMLInputElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    const roleInput = document.getElementById('role') as HTMLSelectElement;

    const name = nameInput.value.trim();
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const role = roleInput.value;

    // Validate all fields at once
    const isFormValid = validateForm(name, username, password, role);

    if (!isFormValid) {
        console.log('Form validation failed');
        return;
    }

    console.log('Form valid, submitting...');

    try {
        await ApiService.post('/users', {
            name,
            username,
            password,
            role
        });

        alert('Usuário criado com sucesso!');
        // Clear form
        (document.getElementById('userForm') as HTMLFormElement).reset();
    } catch (error: any) {
        console.error('Error creating user:', error);
        alert(error.message || 'Erro ao criar usuário');
    }
}

function validateForm(name: string, username: string, password: string, role: string): boolean {
    let isValid = true;

    // Name Validation
    if (!name) {
        showError('full-name', 'Nome é obrigatório.');
        isValid = false;
    } else if (name.length < 4) {
        showError('full-name', 'Nome deve ter pelo menos 4 caracteres.');
        isValid = false;
    }

    // Username Validation
    if (!username) {
        showError('email', 'Username é obrigatório.');
        isValid = false;
    } else if (username.length < 4) {
        showError('email', 'Username deve ter pelo menos 4 caracteres.');
        isValid = false;
    }

    // Password Validation
    if (!password) {
        showError('password', 'Senha é obrigatória.');
        isValid = false;
    } else {
        if (password.length < 8) {
            showError('password', 'Senha deve ter pelo menos 8 caracteres.');
            isValid = false;
        } else if (!/[A-Z]/.test(password)) {
            showError('password', 'Senha deve conter letra maiúscula.');
            isValid = false;
        } else if (!/[a-z]/.test(password)) {
            showError('password', 'Senha deve conter letra minúscula.');
            isValid = false;
        } else if (!/[0-9]/.test(password)) {
            showError('password', 'Senha deve conter número.');
            isValid = false;
        } else if (!/[\W_]/.test(password)) {
            showError('password', 'Senha deve conter caractere especial.');
            isValid = false;
        }
    }

    // Role Validation
    if (!role) {
        showError('role', 'Selecione um cargo.');
        isValid = false;
    }

    return isValid;
}

function showError(inputId: string, message: string) {
    const errorElement = document.getElementById(`${inputId}-error`);
    const inputElement = document.getElementById(inputId);

    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    if (inputElement) {
        inputElement.classList.add('error');
    }
}

function clearError(inputId: string) {
    const errorElement = document.getElementById(`${inputId}-error`);
    const inputElement = document.getElementById(inputId);

    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }

    if (inputElement) {
        inputElement.classList.remove('error');
    }
}

function clearAllErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(el => {
        (el as HTMLElement).style.display = 'none';
        el.textContent = '';
    });

    const inputElements = document.querySelectorAll('.input-field');
    inputElements.forEach(el => {
        el.classList.remove('error');
    });
}
