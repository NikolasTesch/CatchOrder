import { Request, Response } from 'express';

class TablesController {
 
  async index(req: Request, res: Response): Promise<Response> {
    try {
      // TODO: Implementar busca no SQLite (ex: db('tables').select('*'))
      return res.status(200).json({
        message: 'Lista de mesas',
        data: []
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao listar mesas',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }


  async show(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      
      // TODO: Implementar busca por ID no SQLite
      return res.status(200).json({
        message: `Mesa com ID ${id}`,
        data: null
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao buscar mesa',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

 
  async store(req: Request, res: Response): Promise<Response> {
    try {
      const { number, status } = req.body;
      
      // TODO: Implementar lógica de inserção no SQLite
      return res.status(201).json({
        message: 'Mesa criada com sucesso',
        data: { number, status }
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao criar mesa',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  
  async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { number, status } = req.body;
      
      // TODO: Implementar lógica de update no SQLite
      return res.status(200).json({
        message: `Mesa ${id} atualizada com sucesso`,
        data: { number, status }
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao atualizar mesa',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      
      // TODO: Implementar lógica de deleção no SQLite
      return res.status(200).json({
        message: `Mesa ${id} removida com sucesso`
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao remover mesa',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}

export default new TablesController();