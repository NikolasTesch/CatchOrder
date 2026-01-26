import { Request, Response, NextFunction } from 'express';

/**
 * Wrapper para handlers assíncronos do Express
 * Captura erros de Promises rejeitadas e passa para o middleware de erro
 * 
 * @param fn - Função assíncrona do controller
 * @returns Middleware que trata erros automaticamente
 * 
 * @example
 * router.get('/users', asyncHandler(usersController.index));
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
