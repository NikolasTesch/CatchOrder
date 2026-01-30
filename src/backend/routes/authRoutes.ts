import { Router } from 'express';
import authController from '../controllers/authController';

const authRoutes = Router();

// Realiza logout do usuário e limpa o token
authRoutes.post('/logout', authController.logout.bind(authController));

// Retorna os dados do usuário autenticado
authRoutes.get('/me', authController.me.bind(authController));

export { authRoutes };
