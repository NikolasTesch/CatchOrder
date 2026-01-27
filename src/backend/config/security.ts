/**
 * Configurações de Segurança da Aplicação
 * 
 * Define políticas de segurança HTTP, CORS e proteções contra ataques comuns
 */

import { CorsOptions } from 'cors';
import env from './environment';

/**
 * Lista de origens permitidas para CORS
 * Carregada das variáveis de ambiente
 */
const allowedOrigins = env.CORS_ORIGIN;

/**
 * Configuração do CORS
 * 
 * Best Practice: Em produção, sempre especificar origens permitidas
 * Nunca usar `origin: '*'` em produção
 */
export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    // Permite requisições sem origin (mobile apps, Postman, curl)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origem não permitida pelo CORS'));
    }
  },
  credentials: true, // Permite cookies e autenticação
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // 24 horas - cache de preflight requests
};

/**
 * Configuração do Helmet
 * 
 * Helmet adiciona vários headers de segurança HTTP:
 * - X-Frame-Options: Protege contra clickjacking (iframes maliciosos)
 * - X-Content-Type-Options: Previne MIME type sniffing
 * - X-XSS-Protection: Proteção contra XSS em navegadores antigos
 * - Strict-Transport-Security: Force HTTPS
 * - Content-Security-Policy: Controla recursos que podem ser carregados
 */
export const helmetConfig = {
  // Proteção contra clickjacking (iframes)
  // 'deny' bloqueia todos os iframes | 'sameorigin' permite mesma origem
  frameguard: {
    action: 'sameorigin' as const
  },
  
  // Content Security Policy - Define políticas de carregamento de recursos
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Permite styles inline
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"], // Bloqueia iframes
    },
  },
  
  // HSTS - Force HTTPS (em produção)
  hsts: {
    maxAge: 31536000, // 1 ano
    includeSubDomains: true,
    preload: true,
  },
  
  // Previne MIME type sniffing
  noSniff: true,
  
  // Remove header X-Powered-By (esconde que é Express)
  hidePoweredBy: true,
  
  // XSS Protection (navegadores antigos)
  xssFilter: true,
};

/**
 * Adiciona headers de segurança customizados
 */
export const customSecurityHeaders = (req: any, res: any, next: any) => {
  // Previne que o navegador interprete arquivos como outro MIME type
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Controla informações do referrer
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Desabilita features do navegador que podem ser exploradas
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};
