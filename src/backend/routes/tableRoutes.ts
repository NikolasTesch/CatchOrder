import { Router } from 'express';
import tableController from '../controllers/tableControllers';

const tablesRoutes = Router();

// GET /tables - Lista todas as mesas
tablesRoutes.get('/', tableController.index);

// GET /tables/:id - Busca uma mesa específica pelo ID
tablesRoutes.get('/:id', tableController.show);

// POST /tables - Cria uma nova mesa (ex: mesa 01, mesa 02)
tablesRoutes.post('/', tableController.store);

// PUT /tables/:id - Atualiza status ou número da mesa
tablesRoutes.put('/:id', tableController.update);

// DELETE /tables/:id - Remove uma mesa do sistema
tablesRoutes.delete('/:id', tableController.delete);

export { tablesRoutes };