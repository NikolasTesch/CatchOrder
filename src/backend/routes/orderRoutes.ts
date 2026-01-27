import { Router } from 'express';
import orderController from '../controllers/orderControllers';

const ordersRoutes = Router();


ordersRoutes.post('/', orderController.store);

ordersRoutes.post('/:id/items', orderController.addItem);
ordersRoutes.post('/:id/close', orderController.closeOrder);

ordersRoutes.put('/:id', orderController.update);

ordersRoutes.delete('/:id', orderController.delete);

export { ordersRoutes };