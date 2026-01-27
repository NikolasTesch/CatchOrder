import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';

/**
 * Middleware de sanitização de dados
 * Protege contra injeções e poluição de parâmetros
 */

/**
 * Sanitização contra NoSQL Injection
 * Remove operadores do MongoDB ($, .) dos inputs
 */
export const sanitizeData = mongoSanitize({
  replaceWith: '_',
});

/**
 * Proteção contra HTTP Parameter Pollution (HPP)
 * Previne poluição de query parameters
 */
export const preventParameterPollution = hpp({
  whitelist: ['sort', 'fields', 'page', 'limit'],
});

/**
 * Validação de tamanho de payload
 */
export const payloadSizeLimit = (req: any, res: any, next: any) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (req.headers['content-length'] && parseInt(req.headers['content-length']) > maxSize) {
    return res.status(413).json({
      error: 'Payload muito grande',
      maxSize: '10MB'
    });
  }
  
  next();
};

/**
 * Sanitização básica de inputs para prevenir XSS
 */
export const sanitizeInput = (req: any, res: any, next: any) => {
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);
  
  next();
};

function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return obj.replace(/[<>]/g, '').trim();
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  if (obj !== null && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }
  
  return obj;
}
