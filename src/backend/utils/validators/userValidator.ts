import { userRole } from '../../../shared/types/user';

export class UserValidator {
  static validate(user: any): { valido: boolean; error: string[] } {
    const error: string[] = [];

    if (!user.name || user.name.trim().length === 0) {
      error.push('Nome é obrigatório');
    } else if (user.name.trim().length < 4) {
      error.push('Nome deve ter pelo menos 4 caracteres');
    }

    if (!user.username || user.username.trim().length === 0) {
      error.push('Username é obrigatório');
    } else if (user.username.trim().length < 4) {
      error.push('Username deve ter pelo menos 4 caracteres');
    }

    if (!user.password || user.password.trim().length === 0) {
      error.push('Senha é obrigatória');
    } else {
      if (user.password.length < 8) {
        error.push('Senha deve ter pelo menos 8 caracteres');
      }
      if (!/[A-Z]/.test(user.password)) {
        error.push('Senha deve conter pelo menos uma letra maiúscula');
      }
      if (!/[a-z]/.test(user.password)) {
        error.push('Senha deve conter pelo menos uma letra minúscula');
      }
      if (!/[0-9]/.test(user.password)) {
        error.push('Senha deve conter pelo menos um número');
      }
      if (!/[\W_]/.test(user.password)) {
        error.push('Senha deve conter pelo menos um caractere especial');
      }
    }

    if (!user.role || user.role.trim().length === 0) {
      error.push('Função é obrigatória');
    } else {
      const validRoles = Object.values(userRole) as string[];
      if (!validRoles.includes(user.role)) {
        error.push(
          'Função deve ser uma das seguintes: ' + validRoles.join(', '),
        );
      }
    }

    return {
      valido: error.length === 0,
      error,
    };
  }

  static validateUpdate(user: any): { valido: boolean; error: string[] } {
    const error: string[] = [];

    // Campos opcionais para update - só valida se fornecidos
    if (user.name !== undefined) {
      if (user.name.trim().length === 0) {
        error.push('Nome não pode ser vazio');
      } else if (user.name.trim().length < 4) {
        error.push('Nome deve ter pelo menos 4 caracteres');
      }
    }

    if (user.username !== undefined) {
      if (user.username.trim().length === 0) {
        error.push('Username não pode ser vazio');
      } else if (user.username.trim().length < 4) {
        error.push('Username deve ter pelo menos 4 caracteres');
      }
    }

    if (user.password !== undefined) {
      if (user.password.trim().length === 0) {
        error.push('Senha não pode ser vazia');
      } else {
        if (user.password.length < 8) {
          error.push('Senha deve ter pelo menos 8 caracteres');
        }
        if (!/[A-Z]/.test(user.password)) {
          error.push('Senha deve conter pelo menos uma letra maiúscula');
        }
        if (!/[a-z]/.test(user.password)) {
          error.push('Senha deve conter pelo menos uma letra minúscula');
        }
        if (!/[0-9]/.test(user.password)) {
          error.push('Senha deve conter pelo menos um número');
        }
        if (!/[\W_]/.test(user.password)) {
          error.push('Senha deve conter pelo menos um caractere especial');
        }
      }
    }

    if (user.role !== undefined) {
      if (user.role.trim().length === 0) {
        error.push('Função não pode ser vazia');
      } else {
        const validRoles = Object.values(userRole) as string[];
        if (!validRoles.includes(user.role)) {
          error.push(
            'Função deve ser uma das seguintes: ' + validRoles.join(', '),
          );
        }
      }
    }

    // Validação opcional de image_url
    if (user.image_url !== undefined && user.image_url !== null) {
      if (typeof user.image_url !== 'string') {
        error.push("URL da imagem deve ser uma string");
      } else if (user.image_url.trim().length > 0) {
        // Validação básica de URL
        try {
          new URL(user.image_url);
        } catch {
          error.push("URL da imagem inválida");
        }
      }
    }

    return {
      valido: error.length === 0,
      error,
    };
  }
}
