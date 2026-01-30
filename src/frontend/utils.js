/**
 * CatchOrder - UI/UX Utilities
 * Reusable functions for toast notifications, modals, and form validation
 */

// ==================== TOAST NOTIFICATIONS ====================

class ToastManager {
  constructor() {
    this.container = this.createContainer();
    this.toasts = [];
  }

  createContainer() {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  show(options) {
    const {
      title = '',
      message = '',
      type = 'info', // 'success', 'error', 'warning', 'info'
      duration = 5000,
      closable = true
    } = options;

    const icons = {
      success: 'check_circle',
      error: 'error',
      warning: 'warning',
      info: 'info'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    toast.innerHTML = `
      <span class="material-icons toast-icon">${icons[type]}</span>
      <div class="toast-content">
        ${title ? `<div class="toast-title">${title}</div>` : ''}
        <div class="toast-message">${message}</div>
      </div>
      ${closable ? '<button class="toast-close" aria-label="Close"><span class="material-icons">close</span></button>' : ''}
    `;

    this.container.appendChild(toast);
    this.toasts.push(toast);

    // Close button
    if (closable) {
      const closeBtn = toast.querySelector('.toast-close');
      closeBtn.addEventListener('click', () => this.remove(toast));
    }

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => this.remove(toast), duration);
    }

    return toast;
  }

  remove(toast) {
    toast.style.animation = 'slideInRight 0.3s ease-out reverse';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
      const index = this.toasts.indexOf(toast);
      if (index > -1) {
        this.toasts.splice(index, 1);
      }
    }, 300);
  }

  success(message, title = 'Sucesso!') {
    return this.show({ title, message, type: 'success' });
  }

  error(message, title = 'Erro!') {
    return this.show({ title, message, type: 'error' });
  }

  warning(message, title = 'Atenção!') {
    return this.show({ title, message, type: 'warning' });
  }

  info(message, title = 'Informação') {
    return this.show({ title, message, type: 'info' });
  }
}

// Global toast instance
window.toast = new ToastManager();

// ==================== CONFIRMATION MODAL ====================

class ConfirmationModal {
  constructor() {
    this.backdrop = this.createBackdrop();
    this.isOpen = false;
  }

