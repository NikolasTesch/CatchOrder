import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ProductModel } from '../models/productModel';

class ProductsController {
  /**
   * List all products
   * GET /products
   */
  async index(req: Request, res: Response): Promise<Response> {
    try {
      const products = await ProductModel.findAll();
      return res.status(200).json({
        message: "Products retrieved successfully",
        data: products,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error retrieving products",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * List only active products
   * GET /products/active
   */
  async indexActive(req: Request, res: Response): Promise<Response> {
    try {
      const products = await ProductModel.findActive();
      return res.status(200).json({
        message: "Active products retrieved successfully",
        data: products,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error retrieving active products",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get a specific product by ID
   * GET /products/:id
   */
  async show(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id as string;
      const product = await ProductModel.findById(id);

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
          data: null,
        });
      }

      return res.status(200).json({
        message: "Product retrieved successfully",
        data: product,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error retrieving product",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get products by category
   * GET /products/category/:categoryId
   */
  async indexByCategory(req: Request, res: Response): Promise<Response> {
    try {
      const categoryId = req.params.categoryId as string;
      const products = await ProductModel.findByCategory(categoryId);

      return res.status(200).json({
        message: "Products by category retrieved successfully",
        data: products,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error retrieving products by category",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get active products by category
   * GET /products/category/:categoryId/active
   */
  async indexActiveByCat(req: Request, res: Response): Promise<Response> {
    try {
      const categoryId = req.params.categoryId as string;
      const products = await ProductModel.findActiveByCategory(categoryId);

      return res.status(200).json({
        message: "Active products by category retrieved successfully",
        data: products,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error retrieving active products by category",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Search products by name or description
   * GET /products/search?q=query
   */
  async search(req: Request, res: Response): Promise<Response> {
    try {
      const { q } = req.query;

      if (!q || typeof q !== "string") {
        return res.status(400).json({
          message: "Search query is required",
          data: [],
        });
      }

      const products = await ProductModel.search(q);

      return res.status(200).json({
        message: "Search results retrieved successfully",
        data: products,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error searching products",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Create a new product
   * POST /products
   */
  async store(req: Request, res: Response): Promise<Response> {
    try {
      const { category_id, name, description, price, image_path, is_active } =
        req.body;

      if (!category_id || !name || price === undefined) {
        return res.status(400).json({
          message: "category_id, name, and price are required",
          data: null,
        });
      }

      const product = await ProductModel.create({
        id: uuidv4(),
        category_id,
        name,
        description,
        price,
        image_path,
        is_active,
      });

      return res.status(201).json({
        message: "Product created successfully",
        data: product,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error creating product",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Update an existing product
   * PUT /products/:id
   */
  async update(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id as string;
      const updateData = req.body;

      const product = await ProductModel.update(id, updateData);

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
          data: null,
        });
      }

      return res.status(200).json({
        message: "Product updated successfully",
        data: product,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error updating product",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Delete a product
   * DELETE /products/:id
   */
  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id as string;
      const deleted = await ProductModel.delete(id);

      if (!deleted) {
        return res.status(404).json({
          message: "Product not found",
          data: null,
        });
      }

      return res.status(200).json({
        message: "Product deleted successfully",
        data: null,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error deleting product",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Deactivate a product (soft delete)
   * PATCH /products/:id/deactivate
   */
  async deactivate(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id as string;
      const product = await ProductModel.deactivate(id);

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
          data: null,
        });
      }

      return res.status(200).json({
        message: "Product deactivated successfully",
        data: product,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error deactivating product",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Activate a product
   * PATCH /products/:id/activate
   */
  async activate(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id as string;
      const product = await ProductModel.activate(id);

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
          data: null,
        });
      }

      return res.status(200).json({
        message: "Product activated successfully",
        data: product,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error activating product",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export const productsController = new ProductsController();
