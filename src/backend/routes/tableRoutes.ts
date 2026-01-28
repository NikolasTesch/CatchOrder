import { Router } from 'express';
import { tableController } from '../controllers/tableControllers';

const tablesRoutes = Router();

// GET routes
tablesRoutes.get('/', tableController.index);
tablesRoutes.get('/available', tableController.indexAvailable);
tablesRoutes.get('/status/:status', tableController.indexByStatus);
tablesRoutes.get('/:id', tableController.show);

// POST routes
tablesRoutes.post('/', tableController.store);

// PUT routes
tablesRoutes.put('/:id', tableController.update);

// PATCH routes
tablesRoutes.patch('/:id/status', tableController.updateStatus);

// DELETE routes
tablesRoutes.delete('/:id', tableController.delete);

export { tablesRoutes };
