import { Request, Response } from 'express';
import { TableModel } from "../models/tableModel";
import type {
  CreateTableDTO,
  UpdateTableDTO,
} from "../../shared/dtos/tableDto";

type IdParam = { id: string };

const tableModel = new TableModel();

class TablesController {
  async index(req: Request, res: Response): Promise<Response> {
    try {
      const tables = await tableModel.findAll();
      return res.status(200).json({
        message: "Lista de mesas",
        data: tables,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao listar mesas",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  async show(req: Request<IdParam>, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const table = await tableModel.findById(id);

      if (!table) {
        return res.status(404).json({ message: "Mesa não encontrada" });
      }

      return res.status(200).json({
        message: `Mesa com ID ${id}`,
        data: table,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao buscar mesa",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  async store(req: Request, res: Response): Promise<Response> {
    try {
      const { number, status } = req.body;

      if (number === undefined) {
        return res
          .status(400)
          .json({ message: "Número da mesa é obrigatório" });
      }

      // Check if table number already exists
      const existingTable = await tableModel.findByNumber(number);
      if (existingTable) {
        return res
          .status(409)
          .json({ message: "Mesa com este número já existe" });
      }

      const newTable: CreateTableDTO = {
        number,
        status,
      };

      const tableId = await tableModel.create(newTable);

      return res.status(201).json({
        message: "Mesa criada com sucesso",
        data: { id: tableId, ...newTable },
      });
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao criar mesa",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  async update(req: Request<IdParam>, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { number, status } = req.body;

      const updateData: UpdateTableDTO = {};
      if (number !== undefined) updateData.number = number;
      if (status !== undefined) updateData.status = status;

      const updated = await tableModel.update(id, updateData);

      if (!updated) {
        return res
          .status(404)
          .json({ message: "Mesa não encontrada ou sem alterações" });
      }

      return res.status(200).json({
        message: `Mesa ${id} atualizada com sucesso`,
        data: updateData,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao atualizar mesa",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  async delete(req: Request<IdParam>, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const deleted = await tableModel.delete(id);

      if (!deleted) {
        return res.status(404).json({ message: "Mesa não encontrada" });
      }

      return res.status(200).json({
        message: `Mesa ${id} removida com sucesso`,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao remover mesa",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }
}

export { TablesController };
export default new TablesController();
