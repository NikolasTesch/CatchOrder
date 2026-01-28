import { Router } from 'express';
import { usersRoutes } from './userRoutes';
import { ordersRoutes } from './orderRoutes';
import { tablesRoutes } from './tableRoutes';
import { categoryRoutes } from './categoryRoutes';
import { productsRoutes } from './productRoutes';
import { authRoutes } from './authRoutes';
import { authenticateToken } from '../middlewares/jwtAuth';

const routes = Router();

// Rotas públicas (antes do middleware de autenticação)
routes.use('/auth', authRoutes);

// Middleware de autenticação global para todas as rotas abaixo
routes.use(authenticateToken);

// Rotas protegidas
routes.use('/users', usersRoutes);
routes.use('/orders', ordersRoutes);
routes.use('/tables', tablesRoutes);
routes.use('/categories', categoryRoutes);
routes.use('/products', productsRoutes);

export { routes };
