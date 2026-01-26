import { Request, Response, NextFunction } from 'express';

/**
 * Middleware global de tratamento de erros
 * Deve ser registrado após todas as rotas no app.ts
 * 
 * @example
 * app.use(errorHandler);
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log do erro para debugging (em produção, usar logger apropriado)
  console.error('Error:', err);

  // Determina o status code
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  // Resposta de erro padronizada
  res.status(statusCode).json({
    message: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
