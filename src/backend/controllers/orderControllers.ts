import { Request, Response } from 'express';
import { getDb } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

class OrdersController {

  async index(req: Request, res: Response): Promise<Response> {
    try {
      return res.status(200).json({
        message: 'Lista de pedidos',
        data: []
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
      const { id } = req.params;
      return res.status(200).json({
        message: `Pedido com ID ${id}`,
        data: null
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
      const { table_id, user_id, status, total, opened_at } = req.body;
      return res.status(201).json({
        message: 'Pedido aberto com sucesso',
        data: { table_id, user_id, status, total, opened_at }
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
      const { id } = req.params;
      const { status, total, closed_at } = req.body;
      return res.status(200).json({
        message: `Pedido ${id} atualizado com sucesso`,
        data: { status, total, closed_at }
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao atualizar pedido',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Adiciona um item (prato/bebida) ao pedido
   * POST /orders/:id/items
   */
  async addItem(req: Request, res: Response): Promise<Response> {
    try {
      const { id: order_id } = req.params; // ID do Pedido
      const { product_id, quantity, observation } = req.body;
      const db = await getDb();

      // 1. Buscar o preço do produto
      const product = await db.get('SELECT price, name FROM products WHERE id = ?', [product_id]);

      if (!product) {
        return res.status(404).json({ message: 'Produto não encontrado.' });
      }

      // 2. Calcular total do item
      const unit_price = product.price;
      const total_item = unit_price * quantity;
      const item_id = uuidv4();

      // 3. Inserir na tabela order_items
      // id, order_id, product_id, quantity, unit_price, observation (opcional e se tiver coluna no banco, senao removemos)
      // Pelo migrations que vi: id, order_id, product_id, quantity, unit_price
      // Se quiser observation, precisaria add na migration. Vou assumir o básico primeiro.

      await db.run(
        `INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) values (?, ?, ?, ?, ?)`,
        [item_id, order_id, product_id, quantity, unit_price]
      );

      // 4. Atualizar o total do pedido (opcional aqui, ou deixa pra fechar a comanda)
      // Vamos somar ao total atual do pedido para manter atualizado
      await db.run(
        `UPDATE orders SET total = total + ? WHERE id = ?`,
        [total_item, order_id]
      );

      return res.status(201).json({
        message: 'Item adicionado ao pedido com sucesso',
        data: {
          item_id,
          product_name: product.name,
          quantity,
          unit_price,
          total_item
        }
      });

    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao adicionar item ao pedido',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
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