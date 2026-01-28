import { Router } from 'express';
import usersController from '../controllers/userControllers';

const usersRoutes = Router();

// GET /users - Lista todos os usuários
usersRoutes.get('/', usersController.index);

// GET /users/:id - Busca um usuário específico
usersRoutes.get('/:id', usersController.show);

// PUT /users/:id - Atualiza um usuário existente
usersRoutes.put('/:id', usersController.update);

// DELETE /users/:id - Remove um usuário
usersRoutes.delete('/:id', usersController.delete);

export { usersRoutes };
