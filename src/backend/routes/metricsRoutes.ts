import { Router } from 'express';
import metricsController from '../controllers/metricsController';

const metricsRoutes = Router();

// Retrieve all insights data
// Query params: ?startDate=ISOString&endDate=ISOString
metricsRoutes.get('/insights', metricsController.getInsights.bind(metricsController));

export { metricsRoutes };
