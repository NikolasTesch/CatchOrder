import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';

/**
 * Middleware de sanitização de dados
 * Protege contra injeções e poluição de parâmetros
 */

/**
 * Sanitização contra NoSQL Injection
 * Remove operadores do MongoDB ($, .) dos inputs
 * 
 * Previne ataques como:
 * { "username": {"$gt": ""}, "password": {"$gt": ""} }
 */
export const sanitizeData = mongoSanitize({
  replaceWith: '_', // Substitui caracteres proibidos por '_'
  onSanitize: ({ req, key }) => {
    console.warn(`⚠️ Tentativa de NoSQL injection detectada: ${key} na rota ${req.path}`);
  },
});

/**
 * Proteção contra HTTP Parameter Pollution (HPP)
 * Previne poluição de query parameters
 * 
 * Exemplo de ataque:
 * ?id=1&id=2&id=3 (pode causar comportamento inesperado)
 */
export const preventParameterPollution = hpp({
  whitelist: ['sort', 'fields', 'page', 'limit'], // Parâmetros que podem ser duplicados
});

/**
 * Validação de tamanho de payload
 * Previne ataques de payload muito grandes
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
 * Sanitização de inputs de usuário
 * Remove caracteres HTML perigosos para prevenir XSS
 */
export const sanitizeInput = (req: any, res: any, next: any) => {
  // Sanitiza body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  // Sanitiza query params
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  // Sanitiza params
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  
  next();
};

/**
 * Função auxiliar para sanitizar objetos recursivamente
 */
function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return obj
      .replace(/[<>]/g, '') // Remove < e >
      .trim();
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
