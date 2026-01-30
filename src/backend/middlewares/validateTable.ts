import { Request, Response, NextFunction } from 'express';
import { TableValidator } from '../utils/validators/tableValidator';
import { TableStatus } from '../../shared/types/table';

/**
 * Middleware para validar dados de criação de mesa
 * Valida: number, status
 */
export const validateTableCreation = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const validation = TableValidator.validateCreation(req.body);

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
 * Middleware para validar dados de atualização de mesa
 * Campos opcionais: number, status
 */
export const validateTableUpdate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const validation = TableValidator.validateUpdate(req.body);

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
 * Middleware para validar atualização de status da mesa
 * Valida: status (AVAILABLE, OCCUPIED, RESERVED)
 */
export const validateTableStatus = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { status } = req.body;

  if (!status) {
    res.status(400).json({
      message: 'Erro de validação',
      errors: ['Status é obrigatório'],
    });
    return;
  }

  if (!Object.values(TableStatus).includes(status)) {
    res.status(400).json({
      message: 'Erro de validação',
      errors: ['Status deve ser AVAILABLE, OCCUPIED ou RESERVED'],
    });
    return;
  }

  next();
};

/**
 * Middleware para validar UUID nos parâmetros da rota
 */
export const validateTableId = (
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
 * Middleware para validar status nos parâmetros da rota
 */
export const validateStatusParam = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { status } = req.params;

  if (!status || !Object.values(TableStatus).includes(status as TableStatus)) {
    res.status(400).json({
      message: 'Status inválido',
      errors: ['Status deve ser AVAILABLE, OCCUPIED ou RESERVED'],
    });
    return;
  }

  next();
};
