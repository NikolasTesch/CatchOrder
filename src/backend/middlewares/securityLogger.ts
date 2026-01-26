/**
 * Middleware de Logging de Segurança
 * Registra eventos importantes para auditoria e detecção de ameaças
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
 * Em produção, deve enviar para sistema centralizado (ELK, Splunk, etc)
 */
class SecurityLogger {
  private events: SecurityEvent[] = [];
  
  log(event: Omit<SecurityEvent, 'timestamp'>) {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };
    
    this.events.push(securityEvent);
    
    // Console log para desenvolvimento
    console.log('🔒 [SECURITY]', JSON.stringify(securityEvent, null, 2));
    
    // TODO: Em produção, enviar para sistema de logging centralizado
    // - Elasticsearch/Kibana (ELK Stack)
    // - Splunk
    // - CloudWatch (AWS)
    // - Application Insights (Azure)
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
    /<script>/gi, // XSS attempt
    /union.*select/gi, // SQL injection
    /javascript:/gi, // XSS
    /on\w+=/gi, // Event handlers (XSS)
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
      details: {
        body: req.body,
        query: req.query,
        params: req.params,
      },
    });
  }
  
  next();
};

/**
 * Middleware para registrar falhas de autenticação
 */
export const logAuthFailure = (req: any) => {
  securityLogger.log({
    type: 'AUTH_FAILURE',
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    path: req.path,
    method: req.method,
    details: {
      username: req.body?.username || req.body?.email,
    },
  });
};

/**
 * Middleware para registrar acessos negados
 */
export const logAccessDenied = (req: any, reason: string) => {
  securityLogger.log({
    type: 'ACCESS_DENIED',
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    path: req.path,
    method: req.method,
    details: { reason },
  });
};

/**
 * Middleware para requisições de entrada
 */
export const requestLogger = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Log apenas se houver erro ou demorar muito
    if (res.statusCode >= 400 || duration > 5000) {
      securityLogger.log({
        type: res.statusCode >= 400 ? 'ERROR_RESPONSE' : 'SLOW_REQUEST',
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        path: req.path,
        method: req.method,
        details: {
          statusCode: res.statusCode,
          duration: `${duration}ms`,
        },
      });
    }
  });
  
  next();
};
