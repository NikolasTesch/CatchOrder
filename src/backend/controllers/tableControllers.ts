import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { TableModel } from '../models/tableModel';
import { TableStatus } from '../../shared/types/table';

interface IdParam {
  id: string;
}

class TablesController {
  /**
   * List all tables
   * GET /tables
   */
  async index(req: Request, res: Response): Promise<void> {
    try {
      const tables = await TableModel.findAll();
      res.status(200).json({
        message: 'Tables retrieved successfully',
        data: tables,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error retrieving tables',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get a specific table by ID
   * GET /tables/:id
   */
  async show(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const table = await TableModel.findById(id);

      if (!table) {
        res.status(404).json({
          message: 'Table not found',
          data: null,
        });
        return;
      }

      res.status(200).json({
        message: 'Table retrieved successfully',
        data: table,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error retrieving table',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Create a new table
   * POST /tables
   */
  async store(req: Request, res: Response): Promise<void> {
    try {
      const { number, status } = req.body;

      if (!number) {
        res.status(400).json({
          message: 'Table number is required',
          data: null,
        });
        return;
      }

      // Check if table number already exists
      const existingTable = await TableModel.findByNumber(number);
      if (existingTable) {
        res.status(409).json({
          message: 'Table number already exists',
          data: null,
        });
        return;
      }

      const table = await TableModel.create({
        id: uuidv4(),
        number,
        status: status || TableStatus.AVAILABLE,
      });

      res.status(201).json({
        message: 'Table created successfully',
        data: table,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error creating table',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Update an existing table
   * PUT /tables/:id
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const updateData = req.body;

      // If updating number, check for duplicates
      if (updateData.number) {
        const existingTable = await TableModel.findByNumber(updateData.number);
        if (existingTable && existingTable.id !== id) {
          res.status(409).json({
            message: 'Table number already exists',
            data: null,
          });
          return;
        }
      }

      const table = await TableModel.update(id, updateData);

      if (!table) {
        res.status(404).json({
          message: 'Table not found',
          data: null,
        });
        return;
      }

      res.status(200).json({
        message: 'Table updated successfully',
        data: table,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error updating table',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Delete a table
   * DELETE /tables/:id
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;

      const deleted = await TableModel.delete(id);

      if (!deleted) {
        res.status(404).json({
          message: 'Table not found',
          data: null,
        });
        return;
      }

      res.status(200).json({
        message: 'Table deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error deleting table',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get available tables
   * GET /tables/available
   */
  async indexAvailable(req: Request, res: Response): Promise<void> {
    try {
      const tables = await TableModel.findAvailable();
      res.status(200).json({
        message: 'Available tables retrieved successfully',
        data: tables,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error retrieving available tables',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Update table status
   * PATCH /tables/:id/status
   */
  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { status } = req.body;

      if (!status || !Object.values(TableStatus).includes(status)) {
        res.status(400).json({
          message: 'Valid status is required (AVAILABLE, OCCUPIED, RESERVED)',
          data: null,
        });
        return;
      }

      const table = await TableModel.updateStatus(id, status);

      if (!table) {
        res.status(404).json({
          message: 'Table not found',
          data: null,
        });
        return;
      }

      res.status(200).json({
        message: 'Table status updated successfully',
        data: table,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error updating table status',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export const tableController = new TablesController();
