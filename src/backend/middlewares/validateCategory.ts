import { Request, Response, NextFunction } from 'express';
import { CategoryValidator } from '../utils/validators/categoryValidator';

/**
 * Middleware para validar dados de criação de categoria
 * Valida: name
 */
export const validateCategoryCreation = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const validation = CategoryValidator.validateCreation(req.body);

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
 * Middleware para validar dados de atualização de categoria
 * Campos opcionais: name
 */
export const validateCategoryUpdate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const validation = CategoryValidator.validateUpdate(req.body);

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
export const validateCategoryId = (
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
