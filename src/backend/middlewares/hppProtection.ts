import { Request, Response, NextFunction } from 'express';

/**
 * Middleware de proteção contra HTTP Parameter Pollution (HPP)
 * Previne ataques onde múltiplos parâmetros com o mesmo nome são enviados
 * Exemplo: ?id=1&id=2&id=3
 */
export const hppProtection = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Processa query parameters
  if (req.query && typeof req.query === 'object') {
    for (const key in req.query) {
      // Use type assertion to allow access/modification
      const query = req.query as Record<string, any>;
      if (Object.prototype.hasOwnProperty.call(query, key)) {
        const value = query[key];

        // Se for array, mantém apenas o último valor
        if (Array.isArray(value)) {
          query[key] = value[value.length - 1];
        }
      }
    }
  }

  // Processa body parameters
  if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
    for (const key in req.body) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        const value = req.body[key];

        if (Array.isArray(value)) {
          // Lista de campos que podem ser arrays legítimos
          const allowedArrayFields = [
            'items',
            'products',
            'tags',
            'categories',
          ];

          if (!allowedArrayFields.includes(key)) {
            req.body[key] = value[value.length - 1];
          }
        }
      }
    }
  }

  next();
};
