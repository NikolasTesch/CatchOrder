/**
 * Middleware de Logging de Segurança
 * Registra eventos importantes para auditoria
 */

interface SecurityEvent {
  timestamp: string;
  type: string;
  ip: string;
  userAgent?: string;
  path: string;
  method: string;
  details?: any;
}

/**
 * Logger de eventos de segurança
 */
class SecurityLogger {
  private events: SecurityEvent[] = [];
  
  log(event: Omit<SecurityEvent, 'timestamp'>) {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };
    
    this.events.push(securityEvent);
    console.log('🔒 [SECURITY]', JSON.stringify(securityEvent, null, 2));
  }
  
  getEvents() {
    return this.events;
  }
  
  clearEvents() {
    this.events = [];
  }
}

export const securityLogger = new SecurityLogger();

/**
 * Middleware para registrar requisições suspeitas
 */
export const logSuspiciousActivity = (req: any, res: any, next: any) => {
  const suspiciousPatterns = [
    /\.\.\//g, // Path traversal
    /<script>/gi, // XSS
    /union.*select/gi, // SQL injection
  ];
  
  const requestString = JSON.stringify({
    body: req.body,
    query: req.query,
    params: req.params,
  });
  
  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(requestString));
  
  if (isSuspicious) {
    securityLogger.log({
      type: 'SUSPICIOUS_ACTIVITY',
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      path: req.path,
      method: req.method,
      details: { body: req.body, query: req.query, params: req.params },
    });
  }
  
  next();
};

/**
 * Middleware para requisições de entrada
 */
export const requestLogger = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Log apenas erros ou requisições lentas
    if (res.statusCode >= 400 || duration > 5000) {
      securityLogger.log({
        type: res.statusCode >= 400 ? 'ERROR_RESPONSE' : 'SLOW_REQUEST',
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        path: req.path,
        method: req.method,
        details: { statusCode: res.statusCode, duration: `${duration}ms` },
      });
    }
  });
  
  next();
};
