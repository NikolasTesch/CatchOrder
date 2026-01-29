import { userRole } from "../../../shared/types/user";

export class UserValidator {
  static validate(user: any): { valido: boolean; error: string[] } {
    const error: string[] = [];

    if (!user.name || user.name.trim().length === 0) {
      error.push("Nome é obrigatório");
    } else if (user.name.trim().length < 3) {
      error.push("Nome deve ter pelo menos 3 caracteres");
    }

    if (!user.username || user.username.trim().length === 0) {
      error.push("Username é obrigatório");
    } else if (user.username.trim().length < 4) {
      error.push("Username deve ter pelo menos 4 caracteres");
    }

    if (!user.password || user.password.trim().length === 0) {
      error.push("Senha é obrigatória");
    } else {
      if (user.password.length < 8) {
        error.push("Senha deve ter pelo menos 8 caracteres");
      }
      if (!/[A-Z]/.test(user.password)) {
        error.push("Senha deve conter pelo menos uma letra maiúscula");
      }
      if (!/[a-z]/.test(user.password)) {
        error.push("Senha deve conter pelo menos uma letra minúscula");
      }
      if (!/[0-9]/.test(user.password)) {
        error.push("Senha deve conter pelo menos um número");
      }
    }

    if (!user.role || user.role.trim().length === 0) {
      error.push("Função é obrigatória");
    } else {
      const validRoles = Object.values(userRole) as string[];
      if (!validRoles.includes(user.role)) {
        error.push("Função deve ser uma das seguintes: " + validRoles.join(", "));
      }
    }

    return {
      valido: error.length === 0,
      error,
    };
  }
}


