import { Router } from 'express';
import { ProductController } from '../controllers/productControllers';

const router = Router();

router.get('/', ProductController.getAll);
router.get('/:id', ProductController.getById);
router.get('/category/:categoryId', ProductController.getByCategory);
router.post('/', ProductController.create);
router.put('/:id', ProductController.update);
router.delete('/:id', ProductController.delete);

export const productsRoutes = router; // Correção: Export nomeado
