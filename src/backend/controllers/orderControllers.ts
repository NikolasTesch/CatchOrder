import { Request, Response } from 'express';
import { OrderModel } from '../models/order';
import { TableModel } from "../models/tableModel";
import { UserModel } from "../models/userModel";

class OrdersController {
  async index(req: Request, res: Response): Promise<Response> {
    try {
      const orders = await OrderModel.findAll();
      return res.status(200).json({
        message: 'Lista de pedidos',
        data: orders
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao listar pedidos',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  async show(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id as string;
      const order = await OrderModel.findById(id);

      if (!order) {
        return res.status(404).json({ message: 'Pedido não encontrado' });
      }

      return res.status(200).json({
        message: `Pedido com ID ${id}`,
        data: order
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao buscar pedido',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  async store(req: Request, res: Response): Promise<Response> {
    try {
      const { table_id, user_id } = req.body;
      const newOrder = await OrderModel.create({ table_id, user_id });

      return res.status(201).json({
        message: 'Pedido aberto com sucesso',
        data: newOrder
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao criar pedido',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  async update(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id as string;
      const { status, total, tip, closed_at, observations, table_id, user_id } =
        req.body;

      // START MODIFICATION: Check existence
      if (table_id) {
        const table = await TableModel.findById(table_id);
        if (!table) {
          await OrderModel.close(id);
          return res.status(400).json({
            message:
              "Pedido fechado por inconsistência de dados (Mesa não encontrada)",
          });
        }
      }

      if (user_id) {
        const user = await UserModel.findById(user_id);
        if (!user) {
          await OrderModel.close(id);
          return res.status(400).json({
            message:
              "Pedido fechado por inconsistência de dados (Usuário não encontrado)",
          });
        }
      }
      // END MODIFICATION

      const updatedOrder = await OrderModel.update(id, {
        status,
        total,
        tip,
        closed_at,
        observations,
        table_id,
        user_id,
      });

      if (!updatedOrder) {
        return res.status(404).json({ message: 'Pedido não encontrado' });
      }

      return res.status(200).json({
        message: `Pedido ${id} atualizado com sucesso`,
        data: updatedOrder
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao atualizar pedido',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  async addItem(req: Request, res: Response): Promise<Response> {
    try {
      const order_id = req.params.id as string;
      const { product_id, quantity } = req.body;

      const item = await OrderModel.addItem(order_id, product_id, quantity);

      if (!item) {
        return res.status(404).json({ message: 'Produto não encontrado ou erro ao adicionar' });
      }

      return res.status(201).json({
        message: 'Item adicionado ao pedido com sucesso',
        data: item
      });

    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao adicionar item ao pedido',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  async closeOrder(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id as string;
      const { tip } = req.body;

      const closedOrder = await OrderModel.close(id, tip);

      if (!closedOrder) {
        return res.status(400).json({ message: 'Não foi possível fechar o pedido (Pedido não encontrado ou já fechado)' });
      }

      return res.status(200).json({
        message: 'Comanda fechada com sucesso',
        status: closedOrder.status
      });

    } catch (error) {
      console.error('Error closing order:', error); // Debug logging
      return res.status(500).json({
        message: 'Erro ao fechar comanda',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  async removeItem(req: Request, res: Response): Promise<Response> {
    try {
      const order_id = req.params.id as string;
      const item_id = req.params.itemId as string;

      const success = await OrderModel.removeItem(order_id, item_id);

      if (!success) {
        return res.status(404).json({ message: 'Item n\u00e3o encontrado no pedido' });
      }

      return res.status(200).json({
        message: 'Item removido com sucesso'
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao remover item',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id as string;
      const success = await OrderModel.delete(id);

      if (!success) {
        return res.status(404).json({ message: 'Pedido n\u00e3o encontrado' });
      }

      return res.status(200).json({
        message: `Pedido ${id} removido com sucesso`
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao remover pedido',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  async deliverItem(req: Request, res: Response): Promise<Response> {
    try {
      const order_id = req.params.id as string;
      const item_id = req.params.itemId as string;
      const { quantity } = req.body;

      const success = await OrderModel.deliverItem(order_id, item_id, quantity);

      if (!success) {
        return res.status(404).json({ message: 'Item n\u00e3o encontrado no pedido ou pedido inv\u00e1lido' });
      }

      return res.status(200).json({
        message: 'Item entregue com sucesso'
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao entregar item',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}

export default new OrdersController();