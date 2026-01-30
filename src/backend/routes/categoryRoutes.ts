import { Router } from 'express';
import categoryControllers from '../controllers/categoryControllers';
import { isAdminOrManager } from '../middlewares/roleAuth';
import {
  validateCategoryCreation,
  validateCategoryUpdate,
  validateCategoryId,
} from '../middlewares/validateCategory';

const categoryRoutes = Router();

// Rotas públicas - acessíveis por todos os usuários autenticados

// Lista todas as categorias de produtos
categoryRoutes.get('/', categoryControllers.index);

// Busca uma categoria específica por ID
categoryRoutes.get('/:id', validateCategoryId, categoryControllers.show);

// Rotas restritas - apenas Admin ou Manager podem acessar
categoryRoutes.use(isAdminOrManager);

// Cria uma nova categoria de produtos
categoryRoutes.post('/', validateCategoryCreation, categoryControllers.store);

// Atualiza os dados de uma categoria existente
categoryRoutes.put(
  '/:id',
  validateCategoryId,
  validateCategoryUpdate,
  categoryControllers.update,
);

// Remove uma categoria do sistema
categoryRoutes.delete('/:id', validateCategoryId, categoryControllers.delete);

export { categoryRoutes };
