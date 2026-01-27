import rateLimit from 'express-rate-limit';
import env from '../config/environment';

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
  windowMs: env.RATE_LIMIT_WINDOW,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: {
    error: 'Muitas requisições deste IP, por favor tente novamente mais tarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter para rotas de autenticação
 * Mais restritivo para prevenir ataques de força bruta
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo de 5 tentativas
  message: {
    error: 'Muitas tentativas de login. Conta temporariamente bloqueada.',
  },
  skipSuccessfulRequests: true,
});
