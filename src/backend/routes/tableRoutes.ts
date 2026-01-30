import { Router } from 'express';
import { tableController } from '../controllers/tableControllers';
import { isAdminOrManager } from '../middlewares/roleAuth';

const tablesRoutes = Router();

// Rotas públicas - acessíveis por todos os usuários autenticados

// Lista todas as mesas cadastradas
tablesRoutes.get('/', tableController.index);

// Lista apenas mesas disponíveis para uso
tablesRoutes.get('/available', tableController.indexAvailable);

tablesRoutes.get('/mine', tableController.indexMine);

// Lista mesas filtradas por status (ocupada, disponível, reservada)

tablesRoutes.get('/status/:status', tableController.indexByStatus);

// Busca uma mesa específica por ID
tablesRoutes.get('/:id', tableController.show);

// Atualiza o status operacional de uma mesa (garçom pode usar)
tablesRoutes.patch('/:id/status', tableController.updateStatus);

// Rotas restritas - apenas Admin ou Manager podem acessar
tablesRoutes.use(isAdminOrManager);

// Cria uma nova mesa no sistema
tablesRoutes.post('/', tableController.store);

// Atualiza os dados de uma mesa existente
tablesRoutes.put('/:id', tableController.update);

// Remove uma mesa do sistema
tablesRoutes.delete('/:id', tableController.delete);

export { tablesRoutes };
