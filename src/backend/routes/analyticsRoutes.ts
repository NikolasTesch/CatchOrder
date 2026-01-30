import { Router } from 'express';
import analyticsController from '../controllers/analyticsControllers';
// import { authMiddleware } from '../middlewares/authMiddleware'; // Assuming we have auth middleware
// import { adminMiddleware } from '../middlewares/adminMiddleware'; // Assuming we have admin middleware

const router = Router();

// TODO: Add middlewares for auth and admin check
// router.use(authMiddleware); 
// router.use(adminMiddleware);

router.get('/stats', analyticsController.getDashboardStats);
router.get('/daily-sales', analyticsController.getDailySales);
router.get('/top-products', analyticsController.getTopProducts);
router.get('/biggest-sales', analyticsController.getBiggestSales);
router.get('/table-status', analyticsController.getTableStatusStats);
router.get('/recent-orders', analyticsController.getRecentOrders);

export default router;
