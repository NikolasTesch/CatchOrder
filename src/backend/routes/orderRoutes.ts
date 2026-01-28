import { Router } from 'express';
import orderController from '../controllers/orderControllers';

import { authenticateToken } from '../middlewares/jwtAuth';

const ordersRoutes = Router();

ordersRoutes.get('/', authenticateToken, orderController.index);
ordersRoutes.get('/:id', authenticateToken, orderController.show);
ordersRoutes.post('/', authenticateToken, orderController.store);
ordersRoutes.post('/:id/items', orderController.addItem);
ordersRoutes.post('/:id/close', orderController.closeOrder);
ordersRoutes.put('/:id', authenticateToken, orderController.update);
ordersRoutes.delete('/:id', authenticateToken, orderController.delete);

export { ordersRoutes };