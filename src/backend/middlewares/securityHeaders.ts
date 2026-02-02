import { Request, Response, NextFunction } from 'express';

/**
 * Middleware de Security Headers customizado (similar ao Helmet)
 * Configura headers HTTP para proteger contra vulnerabilidades comuns
 */
export const securityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Previne MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Proteção contra clickjacking - DENY é mais seguro que SAMEORIGIN
  res.setHeader('X-Frame-Options', 'DENY');

  // Proteção XSS para browsers antigos (browsers modernos usam CSP)
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Force HTTPS em produção (apenas se não estiver em desenvolvimento)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains',
    );
  }

  // Content Security Policy - Política restritiva
  const cspDirectives = [
    "default-src 'self'", // Apenas recursos do mesmo domínio
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Scripts apenas do domínio (unsafe-inline para compatibilidade)
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // Estilos + Google Fonts
    "font-src 'self' https://fonts.gstatic.com", // Fontes + Google Fonts
    "img-src 'self' data: https:", // Imagens do domínio, data URIs e HTTPS
    "connect-src 'self'", // APIs apenas do mesmo domínio
    "frame-ancestors 'none'", // Não permite ser embedado em iframes
    "base-uri 'self'", // Previne ataques de base tag injection
    "form-action 'self'", // Forms apenas para o mesmo domínio
  ];
  res.setHeader('Content-Security-Policy', cspDirectives.join('; '));

  // Controle de informações do Referrer
  res.setHeader('Referrer-Policy', 'no-referrer');

  // Permissions Policy - Desabilita features desnecessárias
  const permissionsPolicy = [
    'geolocation=()',
    'microphone=()',
    'camera=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()',
  ];
  res.setHeader('Permissions-Policy', permissionsPolicy.join(', '));

  // Remove header que expõe tecnologia do servidor
  res.removeHeader('X-Powered-By');

  next();
};