  createBackdrop() {
    let backdrop = document.querySelector('.modal-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop';
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          this.close();
        }
      });
      document.body.appendChild(backdrop);
    }
    return backdrop;
  }

  show(options) {
    return new Promise((resolve) => {
      const {
        title = 'Confirmar Ação',
        message = 'Tem certeza que deseja continuar?',
        confirmText = 'Confirmar',
        cancelText = 'Cancelar',
        type = 'warning', // 'warning', 'danger', 'info'
        confirmClass = 'btn-danger'
      } = options;

      const icons = {
        warning: 'warning',
        danger: 'error',
        info: 'info'
      };

      this.backdrop.innerHTML = `
        <div class="modal">
          <div class="modal-header">
            <span class="material-icons modal-icon ${type}">${icons[type]}</span>
            <h2 class="modal-title">${title}</h2>
          </div>
          <div class="modal-body">
            <p class="modal-message">${message}</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" data-action="cancel">${cancelText}</button>
            <button class="btn ${confirmClass}" data-action="confirm">${confirmText}</button>
          </div>
        </div>
      `;

      const modal = this.backdrop.querySelector('.modal');
      const confirmBtn = modal.querySelector('[data-action="confirm"]');
      const cancelBtn = modal.querySelector('[data-action="cancel"]');

      const handleConfirm = () => {
        this.close();
        resolve(true);
      };

      const handleCancel = () => {
        this.close();
        resolve(false);
      };

      confirmBtn.addEventListener('click', handleConfirm);
      cancelBtn.addEventListener('click', handleCancel);

      // Keyboard support
      const handleKeyboard = (e) => {
        if (e.key === 'Escape') {
          handleCancel();
        } else if (e.key === 'Enter') {
          handleConfirm();
        }
      };
      document.addEventListener('keydown', handleKeyboard);

      this.backdrop.classList.add('active');
      this.isOpen = true;

      // Cleanup function
      const cleanup = () => {
        document.removeEventListener('keydown', handleKeyboard);
      };

      // Store cleanup to run when modal closes
      this.cleanup = cleanup;
    });
  }

  close() {
    if (this.cleanup) {
      this.cleanup();
      this.cleanup = null;
    }
    this.backdrop.classList.remove('active');
    this.isOpen = false;
  }

  async confirmDelete(itemName) {
    return await this.show({
      title: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir "${itemName}"? Esta ação não pode ser desfeita.`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      type: 'danger',
      confirmClass: 'btn-danger'
    });
  }

  async confirmAction(actionName) {
    return await this.show({
      title: `Confirmar ${actionName}`,
      message: `Tem certeza que deseja ${actionName.toLowerCase()}?`,
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      type: 'warning',
      confirmClass: 'btn-primary'
    });
  }
}

// Global modal instance
window.confirmModal = new ConfirmationModal();

// ==================== FORM VALIDATION ====================

const FormValidator = {
  // Validation rules
  rules: {
    required: (value) => {
      return value.trim() !== '';
    },
    
    email: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
    
    minLength: (value, length) => {
      return value.length >= length;
    },
    
    maxLength: (value, length) => {
      return value.length <= length;
    },
    
    number: (value) => {
      return !isNaN(value) && value.trim() !== '';
    },
    
    phone: (value) => {
      const phoneRegex = /^[\d\s\-\(\)]+$/;
      return phoneRegex.test(value) && value.replace(/\D/g, '').length >= 10;
    },
    
    cpf: (value) => {
      const cpf = value.replace(/\D/g, '');
      if (cpf.length !== 11) return false;
      
      // Verificar se todos os dígitos são iguais
      if (/^(\d)\1+$/.test(cpf)) return false;
      
      // Validar dígitos verificadores
      let sum = 0;
      for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
      }
      let digit = 11 - (sum % 11);
      if (digit >= 10) digit = 0;
      if (digit !== parseInt(cpf.charAt(9))) return false;
      
      sum = 0;
      for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
      }
      digit = 11 - (sum % 11);
      if (digit >= 10) digit = 0;
      return digit === parseInt(cpf.charAt(10));
    },
    
    password: (value) => {
      // Mínimo 6 caracteres
      return value.length >= 6;
    },
    
    strongPassword: (value) => {
      // Mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número
      const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      return strongRegex.test(value);
    },
    
    url: (value) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    
    match: (value, targetValue) => {
      return value === targetValue;
    }
  },

  // Error messages
  messages: {
    required: 'Este campo é obrigatório',
    email: 'Digite um e-mail válido',
    minLength: 'Mínimo de {length} caracteres',
    maxLength: 'Máximo de {length} caracteres',
    number: 'Digite apenas números',
    phone: 'Digite um telefone válido',
    cpf: 'CPF inválido',
    password: 'A senha deve ter no mínimo 6 caracteres',
    strongPassword: 'A senha deve ter no mínimo 8 caracteres, incluindo maiúsculas, minúsculas e números',
    url: 'Digite uma URL válida',
    match: 'Os campos não coincidem'
  },

  // Validate a single field
  validateField(input, validations) {
    const value = input.value;
    const group = input.closest('.form-group');
    
    if (!group) return true;

    for (const validation of validations) {
      const { rule, params = [], message } = validation;
      
      if (!this.rules[rule]) continue;
      
      const isValid = this.rules[rule](value, ...params);
      
      if (!isValid) {
        this.setFieldError(group, input, message || this.messages[rule].replace('{length}', params[0]));
        return false;
      }
    }
    
    this.setFieldSuccess(group, input);
    return true;
  },

  setFieldError(group, input, message) {
    group.classList.remove('is-valid', 'is-warning');
    group.classList.add('is-invalid');
    
    let helper = group.querySelector('.form-helper');
    if (!helper) {
      helper = document.createElement('div');
      helper.className = 'form-helper';
      input.parentNode.appendChild(helper);
    }
    
    helper.innerHTML = `<span class="material-icons">error</span> ${message}`;
    
    // Update icon in wrapper if exists
    const wrapper = input.closest('.form-input-wrapper');
    if (wrapper) {
      let icon = wrapper.querySelector('.material-icons');
      if (!icon) {
        icon = document.createElement('span');
        icon.className = 'material-icons';
        wrapper.appendChild(icon);
      }
      icon.textContent = 'error';
    }
  },

  setFieldSuccess(group, input) {
    group.classList.remove('is-invalid', 'is-warning');
    group.classList.add('is-valid');
    
    let helper = group.querySelector('.form-helper');
    if (helper) {
      helper.remove();
    }
    
    // Update icon in wrapper if exists
    const wrapper = input.closest('.form-input-wrapper');
    if (wrapper) {
      let icon = wrapper.querySelector('.material-icons');
      if (!icon) {
        icon = document.createElement('span');
        icon.className = 'material-icons';
        wrapper.appendChild(icon);
      }
      icon.textContent = 'check_circle';
    }
  },

  setFieldWarning(group, input, message) {
    group.classList.remove('is-valid', 'is-invalid');
    group.classList.add('is-warning');
    
    let helper = group.querySelector('.form-helper');
    if (!helper) {
      helper = document.createElement('div');
      helper.className = 'form-helper';
      input.parentNode.appendChild(helper);
    }
    
    helper.innerHTML = `<span class="material-icons">warning</span> ${message}`;
  },

  clearFieldState(group) {
    group.classList.remove('is-valid', 'is-invalid', 'is-warning');
    const helper = group.querySelector('.form-helper');
    if (helper) {
      helper.remove();
    }
  },

  // Setup real-time validation for a form
  setupForm(formElement, validationConfig) {
    const inputs = formElement.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
      const fieldName = input.name || input.id;
      const fieldValidations = validationConfig[fieldName];
      
      if (!fieldValidations) return;
      
      // Validate on blur
      input.addEventListener('blur', () => {
        if (input.value) {
          this.validateField(input, fieldValidations);
        }
      });
      
      // Validate on input (after first blur)
      let hasBlurred = false;
      input.addEventListener('blur', () => { hasBlurred = true; }, { once: true });
      input.addEventListener('input', () => {
        if (hasBlurred && input.value) {
          this.validateField(input, fieldValidations);
        }
      });
    });
    
    // Validate all on submit
    formElement.addEventListener('submit', (e) => {
      e.preventDefault();
      
      let isValid = true;
      inputs.forEach(input => {
        const fieldName = input.name || input.id;
        const fieldValidations = validationConfig[fieldName];
        
        if (fieldValidations) {
          const fieldIsValid = this.validateField(input, fieldValidations);
          if (!fieldIsValid) isValid = false;
        }
      });
      
      if (isValid) {
        // Form is valid, trigger custom event
        formElement.dispatchEvent(new CustomEvent('formValid', { detail: { form: formElement } }));
      } else {
        // Focus first invalid field
        const firstInvalid = formElement.querySelector('.is-invalid input, .is-invalid select, .is-invalid textarea');
        if (firstInvalid) {
          firstInvalid.focus();
        }
        toast.error('Por favor, corrija os erros no formulário');
      }
    });
  }
};

// Export for global use
window.FormValidator = FormValidator;

// ==================== LOADING STATE HELPERS ====================

const LoadingHelper = {
  // Add loading state to button
  setButtonLoading(button, isLoading = true) {
    if (isLoading) {
      button.classList.add('btn-loading');
      button.disabled = true;
      button.dataset.originalText = button.textContent;
    } else {
      button.classList.remove('btn-loading');
      button.disabled = false;
      if (button.dataset.originalText) {
        button.textContent = button.dataset.originalText;
      }
    }
  },

  // Show skeleton for element
  showSkeleton(element) {
    element.classList.add('skeleton');
  },

  // Hide skeleton for element
  hideSkeleton(element) {
    element.classList.remove('skeleton');
  }
};

window.LoadingHelper = LoadingHelper;
