import { Router } from 'express';
import { productsController } from '../controllers/productControllers';
import { isAdminOrManager } from '../middlewares/roleAuth';

const productsRoutes = Router();

// Rotas públicas - acessíveis por todos os usuários autenticados

// Lista todos os produtos cadastrados
productsRoutes.get('/', productsController.index);

// Lista apenas produtos ativos (disponíveis para venda)
productsRoutes.get('/active', productsController.indexActive);

// Busca produtos por termo de pesquisa
productsRoutes.get('/search', productsController.search);

// Lista todos os produtos de uma categoria específica
productsRoutes.get('/category/:categoryId', productsController.indexByCategory);

// Lista produtos ativos de uma categoria específica
productsRoutes.get(
  '/category/:categoryId/active',
  productsController.indexActiveByCat,
);

// Busca um produto específico por ID
productsRoutes.get('/:id', productsController.show);

// Rotas restritas - apenas Admin ou Manager podem acessar
productsRoutes.use(isAdminOrManager);

// Cria um novo produto no cardápio
productsRoutes.post('/', productsController.store);

// Atualiza os dados de um produto existente
productsRoutes.put('/:id', productsController.update);

// Desativa um produto (remove da venda sem deletar)
productsRoutes.patch('/:id/deactivate', productsController.deactivate);

// Reativa um produto anteriormente desativado
productsRoutes.patch('/:id/activate', productsController.activate);

// Remove permanentemente um produto do sistema
productsRoutes.delete('/:id', productsController.delete);

export { productsRoutes };
