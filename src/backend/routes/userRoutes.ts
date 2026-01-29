import { Router } from 'express';
import usersController from '../controllers/userControllers';
import { isAdminOrManager } from '../middlewares/roleAuth';

const usersRoutes = Router();

// Todas as rotas de usuários requerem permissão de Admin ou Manager
usersRoutes.use(isAdminOrManager);

// Lista todos os usuários cadastrados no sistema
usersRoutes.get('/', usersController.index);

// Cria um novo usuário (funcionário)
usersRoutes.post('/', usersController.store);

// Busca um usuário específico por ID
usersRoutes.get('/:id', usersController.show);

// Atualiza os dados de um usuário existente
usersRoutes.put('/:id', usersController.update);

// Remove um usuário do sistema
usersRoutes.delete('/:id', usersController.delete);

export { usersRoutes };
