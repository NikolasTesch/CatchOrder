import { Router } from 'express';
import reservationController from '../controllers/reservationControllers';

const reservationsRoutes = Router();

// Get all reservations (supports filtering by status or date via query params)
// Query params: ?status=pending or ?date=2026-01-28
reservationsRoutes.get('/', reservationController.index);

// Check table availability
// GET /reservations/availability/:tableNumber?date=2026-01-28&time=19:00
reservationsRoutes.get(
  '/availability/:tableNumber',
  reservationController.checkAvailability
);

// Get specific reservation by ID
reservationsRoutes.get('/:id', reservationController.show);

// Create new reservation
reservationsRoutes.post('/', reservationController.store);

// Update reservation
reservationsRoutes.put('/:id', reservationController.update);

// Delete reservation
reservationsRoutes.delete('/:id', reservationController.delete);

export { reservationsRoutes };
