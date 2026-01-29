import { Router } from 'express';
import authController from '../controllers/authController';

const authRoutes = Router();

authRoutes.post('/logout', authController.logout.bind(authController));
authRoutes.get('/me', authController.me.bind(authController));

export { authRoutes };
