import { Router } from 'express';
import tableController from '../controllers/tableControllers';

import { authenticateToken } from '../middlewares/jwtAuth';

const tablesRoutes = Router();

// GET /tables - Lista todas as mesas
tablesRoutes.get('/', authenticateToken, tableController.index);

// GET /tables/:id - Busca uma mesa específica pelo ID
tablesRoutes.get('/:id', authenticateToken, tableController.show);

// POST /tables - Cria uma nova mesa (ex: mesa 01, mesa 02)
tablesRoutes.post('/', authenticateToken, tableController.store);

// PUT /tables/:id - Atualiza status ou número da mesa
tablesRoutes.put('/:id', authenticateToken, tableController.update);

// DELETE /tables/:id - Remove uma mesa do sistema
tablesRoutes.delete('/:id', authenticateToken, tableController.delete);

export { tablesRoutes };