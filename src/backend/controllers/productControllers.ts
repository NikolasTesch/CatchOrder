import { Request, Response } from 'express';
import { ProductModel } from '../models/product';
import { v4 as uuidv4 } from 'uuid';
import { Product } from '../../shared/types/product';

export class ProductController {
  static async getAll(req: Request, res: Response) {
    try {
      const products = await ProductModel.findAll();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar produtos' });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      // CORREÇÃO: Cast para string
      const product = await ProductModel.findById(id as string);
      
      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar produto' });
    }
  }

  static async getByCategory(req: Request, res: Response) {
    try {
      const { categoryId } = req.params;
      // CORREÇÃO: Cast para string
      const products = await ProductModel.findByCategory(categoryId as string);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar produtos da categoria' });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const { 
        category_id, 
        name, 
        description, 
        price, 
        image_path, 
        is_active = true,
        preparation_time = 15 
      } = req.body;

      if (!category_id || !name || price === undefined) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando' });
      }

      const product: Product = {
        id: uuidv4(),
        category_id,
        name,
        description,
        price,
        image_path,
        is_active,
        preparation_time
      };

      await ProductModel.create(product);
      res.status(201).json(product);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao criar produto' });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { 
        name, 
        description, 
        price, 
        image_path, 
        is_active,
        preparation_time 
      } = req.body;

      // CORREÇÃO: Cast para string
      const existingProduct = await ProductModel.findById(id as string);
      if (!existingProduct) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      await ProductModel.update(id as string, {
        name,
        description,
        price,
        image_path,
        is_active,
        preparation_time
      });

      const updatedProduct = await ProductModel.findById(id as string);
      res.json(updatedProduct);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar produto' });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // CORREÇÃO: Cast para string
      const existingProduct = await ProductModel.findById(id as string);
      if (!existingProduct) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      await ProductModel.delete(id as string);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Erro ao deletar produto' });
    }
  }
}
