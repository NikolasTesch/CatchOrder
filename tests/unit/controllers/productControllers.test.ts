import { Request, Response } from 'express';
import { productsController } from '../../../src/backend/controllers/productControllers';
import { ProductModel } from '../../../src/backend/models/productModel.ts';

// Mock ProductModel
jest.mock('../../../src/backend/models/productModel');

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid'),
}));

describe('ProductsController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseJson: jest.Mock;
  let responseStatus: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    responseJson = jest.fn().mockReturnThis();
    responseStatus = jest.fn().mockReturnValue({ json: responseJson });

    mockRequest = {};
    mockResponse = {
      status: responseStatus,
      json: responseJson,
    };
  });

  describe('index', () => {
    it('should return all products with status 200', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1' },
        { id: '2', name: 'Product 2' },
      ];
      (ProductModel.findAll as jest.Mock).mockResolvedValue(mockProducts);

      await productsController.index(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith({
        message: 'Products retrieved successfully',
        data: mockProducts,
      });
    });

    it('should return 500 on error', async () => {
      (ProductModel.findAll as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      );

      await productsController.index(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({
        message: 'Error retrieving products',
        error: 'Database error',
      });
    });
  });

  describe('indexActive', () => {
    it('should return active products with status 200', async () => {
      const mockProducts = [{ id: '1', name: 'Product 1', is_active: true }];
      (ProductModel.findActive as jest.Mock).mockResolvedValue(mockProducts);

      await productsController.indexActive(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith({
        message: 'Active products retrieved successfully',
        data: mockProducts,
      });
    });
  });

  describe('show', () => {
    it('should return product when found', async () => {
      const mockProduct = { id: '1', name: 'Product 1' };
      mockRequest.params = { id: '1' };
      (ProductModel.findById as jest.Mock).mockResolvedValue(mockProduct);

      await productsController.show(
        mockRequest as Request<{ id: string }>,
        mockResponse as Response,
      );

      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith({
        message: 'Product retrieved successfully',
        data: mockProduct,
      });
    });

    it('should return 404 when product not found', async () => {
      mockRequest.params = { id: 'non-existent' };
      (ProductModel.findById as jest.Mock).mockResolvedValue(undefined);

      await productsController.show(
        mockRequest as Request<{ id: string }>,
        mockResponse as Response,
      );

      expect(responseStatus).toHaveBeenCalledWith(404);
      expect(responseJson).toHaveBeenCalledWith({
        message: 'Product not found',
        data: null,
      });
    });
  });

  describe('indexByCategory', () => {
    it('should return products by category', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1', category_id: 'cat-1' },
      ];
      mockRequest.params = { categoryId: 'cat-1' };
      (ProductModel.findByCategory as jest.Mock).mockResolvedValue(
        mockProducts,
      );

      await productsController.indexByCategory(
        mockRequest as Request<{ categoryId: string }>,
        mockResponse as Response,
      );

      expect(ProductModel.findByCategory).toHaveBeenCalledWith('cat-1');
      expect(responseStatus).toHaveBeenCalledWith(200);
    });
  });

  describe('indexActiveByCat', () => {
    it('should return active products by category', async () => {
      const mockProducts = [{ id: '1', is_active: true, category_id: 'cat-1' }];
      mockRequest.params = { categoryId: 'cat-1' };
      (ProductModel.findActiveByCategory as jest.Mock).mockResolvedValue(
        mockProducts,
      );

      await productsController.indexActiveByCat(
        mockRequest as Request<{ categoryId: string }>,
        mockResponse as Response,
      );

      expect(ProductModel.findActiveByCategory).toHaveBeenCalledWith('cat-1');
      expect(responseStatus).toHaveBeenCalledWith(200);
    });
  });

  describe('search', () => {
    it('should return search results', async () => {
      const mockProducts = [{ id: '1', name: 'Water' }];
      mockRequest.query = { q: 'water' };
      (ProductModel.search as jest.Mock).mockResolvedValue(mockProducts);

      await productsController.search(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(ProductModel.search).toHaveBeenCalledWith('water');
      expect(responseStatus).toHaveBeenCalledWith(200);
    });

    it('should return 400 when search query is missing', async () => {
      mockRequest.query = {};

      await productsController.search(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        message: 'Search query is required',
        data: [],
      });
    });
  });

  describe('store', () => {
    it('should create a product and return 201', async () => {
      const productData = {
        category_id: 'cat-1',
        name: 'New Product',
        description: 'Description',
        price: 10.0,
        image_path: '/img/new.jpg',
        is_active: true,
      };
      const createdProduct = { id: 'mocked-uuid', ...productData };

      mockRequest.body = productData;
      (ProductModel.create as jest.Mock).mockResolvedValue(createdProduct);

      await productsController.store(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(ProductModel.create).toHaveBeenCalledWith({
        id: 'mocked-uuid',
        ...productData,
      });
      expect(responseStatus).toHaveBeenCalledWith(201);
      expect(responseJson).toHaveBeenCalledWith({
        message: 'Product created successfully',
        data: createdProduct,
      });
    });

    it('should return 400 when required fields are missing', async () => {
      mockRequest.body = { name: 'Product' }; // missing category_id and price

      await productsController.store(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        message: 'category_id, name, and price are required',
        data: null,
      });
    });
  });

  describe('update', () => {
    it('should update a product and return 200', async () => {
      const updatedProduct = { id: '1', name: 'Updated Product' };
      mockRequest.params = { id: '1' };
      mockRequest.body = { name: 'Updated Product' };
      (ProductModel.update as jest.Mock).mockResolvedValue(updatedProduct);

      await productsController.update(
        mockRequest as Request<{ id: string }>,
        mockResponse as Response,
      );

      expect(ProductModel.update).toHaveBeenCalledWith('1', {
        name: 'Updated Product',
      });
      expect(responseStatus).toHaveBeenCalledWith(200);
    });

    it('should return 404 when product not found', async () => {
      mockRequest.params = { id: 'non-existent' };
      mockRequest.body = { name: 'Updated Product' };
      (ProductModel.update as jest.Mock).mockResolvedValue(undefined);

      await productsController.update(
        mockRequest as Request<{ id: string }>,
        mockResponse as Response,
      );

      expect(responseStatus).toHaveBeenCalledWith(404);
    });
  });

  describe('delete', () => {
    it('should delete a product and return 200', async () => {
      mockRequest.params = { id: '1' };
      (ProductModel.delete as jest.Mock).mockResolvedValue(true);

      await productsController.delete(
        mockRequest as Request<{ id: string }>,
        mockResponse as Response,
      );

      expect(ProductModel.delete).toHaveBeenCalledWith('1');
      expect(responseStatus).toHaveBeenCalledWith(200);
    });

    it('should return 404 when product not found', async () => {
      mockRequest.params = { id: 'non-existent' };
      (ProductModel.delete as jest.Mock).mockResolvedValue(false);

      await productsController.delete(
        mockRequest as Request<{ id: string }>,
        mockResponse as Response,
      );

      expect(responseStatus).toHaveBeenCalledWith(404);
    });
  });

  describe('deactivate', () => {
    it('should deactivate a product and return 200', async () => {
      const deactivatedProduct = { id: '1', is_active: false };
      mockRequest.params = { id: '1' };
      (ProductModel.deactivate as jest.Mock).mockResolvedValue(
        deactivatedProduct,
      );

      await productsController.deactivate(
        mockRequest as Request<{ id: string }>,
        mockResponse as Response,
      );

      expect(ProductModel.deactivate).toHaveBeenCalledWith('1');
      expect(responseStatus).toHaveBeenCalledWith(200);
    });

    it('should return 404 when product not found', async () => {
      mockRequest.params = { id: 'non-existent' };
      (ProductModel.deactivate as jest.Mock).mockResolvedValue(undefined);

      await productsController.deactivate(
        mockRequest as Request<{ id: string }>,
        mockResponse as Response,
      );

      expect(responseStatus).toHaveBeenCalledWith(404);
    });
  });

  describe('activate', () => {
    it('should activate a product and return 200', async () => {
      const activatedProduct = { id: '1', is_active: true };
      mockRequest.params = { id: '1' };
      (ProductModel.activate as jest.Mock).mockResolvedValue(activatedProduct);

      await productsController.activate(
        mockRequest as Request<{ id: string }>,
        mockResponse as Response,
      );

      expect(ProductModel.activate).toHaveBeenCalledWith('1');
      expect(responseStatus).toHaveBeenCalledWith(200);
    });

    it('should return 404 when product not found', async () => {
      mockRequest.params = { id: 'non-existent' };
      (ProductModel.activate as jest.Mock).mockResolvedValue(undefined);

      await productsController.activate(
        mockRequest as Request<{ id: string }>,
        mockResponse as Response,
      );

      expect(responseStatus).toHaveBeenCalledWith(404);
    });
  });
});
