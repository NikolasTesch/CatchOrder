import { Router } from 'express';
import categoryControllers from '../controllers/categoryControllers';
import { isAdminOrManager } from '../middlewares/roleAuth';

const categoryRoutes = Router();

// Rotas públicas - acessíveis por todos os usuários autenticados

// Lista todas as categorias de produtos
categoryRoutes.get('/', categoryControllers.index);

// Busca uma categoria específica por ID
categoryRoutes.get('/:id', categoryControllers.show);

// Rotas restritas - apenas Admin ou Manager podem acessar
categoryRoutes.use(isAdminOrManager);

// Cria uma nova categoria de produtos
categoryRoutes.post('/', categoryControllers.store);

// Atualiza os dados de uma categoria existente
categoryRoutes.put('/:id', categoryControllers.update);

// Remove uma categoria do sistema
categoryRoutes.delete('/:id', categoryControllers.delete);

export { categoryRoutes };
