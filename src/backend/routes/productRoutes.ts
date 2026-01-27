import { Router } from 'express';
import { productsController } from '../controllers/productControllers';

const productsRoutes = Router();

// GET routes
productsRoutes.get('/', productsController.index);
productsRoutes.get('/active', productsController.indexActive);
productsRoutes.get('/search', productsController.search);
productsRoutes.get('/category/:categoryId', productsController.indexByCategory);
productsRoutes.get(
  '/category/:categoryId/active',
  productsController.indexActiveByCat,
);
productsRoutes.get('/:id', productsController.show);

// POST routes
productsRoutes.post('/', productsController.store);

// PUT routes
productsRoutes.put('/:id', productsController.update);

// PATCH routes
productsRoutes.patch('/:id/deactivate', productsController.deactivate);
productsRoutes.patch('/:id/activate', productsController.activate);

// DELETE routes
productsRoutes.delete('/:id', productsController.delete);

export { productsRoutes };
