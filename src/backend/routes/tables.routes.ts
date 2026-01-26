import { Router } from 'express';
import tablesController from '../controllers/tables.controller';

const tablesRoutes = Router();

// GET /tables - Lista todas as mesas
tablesRoutes.get('/', tablesController.index);

// GET /tables/:id - Busca uma mesa específica pelo ID
tablesRoutes.get('/:id', tablesController.show);

// POST /tables - Cria uma nova mesa (ex: mesa 01, mesa 02)
tablesRoutes.post('/', tablesController.store);

// PUT /tables/:id - Atualiza status ou número da mesa
tablesRoutes.put('/:id', tablesController.update);

// DELETE /tables/:id - Remove uma mesa do sistema
tablesRoutes.delete('/:id', tablesController.delete);

export { tablesRoutes };