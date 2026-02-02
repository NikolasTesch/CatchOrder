import { Request, Response, NextFunction } from 'express';
import { sanitizeObject, preventSQLInjection } from '../utils/sanitizer';

/**
 * Middleware de sanitização de input
 * Aplica sanitização em req.body, req.query e req.params
 */
export const sanitizeInput = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Sanitiza body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
    req.body = preventSQLInjection(req.body);
  }

  // Sanitiza query parameters
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
    req.query = preventSQLInjection(req.query);
  }

  // Sanitiza route parameters
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
    req.params = preventSQLInjection(req.params);
  }

  next();
};
