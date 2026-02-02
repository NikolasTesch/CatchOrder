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
    const cleanedQuery: Record<string, any> = {};

    for (const key in req.query) {
      if (Object.prototype.hasOwnProperty.call(req.query, key)) {
        const value = req.query[key];

        // Se for array, mantém apenas o último valor
        // (ou primeiro, dependendo da estratégia desejada)
        if (Array.isArray(value)) {
          cleanedQuery[key] = value[value.length - 1]; // Último valor
        } else {
          cleanedQuery[key] = value;
        }
      }
    }

    req.query = cleanedQuery;
  }

  // Processa body parameters (se for objeto simples)
  if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
    const cleanedBody: Record<string, any> = {};

    for (const key in req.body) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        const value = req.body[key];

        // Se for array não esperado, mantém apenas o último valor
        // Exceção: alguns campos podem legitimamente ser arrays
        // (ajuste conforme necessário para seu projeto)
        if (Array.isArray(value)) {
          // Lista de campos que podem ser arrays legítimos
          const allowedArrayFields = [
            'items',
            'products',
            'tags',
            'categories',
          ];

          if (allowedArrayFields.includes(key)) {
            cleanedBody[key] = value;
          } else {
            cleanedBody[key] = value[value.length - 1];
          }
        } else {
          cleanedBody[key] = value;
        }
      }
    }

    req.body = cleanedBody;
  }

  next();
};
