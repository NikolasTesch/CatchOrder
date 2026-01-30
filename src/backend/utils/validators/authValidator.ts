// Validação de Autenticação
export interface LoginData {
  username: string;
  password: string;
}

export class AuthValidator {
  static validateLogin(login: any): { valido: boolean; error: string[] } {
    const error: string[] = [];

    // Validar username (obrigatório)
    if (!login.username || typeof login.username !== 'string') {
      error.push('Username é obrigatório');
    } else if (login.username.trim().length === 0) {
      error.push('Username não pode ser vazio');
    } else if (login.username.trim().length < 4) {
      error.push('Username deve ter pelo menos 4 caracteres');
    }

    // Validar password (obrigatório)
    if (!login.password || typeof login.password !== 'string') {
      error.push('Password é obrigatório');
    } else if (login.password.trim().length === 0) {
      error.push('Password não pode ser vazio');
    } else if (login.password.length < 8) {
      error.push('Password deve ter pelo menos 8 caracteres');
    }

    return {
      valido: error.length === 0,
      error,
    };
  }
}
