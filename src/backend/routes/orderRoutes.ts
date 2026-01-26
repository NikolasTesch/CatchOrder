import { Router } from 'express';
import orderController from '../controllers/orderControllers';

const ordersRoutes = Router();


ordersRoutes.post('/', orderController.store);

ordersRoutes.put('/:id', orderController.update);

ordersRoutes.delete('/:id', orderController.delete);

export { ordersRoutes };