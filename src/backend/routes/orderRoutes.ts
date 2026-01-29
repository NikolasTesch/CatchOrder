import { Router } from 'express';
import orderController from '../controllers/orderControllers';
import { isAdminOrManager } from '../middlewares/roleAuth';

const ordersRoutes = Router();

// Rotas públicas - acessíveis por todos os usuários autenticados

// Lista todos os pedidos do sistema
ordersRoutes.get('/', orderController.index);

// Busca um pedido específico por ID
ordersRoutes.get('/:id', orderController.show);

// Cria um novo pedido para uma mesa
ordersRoutes.post('/', orderController.store);

// Adiciona itens a um pedido existente
ordersRoutes.post('/:id/items', orderController.addItem);

// Fecha um pedido e gera a conta
ordersRoutes.post('/:id/close', orderController.closeOrder);

// Atualiza os dados de um pedido
ordersRoutes.put('/:id', orderController.update);

// Remove um pedido (apenas Admin ou Manager)
ordersRoutes.delete('/:id', isAdminOrManager, orderController.delete);

export { ordersRoutes };
