import { Router } from 'express';
import { CategoryController } from '../controllers/categoryControllers';

const router = Router();

router.get('/', CategoryController.getAll);
router.get('/:id', CategoryController.getById);
router.post('/', CategoryController.create);
router.put('/:id', CategoryController.update);
router.delete('/:id', CategoryController.delete);

// CORREÇÃO: Exportando como 'categoryRoutes' (singular) para satisfazer o index.ts
export const categoryRoutes = router; 
export default router;
