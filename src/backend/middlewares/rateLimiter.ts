import rateLimit from 'express-rate-limit';

// Rate limiter geral para todas as rotas da API
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200, // Limite de 200 requisições por janela por IP
  standardHeaders: true, // Retorna headers RateLimit-* (RFC draft 7)
  legacyHeaders: false, // Desabilita headers X-RateLimit-*
  message: {
    message: 'Muitas requisições deste IP. Tente novamente em alguns minutos.',
  },
});

// Rate limiter específico para autenticação
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Limite de 10 tentativas a cada 15 minutos
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
  },
  skipSuccessfulRequests: true, // Não conta logins bem-sucedidos
});

// Rate limiter para operações de criação/modificação (POST/PUT/DELETE/PATCH)
export const mutationRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite de 100 operações de escrita
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message:
      'Muitas operações de modificação. Tente novamente em alguns minutos.',
  },
  // Custom filter para aplicar apenas em métodos de mutação
  // Nota: express-rate-limit aplica a todas as requisições no endpoint onde é montado.
  // Se montado globalmente, precisamos filtrar. Se montado em rotas específicas, não.
  // Assumindo uso como middleware específico em rotas de mutação, ou global com skip.
  skip: (req) => {
    // Se for método seguro (GET, HEAD, OPTIONS), pula este limiter
    return ['GET', 'HEAD', 'OPTIONS'].includes(req.method);
  },
});

export default generalRateLimiter;
