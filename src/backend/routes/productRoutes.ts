import { Router } from 'express';
import { productsController } from '../controllers/productControllers';
import { isAdminOrManager } from '../middlewares/roleAuth';
import {
  validateProductCreation,
  validateProductUpdate,
  validateProductId,
  validateCategoryId,
} from '../middlewares/validateProduct';

const productsRoutes = Router();

// Rotas públicas - acessíveis por todos os usuários autenticados

// Lista todos os produtos cadastrados
productsRoutes.get('/', productsController.index);

// Lista apenas produtos ativos (disponíveis para venda)
productsRoutes.get('/active', productsController.indexActive);

// Busca produtos por termo de pesquisa
productsRoutes.get('/search', productsController.search);

// Lista todos os produtos de uma categoria específica
productsRoutes.get(
  '/category/:categoryId',
  validateCategoryId,
  productsController.indexByCategory,
);

// Lista produtos ativos de uma categoria específica
productsRoutes.get(
  '/category/:categoryId/active',
  validateCategoryId,
  productsController.indexActiveByCat,
);

// Busca um produto específico por ID
productsRoutes.get('/:id', validateProductId, productsController.show);

// Rotas restritas - apenas Admin ou Manager podem acessar
productsRoutes.use(isAdminOrManager);

// Cria um novo produto no cardápio
productsRoutes.post('/', validateProductCreation, productsController.store);

// Atualiza os dados de um produto existente
productsRoutes.put(
  '/:id',
  validateProductId,
  validateProductUpdate,
  productsController.update,
);

// Desativa um produto (remove da venda sem deletar)
productsRoutes.patch(
  '/:id/deactivate',
  validateProductId,
  productsController.deactivate,
);

// Reativa um produto anteriormente desativado
productsRoutes.patch(
  '/:id/activate',
  validateProductId,
  productsController.activate,
);

// Remove permanentemente um produto do sistema
productsRoutes.delete('/:id', validateProductId, productsController.delete);

export { productsRoutes };
