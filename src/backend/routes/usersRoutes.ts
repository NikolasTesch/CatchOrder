import { Router } from 'express';
import usersController from '../controllers/usersControllers';
import { asyncHandler } from '../utils/asyncHandler';
import { 
  validateUserCreation,
  validateUserUpdate,
  validateResourceId,
  validatePagination,
} from '../middlewares/validation';
import { createLimiter, authLimiter } from '../middlewares/rateLimiter';

const usersRoutes = Router();

/**
 * Rotas de Usuários
 * 
 * Best Practices implementadas:
 * - AsyncHandler para tratamento de erros assíncronos
 * - Validação de inputs com express-validator
 * - Rate limiting específico por tipo de operação
 * - Sanitização automática de dados
 */

// GET /users - Lista todos os usuários (com paginação)
usersRoutes.get(
  '/',
  validatePagination,
  asyncHandler(usersController.index)
);

// GET /users/:id - Busca um usuário específico
usersRoutes.get(
  '/:id',
  validateResourceId,
  asyncHandler(usersController.show)
);

// POST /users - Cria um novo usuário (rate limit mais restritivo)
usersRoutes.post(
  '/',
  createLimiter, // 10 criações por hora
  validateUserCreation,
  asyncHandler(usersController.store)
);

// PUT /users/:id - Atualiza um usuário existente
usersRoutes.put(
  '/:id',
  validateUserUpdate,
  asyncHandler(usersController.update)
);

// DELETE /users/:id - Remove um usuário (rate limit de autenticação)
usersRoutes.delete(
  '/:id',
  authLimiter, // Operação sensível
  validateResourceId,
  asyncHandler(usersController.delete)
);

export { usersRoutes };
