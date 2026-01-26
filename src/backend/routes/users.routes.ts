import { Router } from 'express';
import usersController from '../controllers/users.controller';
import { asyncHandler } from '../utils/asyncHandler';

const usersRoutes = Router();

/**
 * Rotas de Usuários
 * Todas as rotas utilizam asyncHandler para tratamento automático de erros assíncronos
 */

// GET /users - Lista todos os usuários
usersRoutes.get('/', asyncHandler(usersController.index));

// GET /users/:id - Busca um usuário específico
usersRoutes.get('/:id', asyncHandler(usersController.show));

// POST /users - Cria um novo usuário
usersRoutes.post('/', asyncHandler(usersController.store));

// PUT /users/:id - Atualiza um usuário existente
usersRoutes.put('/:id', asyncHandler(usersController.update));

// DELETE /users/:id - Remove um usuário
usersRoutes.delete('/:id', asyncHandler(usersController.delete));

export { usersRoutes };
