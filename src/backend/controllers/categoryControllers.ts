import { Request, Response } from 'express';
import { CategoryModel } from '../models/category';

class CategoriesController {

    async index(req: Request, res: Response): Promise<Response> {
        try {
            const categories = await CategoryModel.findAll();
            return res.status(200).json({
                message: 'Lista de categorias',
                data: categories
            });
        } catch (error) {
            return res.status(500).json({
                message: 'Erro ao listar categorias',
                error: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }

    async show(req: Request, res: Response): Promise<Response> {
        try {
            const id = req.params.id as string;
            const category = await CategoryModel.findById(id);

            if (!category) {
                return res.status(404).json({ message: 'Categoria não encontrada' });
            }

            return res.status(200).json({
                message: `Categoria com ID ${id}`,
                data: category
            });
        } catch (error) {
            return res.status(500).json({
                message: 'Erro ao buscar categoria',
                error: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }

    async store(req: Request, res: Response): Promise<Response> {
        try {
            const { name } = req.body;

            if (!name) {
                return res.status(400).json({ message: 'Nome da categoria é obrigatório' });
            }

            const newCategory = await CategoryModel.create({ name });

            return res.status(201).json({
                message: 'Categoria criada com sucesso',
                data: newCategory
            });
        } catch (error) {
            return res.status(500).json({
                message: 'Erro ao criar categoria',
                error: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }

    async update(req: Request, res: Response): Promise<Response> {
        try {
            const id = req.params.id as string;
            const { name } = req.body;

            const updatedCategory = await CategoryModel.update(id, { name });

            if (!updatedCategory) {
                return res.status(404).json({ message: 'Categoria não encontrada' });
            }

            return res.status(200).json({
                message: `Categoria ${id} atualizada com sucesso`,
                data: updatedCategory
            });
        } catch (error) {
            return res.status(500).json({
                message: 'Erro ao atualizar categoria',
                error: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }

    async delete(req: Request, res: Response): Promise<Response> {
        try {
            const id = req.params.id as string;
            const success = await CategoryModel.delete(id);

            if (!success) {
                return res.status(404).json({ message: 'Categoria não encontrada' });
            }

            return res.status(200).json({
                message: `Categoria ${id} removida com sucesso`
            });
        } catch (error) {
            return res.status(500).json({
                message: 'Erro ao remover categoria',
                error: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }
}

export default new CategoriesController();
