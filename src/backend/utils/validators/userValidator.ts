// Validação de Usuário
export interface User {
  name: string;
  email: string;
  password: string;
  role: string;
}

export class UserValidator {
  private static rolesValidos = ["ADMIN", "GARCOM", "COZINHA"];

  static validate(user: User): { valido: boolean; error: string[] } {
    const error: string[] = [];

    if (!user.name || user.name.trim().length === 0) {
      error.push("Nome é obrigatório");
    } else if (user.name.trim().length < 3) {
      error.push("Nome deve ter pelo menos 3 caracteres");
    } else if (user.name.trim().length > 100) {
      error.push("Nome deve ter no máximo 100 caracteres");
    }

    if (!user.email || user.email.trim().length === 0) {
      error.push("Email é obrigatório");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      error.push("Email deve ser um endereço de email válido");
    }

    if (!user.password || user.password.trim().length === 0) {
      error.push("Senha é obrigatória");
    } else if (user.password.length < 6) {
      error.push("Senha deve ter pelo menos 6 caracteres");
    }

    if (!user.role || user.role.trim().length === 0) {
      error.push("Função é obrigatória");
    } else if (!this.rolesValidos.includes(user.role)) {
      error.push("Função deve ser uma das seguintes: " + this.rolesValidos.join(", "));
    }

    return {
      valido: error.length === 0,
      error,
    };
  }
}

