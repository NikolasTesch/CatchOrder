import { Request, Response, NextFunction } from 'express';
import { securityLogger } from './securityLogger';

/**
 * Middleware global de tratamento de erros
 * 
 * Best Practices:
 * - Nunca expor stack traces em produção
 * - Não vazar informações sensíveis
 * - Registrar erros para auditoria
 * - Retornar mensagens genéricas para usuários
 * 
 * @example
 * app.use(errorHandler);
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log do erro para debugging e auditoria
  const errorLog = {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    timestamp: new Date().toISOString(),
  };

  // Log detalhado apenas no servidor
  console.error('❌ [ERROR]', errorLog);
  
  // Registra erro crítico no security logger
  if (res.statusCode >= 500) {
    securityLogger.log({
      type: 'SERVER_ERROR',
      ip: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('user-agent'),
      path: req.path,
      method: req.method,
      details: {
        message: err.message,
        statusCode: res.statusCode,
      },
    });
  }

  // Determina o status code
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  // Mensagens genéricas por tipo de erro (não expõe detalhes internos)
  const safeMessages: { [key: number]: string } = {
    400: 'Requisição inválida',
    401: 'Autenticação necessária',
    403: 'Acesso negado',
    404: 'Recurso não encontrado',
    413: 'Payload muito grande',
    429: 'Muitas requisições',
    500: 'Erro interno do servidor',
    503: 'Serviço temporariamente indisponível',
  };

  // Mensagem segura para o cliente
  const clientMessage = safeMessages[statusCode] || 'Erro no processamento da requisição';

  // Resposta de erro padronizada
  const errorResponse: any = {
    success: false,
    error: {
      message: clientMessage,
      statusCode,
      timestamp: new Date().toISOString(),
    },
  };

  // Adiciona detalhes APENAS em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.details = err.message;
    errorResponse.error.stack = err.stack;
    errorResponse.error.path = req.path;
  }

  res.status(statusCode).json(errorResponse);
};
