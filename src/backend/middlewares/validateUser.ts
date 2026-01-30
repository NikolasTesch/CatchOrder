import { Request, Response, NextFunction } from 'express';
import { UserValidator } from '../utils/validators/userValidator';

/**
 * Middleware para validar dados de criação de usuário
 * Valida: name, username, password, role
 */
export const validateUserCreation = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const validation = UserValidator.validate(req.body);

  if (!validation.valido) {
    res.status(400).json({
      message: 'Erro de validação',
      errors: validation.error,
    });
    return;
  }

  next();
};

/**
 * Middleware para validar dados de atualização de usuário
 * Campos opcionais: name, username, password, role
 */
export const validateUserUpdate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const validation = UserValidator.validateUpdate(req.body);

  if (!validation.valido) {
    res.status(400).json({
      message: 'Erro de validação',
      errors: validation.error,
    });
    return;
  }

  next();
};

/**
 * Middleware para validar UUID nos parâmetros da rota
 */
export const validateUserId = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { id } = req.params;

  // Regex para validar UUID v4
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!id || typeof id !== 'string' || !uuidRegex.test(id)) {
    res.status(400).json({
      message: 'ID inválido',
      errors: ['O ID deve ser um UUID válido'],
    });
    return;
  }

  next();
};
