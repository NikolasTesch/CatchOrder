import { Request, Response } from 'express';

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