import { Router } from 'express';
import { usersRoutes } from './userRoutes';
import { ordersRoutes } from './orderRoutes';
import { tablesRoutes } from './tableRoutes';
import { categoryRoutes } from './categoryRoutes';
import { productsRoutes } from './productRoutes';
import { authRoutes } from './authRoutes';
import { authenticateToken } from '../middlewares/jwtAuth';
import authController from '../controllers/authController';
import usersController from '../controllers/userControllers';
import { isAdmin, isWaiter, isManager } from '../middlewares/roleAuth';

const routes = Router();

// Rotas públicas
routes.post('/auth/login', authController.login.bind(authController));

// Middleware de autenticação global para todas as rotas abaixo
routes.use(authenticateToken);

routes.use('/auth', authRoutes)
routes.use('/users', usersRoutes);
routes.use('/orders', ordersRoutes);
routes.use('/tables', tablesRoutes);
routes.use('/categories', categoryRoutes);
routes.use('/products', productsRoutes);

export { routes };
