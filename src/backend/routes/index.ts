import { Router } from 'express';
import { usersRoutes } from './userRoutes';
import { ordersRoutes } from './orderRoutes';
import { tablesRoutes } from './tableRoutes';
import { productsRoutes } from './productRoutes';

const routes = Router();

routes.use('/users', usersRoutes);
routes.use('/orders', ordersRoutes);
routes.use('/tables', tablesRoutes);
routes.use('/products', productsRoutes);

export { routes };