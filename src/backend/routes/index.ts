import { Router } from 'express';
import { usersRoutes } from './userRoutes';
import { ordersRoutes } from './orderRoutes';
import { tablesRoutes } from './tableRoutes';
import { productsRoutes } from './productRoutes';
import { reservationsRoutes } from './reservationRoutes';

const routes = Router();

routes.use('/users', usersRoutes);
routes.use('/orders', ordersRoutes);
routes.use('/tables', tablesRoutes);
routes.use('/products', productsRoutes);
routes.use('/reservations', reservationsRoutes);

export { routes };