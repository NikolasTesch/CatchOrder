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
    const sanitized = preventSQLInjection(sanitizeObject(req.body));
    // Clear and assign to avoid reassignment of req.body which might be read-only
    Object.keys(req.body).forEach((key) => delete req.body[key]);
    Object.assign(req.body, sanitized);
  }

  // Sanitiza query parameters
  if (req.query && typeof req.query === 'object') {
    const sanitized = preventSQLInjection(sanitizeObject(req.query));
    // Type checking for delete
    const query = req.query as Record<string, any>;
    Object.keys(query).forEach((key) => delete query[key]);
    Object.assign(query, sanitized);
  }

  // Sanitiza route parameters
  if (req.params && typeof req.params === 'object') {
    const sanitized = preventSQLInjection(sanitizeObject(req.params));
    const params = req.params as Record<string, any>;
    Object.keys(params).forEach((key) => delete params[key]);
    Object.assign(params, sanitized);
  }

  next();
};
