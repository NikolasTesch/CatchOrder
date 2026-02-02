import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
}

/**
 * Rate Limiter customizado usando Map em memória
 * Para produção com múltiplas instâncias, considere usar Redis
 */
class RateLimiter {
  private store: Map<string, RateLimitRecord>;
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    this.store = new Map();

    // Limpa registros expirados a cada 5 minutos
    this.cleanupInterval = setInterval(
      () => {
        this.cleanup();
      },
      5 * 60 * 1000,
    );
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now > record.resetTime) {
        this.store.delete(key);
      }
    }
  }

  private getKey(req: Request, prefix: string): string {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return `${prefix}:${ip}`;
  }

  createLimiter(config: RateLimitConfig) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const key = this.getKey(req, 'rate_limit');
      const now = Date.now();
      const record = this.store.get(key);

      if (!record || now > record.resetTime) {
        // Novo período ou registro expirado
        this.store.set(key, {
          count: 1,
          resetTime: now + config.windowMs,
        });

        // Headers informativos
        res.setHeader('X-RateLimit-Limit', config.maxRequests.toString());
        res.setHeader(
          'X-RateLimit-Remaining',
          (config.maxRequests - 1).toString(),
        );
        res.setHeader(
          'X-RateLimit-Reset',
          new Date(now + config.windowMs).toISOString(),
        );

        next();
        return;
      }

      // Incrementa contador
      record.count++;

      // Headers informativos
      const remaining = Math.max(0, config.maxRequests - record.count);
      res.setHeader('X-RateLimit-Limit', config.maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', remaining.toString());
      res.setHeader(
        'X-RateLimit-Reset',
        new Date(record.resetTime).toISOString(),
      );

      if (record.count > config.maxRequests) {
        const retryAfter = Math.ceil((record.resetTime - now) / 1000);
        res.setHeader('Retry-After', retryAfter.toString());

        res.status(429).json({
          message:
            config.message || 'Muitas requisições. Tente novamente mais tarde.',
          retryAfter: retryAfter,
        });
        return;
      }

      next();
    };
  }

  // Limiter específico para autenticação
  createAuthLimiter(config: RateLimitConfig) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const key = this.getKey(req, 'auth_limit');
      const now = Date.now();
      const record = this.store.get(key);

      if (!record || now > record.resetTime) {
        this.store.set(key, {
          count: 1,
          resetTime: now + config.windowMs,
        });

        res.setHeader('X-RateLimit-Limit', config.maxRequests.toString());
        res.setHeader(
          'X-RateLimit-Remaining',
          (config.maxRequests - 1).toString(),
        );
        res.setHeader(
          'X-RateLimit-Reset',
          new Date(now + config.windowMs).toISOString(),
        );

        // Armazena referência para limpar em caso de sucesso
        if (config.skipSuccessfulRequests) {
          res.on('finish', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              const currentRecord = this.store.get(key);
              if (currentRecord) {
                currentRecord.count = Math.max(0, currentRecord.count - 1);
              }
            }
          });
        }

        next();
        return;
      }

      record.count++;

      const remaining = Math.max(0, config.maxRequests - record.count);
      res.setHeader('X-RateLimit-Limit', config.maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', remaining.toString());
      res.setHeader(
        'X-RateLimit-Reset',
        new Date(record.resetTime).toISOString(),
      );

      if (record.count > config.maxRequests) {
        const retryAfter = Math.ceil((record.resetTime - now) / 1000);
        res.setHeader('Retry-After', retryAfter.toString());

        res.status(429).json({
          message:
            config.message ||
            'Muitas tentativas de autenticação. Tente novamente mais tarde.',
          retryAfter: retryAfter,
        });
        return;
      }

      // Limpa contador em caso de sucesso
      if (config.skipSuccessfulRequests) {
        res.on('finish', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const currentRecord = this.store.get(key);
            if (currentRecord) {
              currentRecord.count = Math.max(0, currentRecord.count - 1);
            }
          }
        });
      }

      next();
    };
  }

  // Limiter específico para métodos POST/PUT/DELETE
  createMutationLimiter(config: RateLimitConfig) {
    return (req: Request, res: Response, next: NextFunction): void => {
      // Aplica apenas para métodos de mutação
      if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
        next();
        return;
      }

      const key = this.getKey(req, 'mutation_limit');
      const now = Date.now();
      const record = this.store.get(key);

      if (!record || now > record.resetTime) {
        this.store.set(key, {
          count: 1,
          resetTime: now + config.windowMs,
        });

        res.setHeader('X-RateLimit-Limit', config.maxRequests.toString());
        res.setHeader(
          'X-RateLimit-Remaining',
          (config.maxRequests - 1).toString(),
        );
        res.setHeader(
          'X-RateLimit-Reset',
          new Date(now + config.windowMs).toISOString(),
        );

        next();
        return;
      }

      record.count++;

      const remaining = Math.max(0, config.maxRequests - record.count);
      res.setHeader('X-RateLimit-Limit', config.maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', remaining.toString());
      res.setHeader(
        'X-RateLimit-Reset',
        new Date(record.resetTime).toISOString(),
      );

      if (record.count > config.maxRequests) {
        const retryAfter = Math.ceil((record.resetTime - now) / 1000);
        res.setHeader('Retry-After', retryAfter.toString());

        res.status(429).json({
          message:
            config.message ||
            'Muitas operações de modificação. Tente novamente mais tarde.',
          retryAfter: retryAfter,
        });
        return;
      }

      next();
    };
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// Instância singleton
const rateLimiter = new RateLimiter();

// Rate limiter geral para todas as rotas da API
export const generalRateLimiter = rateLimiter.createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxRequests: 200, // 200 requisições por janela
  message: 'Muitas requisições deste IP. Tente novamente em alguns minutos.',
});

// Rate limiter específico para autenticação
export const authRateLimiter = rateLimiter.createAuthLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxRequests: 10, // 10 tentativas de login
  message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
  skipSuccessfulRequests: true, // Não conta logins bem-sucedidos
});

// Rate limiter para operações de criação/modificação
export const mutationRateLimiter = rateLimiter.createMutationLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxRequests: 100, // 100 operações POST/PUT/DELETE
  message:
    'Muitas operações de modificação. Tente novamente em alguns minutos.',
});

export default rateLimiter;
