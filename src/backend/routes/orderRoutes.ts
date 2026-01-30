import { Router } from 'express';
import orderController from '../controllers/orderControllers';
import { isAdminOrManager } from '../middlewares/roleAuth';
import {
  validateOrderCreation,
  validateOrderUpdate,
  validateOrderItem,
  validateOrderId,
} from '../middlewares/validateOrder';

const ordersRoutes = Router();

// Rotas públicas - acessíveis por todos os usuários autenticados

// Lista todos os pedidos do sistema
ordersRoutes.get('/', orderController.index);

// Busca um pedido específico por ID
ordersRoutes.get('/:id', validateOrderId, orderController.show);

// Cria um novo pedido para uma mesa
ordersRoutes.post('/', validateOrderCreation, orderController.store);

// Adiciona itens a um pedido existente
ordersRoutes.post(
  '/:id/items',
  validateOrderId,
  validateOrderItem,
  orderController.addItem,
);

// Remove item do pedido
ordersRoutes.delete(
  '/:id/items/:itemId',
  validateOrderId,
  orderController.removeItem,
);

// Fecha um pedido e gera a conta
ordersRoutes.patch('/:id/close', validateOrderId, orderController.closeOrder);

// Atualiza os dados de um pedido
ordersRoutes.put(
  '/:id',
  validateOrderId,
  validateOrderUpdate,
  orderController.update,
);

// Remove um pedido (apenas Admin ou Manager)
ordersRoutes.delete(
  '/:id',
  validateOrderId,
  isAdminOrManager,
  orderController.delete,
);

export { ordersRoutes };
