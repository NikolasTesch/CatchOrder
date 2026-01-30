import { Request, Response, NextFunction } from 'express';
import { AuthValidator } from '../utils/validators/authValidator';

/**
 * Middleware para validar dados de login
 * Valida: username, password
 */
export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const validation = AuthValidator.validateLogin(req.body);

  if (!validation.valido) {
    res.status(400).json({
      message: 'Erro de validação',
      errors: validation.error,
    });
    return;
  }

  next();
};
