import { Router } from 'express';
import ordersController from '../controllers/orders.controller';

const ordersRoutes = Router();

ordersRoutes.get('/', ordersController.index);

ordersRoutes.get('/:id', ordersController.show);

ordersRoutes.post('/', ordersController.store);

ordersRoutes.put('/:id', ordersController.update);

ordersRoutes.delete('/:id', ordersController.delete);

export { ordersRoutes };