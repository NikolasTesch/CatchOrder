import { Request, Response } from 'express';
import { OrderModel } from '../models/order';

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
      const { status, total, closed_at } = req.body;

      const updatedOrder = await OrderModel.update(id, { status, total, closed_at });

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

      const closedOrder = await OrderModel.close(id);

      if (!closedOrder) {
        return res.status(400).json({ message: 'Não foi possível fechar o pedido (Pedido não encontrado ou já fechado)' });
      }

      return res.status(200).json({
        message: 'Comanda fechada com sucesso',
        total: closedOrder.total
      });

    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao fechar comanda',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id as string;
      const success = await OrderModel.delete(id);

      if (!success) {
        return res.status(404).json({ message: 'Pedido não encontrado' });
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
}

export default new OrdersController();