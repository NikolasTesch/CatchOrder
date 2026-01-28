import { Router } from 'express';
import categoryControllers from '../controllers/categoryControllers';

const categoryRoutes = Router();

categoryRoutes.get('/', categoryControllers.index);
categoryRoutes.get('/:id', categoryControllers.show);
categoryRoutes.post('/', categoryControllers.store);
categoryRoutes.put('/:id', categoryControllers.update);
categoryRoutes.delete('/:id', categoryControllers.delete);

export { categoryRoutes };
