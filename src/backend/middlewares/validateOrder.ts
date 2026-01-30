import { Request, Response, NextFunction } from 'express';
import { OrderValidator } from '../utils/validators/orderValidator';
import { OrderItemValidator } from '../utils/validators/orderItemValidator';

/**
 * Middleware para validar dados de criação de pedido
 * Valida: table_id, user_id
 */
export const validateOrderCreation = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const validation = OrderValidator.validateCreation(req.body);

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
 * Middleware para validar dados de atualização de pedido
 * Campos opcionais: status, total, closed_at
 */
export const validateOrderUpdate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const validation = OrderValidator.validateUpdate(req.body);

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
 * Middleware para validar adição de item ao pedido
 * Valida: product_id, quantity
 */
export const validateOrderItem = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const validation = OrderItemValidator.validateAddItem(req.body);

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
export const validateOrderId = (
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
