import { Router } from 'express';
import authController from '../controllers/authController';
import { authenticateToken } from "../middlewares/jwtAuth";

const authRoutes = Router();

// Rotas protegidas
authRoutes.post('/logout', authenticateToken, authController.logout.bind(authController));
authRoutes.get('/me', authenticateToken, authController.me.bind(authController));

export { authRoutes };
