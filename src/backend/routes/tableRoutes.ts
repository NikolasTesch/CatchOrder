import { Router } from 'express';
import { tableController } from '../controllers/tableControllers';
import { authenticateToken } from '../middlewares/jwtAuth';

const tablesRoutes = Router();

// GET routes
tablesRoutes.get('/', authenticateToken, tableController.index);
tablesRoutes.get(
  '/available',
  authenticateToken,
  tableController.indexAvailable,
);
// @ts-expect-error - Express Router type limitation with generic Request params
tablesRoutes.get('/:id', authenticateToken, tableController.show);

// POST routes
tablesRoutes.post('/', authenticateToken, tableController.store);

// PUT routes
// @ts-expect-error - Express Router type limitation with generic Request params
tablesRoutes.put('/:id', authenticateToken, tableController.update);

// PATCH routes
tablesRoutes.patch(
  '/:id/status',
  authenticateToken,
  // @ts-expect-error - Express Router type limitation with generic Request params
  tableController.updateStatus,
);

// DELETE routes
// @ts-expect-error - Express Router type limitation with generic Request params
tablesRoutes.delete('/:id', authenticateToken, tableController.delete);

export { tablesRoutes };
