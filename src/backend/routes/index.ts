import { Router } from 'express';
import { usersRoutes } from './userRoutes';
import { ordersRoutes } from './orderRoutes';
import { tablesRoutes } from './tableRoutes';
import { categoryRoutes } from './categoryRoutes';
import { productsRoutes } from './productRoutes';
import { authRoutes } from './authRoutes';

const routes = Router();

routes.use('/users', usersRoutes);
routes.use('/orders', ordersRoutes);
routes.use('/tables', tablesRoutes);
routes.use('/categories', categoryRoutes);
routes.use('/products', productsRoutes);
routes.use('/auth', authRoutes);

export { routes };