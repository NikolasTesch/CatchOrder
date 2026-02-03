import { UserValidator } from '../../../../src/backend/utils/validators/userValidator';
import { userRole } from '../../../../src/shared/types/user';

describe('UserValidator', () => {
  
  // 1. Teste de Sucesso
  it('deve validar um usuário correto', () => {
    const validUser = {
      name: 'Teste Silva',
      username: 'teste.silva',
      password: 'Password123!', // Cumpre todos os requisitos rigorosos
      role: userRole.WAITER
    };

    const result = UserValidator.validate(validUser);
    expect(result.valido).toBe(true);
    expect(result.error).toHaveLength(0);
  });

  // 2. Testes de Erro de Senha
  it('deve rejeitar senha fraca (sem maiúscula/especial)', () => {
    const weakUser = {
      name: 'Teste Silva',
      username: 'teste.silva',
      password: 'password123', // Falta maiúscula e especial
      role: userRole.WAITER
    };

    const result = UserValidator.validate(weakUser);
    expect(result.valido).toBe(false);
    expect(result.error).toContain('Senha deve conter pelo menos uma letra maiúscula');
    expect(result.error).toContain('Senha deve conter pelo menos um caractere especial');
  });

  // 3. Teste de Username Curto
  it('deve rejeitar username muito curto', () => {
    const invalidUser = {
      name: 'Teste',
      username: 'abc', // Menor que 4
      password: 'Password123!',
      role: userRole.ADMIN
    };

    const result = UserValidator.validate(invalidUser);
    expect(result.valido).toBe(false);
    expect(result.error).toContain('Username deve ter pelo menos 4 caracteres');
  });
});
