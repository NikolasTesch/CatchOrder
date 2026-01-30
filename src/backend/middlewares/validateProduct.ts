import { Request, Response, NextFunction } from 'express';
import { ProductValidator } from '../utils/validators/productValidator';

/**
 * Middleware para validar dados de criação de produto
 * Valida: category_id, name, description, price, is_active
 */
export const validateProductCreation = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const validation = ProductValidator.validateCreation(req.body);

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
 * Middleware para validar dados de atualização de produto
 * Campos opcionais: category_id, name, description, price, image_path, is_active
 */
export const validateProductUpdate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const validation = ProductValidator.validateUpdate(req.body);

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
export const validateProductId = (
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

/**
 * Middleware para validar categoryId UUID nos parâmetros da rota
 */
export const validateCategoryId = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { categoryId } = req.params;

  // Regex para validar UUID v4
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (
    !categoryId ||
    typeof categoryId !== 'string' ||
    !uuidRegex.test(categoryId)
  ) {
    res.status(400).json({
      message: 'Category ID inválido',
      errors: ['O Category ID deve ser um UUID válido'],
    });
    return;
  }

  next();
};
