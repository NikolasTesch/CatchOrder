import rateLimit from 'express-rate-limit';

/**
 * Rate Limiter para proteger contra ataques de força bruta e DDoS
 * 
 * Best Practice: Diferentes limites para diferentes endpoints
 */

/**
 * Rate limiter geral da API
 * Aplica-se a todas as requisições
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máximo de 100 requisições por IP
  message: {
    error: 'Muitas requisições deste IP, por favor tente novamente mais tarde.',
    retryAfter: '15 minutos'
  },
  standardHeaders: true, // Retorna info de rate limit nos headers `RateLimit-*`
  legacyHeaders: false, // Desabilita headers `X-RateLimit-*`
  // Store em memória (em produção, usar Redis)
  skipSuccessfulRequests: false, // Conta requisições bem-sucedidas
  skipFailedRequests: false, // Conta requisições falhadas
});

/**
 * Rate limiter para rotas de autenticação
 * Mais restritivo para prevenir ataques de força bruta
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo de 5 tentativas de login
  message: {
    error: 'Muitas tentativas de login. Conta temporariamente bloqueada.',
    retryAfter: '15 minutos'
  },
  skipSuccessfulRequests: true, // Não conta requisições bem-sucedidas
});

/**
 * Rate limiter para criação de recursos
 * Previne spam e abuse
 */
export const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // Máximo de 10 criações por hora
  message: {
    error: 'Limite de criação de recursos atingido. Tente novamente em 1 hora.',
  },
});

/**
 * Rate limiter para endpoints públicos/intensivos
 */
export const strictLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 10, // Máximo de 10 requisições por minuto
  message: {
    error: 'Muitas requisições. Por favor, aguarde um momento.',
  },
});
