import { Router } from 'express';
import usersController from '../controllers/users.controller';

const usersRoutes = Router();

/**
 * Rotas de Usuários
 */

// GET /users - Lista todos os usuários
usersRoutes.get('/', usersController.index);

// GET /users/:id - Busca um usuário específico
usersRoutes.get('/:id', usersController.show);

// POST /users - Cria um novo usuário
usersRoutes.post('/', usersController.store);

// PUT /users/:id - Atualiza um usuário existente
usersRoutes.put('/:id', usersController.update);

// DELETE /users/:id - Remove um usuário
usersRoutes.delete('/:id', usersController.delete);

export { usersRoutes };
