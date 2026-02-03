import { Request, Response } from 'express';
import { CategoryModel } from '../models/category';
import { v4 as uuidv4 } from 'uuid';

export class CategoryController {
  static async getAll(req: Request, res: Response) {
    try {
      const categories = await CategoryModel.findAll();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar categorias' });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const category = await CategoryModel.findById(id as string);
      
      if (!category) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }
      
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar categoria' });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Nome é obrigatório' });
      }

      // CORREÇÃO: Passando ID gerado e name
      const newCategory = await CategoryModel.create({ 
        id: uuidv4(),
        name 
      });
      
      res.status(201).json(newCategory);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar categoria' });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name } = req.body;

      // Primeiro verifica se existe
      const existing = await CategoryModel.findById(id as string);
      if (!existing) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      // Executa o update (que retorna void)
      await CategoryModel.update(id as string, { name });
      
      // Busca o atualizado para retornar
      const updated = await CategoryModel.findById(id as string);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar categoria' });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const existing = await CategoryModel.findById(id as string);
      if (!existing) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      await CategoryModel.delete(id as string);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Erro ao deletar categoria' });
    }
  }
}
