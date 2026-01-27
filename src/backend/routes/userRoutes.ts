import { Router } from 'express';
import usersController from '../controllers/userControllers';

import { authenticateToken } from '../middlewares/jwtAuth';

const usersRoutes = Router();

// GET /users - Lista todos os usuários
usersRoutes.get('/', authenticateToken, usersController.index);

// GET /users/:id - Busca um usuário específico
usersRoutes.get('/:id', authenticateToken, usersController.show);

//Até o momento isso está publico, mas assim que houver a seed de admin, ele vai ser protegido
usersRoutes.post('/', usersController.store);

// PUT /users/:id - Atualiza um usuário existente
usersRoutes.put('/:id', authenticateToken, usersController.update);

// DELETE /users/:id - Remove um usuário
usersRoutes.delete('/:id', authenticateToken, usersController.delete);

export { usersRoutes };
