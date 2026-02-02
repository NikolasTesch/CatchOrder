import { ProductModel } from '../../../src/backend/models/productModel';
import { getDb } from '../../../src/backend/config/database';

// Mock the database module
jest.mock('../../../src/backend/config/database');

const mockDb = {
  all: jest.fn(),
  get: jest.fn(),
  run: jest.fn(),
};

(getDb as jest.Mock).mockResolvedValue(mockDb);

describe('ProductModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1', price: 10.0 },
        { id: '2', name: 'Product 2', price: 20.0 },
      ];
      mockDb.all.mockResolvedValue(mockProducts);

      const result = await ProductModel.findAll();

      expect(mockDb.all).toHaveBeenCalledWith('SELECT * FROM products');
      expect(result).toEqual(mockProducts);
    });

    it('should return empty array when no products exist', async () => {
      mockDb.all.mockResolvedValue([]);

      const result = await ProductModel.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return product when found', async () => {
      const mockProduct = { id: '1', name: 'Product 1', price: 10.0 };
      mockDb.get.mockResolvedValue(mockProduct);

      const result = await ProductModel.findById('1');

      expect(mockDb.get).toHaveBeenCalledWith(
        'SELECT * FROM products WHERE id = ?',
        ['1'],
      );
      expect(result).toEqual(mockProduct);
    });

    it('should return undefined when product not found', async () => {
      mockDb.get.mockResolvedValue(undefined);

      const result = await ProductModel.findById('non-existent');

      expect(result).toBeUndefined();
    });
  });

  describe('findByCategory', () => {
    it('should return products by category', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1', category_id: 'cat-1' },
      ];
      mockDb.all.mockResolvedValue(mockProducts);

      const result = await ProductModel.findByCategory('cat-1');

      expect(mockDb.all).toHaveBeenCalledWith(
        'SELECT * FROM products WHERE category_id = ?',
        ['cat-1'],
      );
      expect(result).toEqual(mockProducts);
    });
  });

  describe('findActive', () => {
    it('should return only active products', async () => {
      const mockProducts = [{ id: '1', name: 'Product 1', is_active: true }];
      mockDb.all.mockResolvedValue(mockProducts);

      const result = await ProductModel.findActive();

      expect(mockDb.all).toHaveBeenCalledWith(
        'SELECT * FROM products WHERE is_active = 1',
      );
      expect(result).toEqual(mockProducts);
    });
  });

  describe('findActiveByCategory', () => {
    it('should return active products by category', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1', category_id: 'cat-1', is_active: true },
      ];
      mockDb.all.mockResolvedValue(mockProducts);

      const result = await ProductModel.findActiveByCategory('cat-1');

      expect(mockDb.all).toHaveBeenCalledWith(
        'SELECT * FROM products WHERE category_id = ? AND is_active = 1',
        ['cat-1'],
      );
      expect(result).toEqual(mockProducts);
    });
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const newProduct = {
        id: '1',
        category_id: 'cat-1',
        name: 'New Product',
        description: 'A new product',
        price: 15.0,
        image_path: '/img/new.jpg',
        is_active: true,
      };

      mockDb.run.mockResolvedValue({ changes: 1 });
      mockDb.get.mockResolvedValue(newProduct);

      const result = await ProductModel.create(newProduct);

      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO products'),
        [
          newProduct.id,
          newProduct.category_id,
          newProduct.name,
          newProduct.description,
          newProduct.price,
          newProduct.image_path,
          1,
        ],
      );
      expect(result).toEqual(newProduct);
    });

    it('should handle null description and image_path', async () => {
      const newProduct = {
        id: '1',
        category_id: 'cat-1',
        name: 'New Product',
        price: 15.0,
      };

      const expectedProduct = {
        ...newProduct,
        description: null,
        image_path: null,
        is_active: true,
      };
      mockDb.run.mockResolvedValue({ changes: 1 });
      mockDb.get.mockResolvedValue(expectedProduct);

      const result = await ProductModel.create(newProduct);

      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO products'),
        [
          newProduct.id,
          newProduct.category_id,
          newProduct.name,
          null,
          newProduct.price,
          null,
          1,
        ],
      );
      expect(result).toEqual(expectedProduct);
    });
  });

  describe('update', () => {
    it('should update an existing product', async () => {
      const existingProduct = {
        id: '1',
        category_id: 'cat-1',
        name: 'Old Name',
        description: 'Old desc',
        price: 10.0,
        image_path: '/img/old.jpg',
        is_active: true,
      };

      const updatedProduct = {
        ...existingProduct,
        name: 'New Name',
        price: 20.0,
      };

      mockDb.get
        .mockResolvedValueOnce(existingProduct)
        .mockResolvedValueOnce(updatedProduct);
      mockDb.run.mockResolvedValue({ changes: 1 });

      const result = await ProductModel.update('1', {
        name: 'New Name',
        price: 20.0,
      });

      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE products SET'),
        expect.arrayContaining(['New Name', 20.0, '1']),
      );
      expect(result).toEqual(updatedProduct);
    });

    it('should return undefined when product not found', async () => {
      mockDb.get.mockResolvedValue(undefined);

      const result = await ProductModel.update('non-existent', {
        name: 'New Name',
      });

      expect(result).toBeUndefined();
      expect(mockDb.run).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a product and return true', async () => {
      mockDb.run.mockResolvedValue({ changes: 1 });

      const result = await ProductModel.delete('1');

      expect(mockDb.run).toHaveBeenCalledWith(
        'DELETE FROM products WHERE id = ?',
        ['1'],
      );
      expect(result).toBe(true);
    });

    it('should return false when product not found', async () => {
      mockDb.run.mockResolvedValue({ changes: 0 });

      const result = await ProductModel.delete('non-existent');

      expect(result).toBe(false);
    });
  });

  describe('deactivate', () => {
    it('should deactivate a product', async () => {
      const existingProduct = {
        id: '1',
        name: 'Product 1',
        is_active: true,
      };
      const deactivatedProduct = { ...existingProduct, is_active: false };

      mockDb.get
        .mockResolvedValueOnce(existingProduct)
        .mockResolvedValueOnce(deactivatedProduct);
      mockDb.run.mockResolvedValue({ changes: 1 });

      const result = await ProductModel.deactivate('1');

      expect(result?.is_active).toBe(false);
    });
  });

  describe('activate', () => {
    it('should activate a product', async () => {
      const existingProduct = {
        id: '1',
        name: 'Product 1',
        is_active: false,
      };
      const activatedProduct = { ...existingProduct, is_active: true };

      mockDb.get
        .mockResolvedValueOnce(existingProduct)
        .mockResolvedValueOnce(activatedProduct);
      mockDb.run.mockResolvedValue({ changes: 1 });

      const result = await ProductModel.activate('1');

      expect(result?.is_active).toBe(true);
    });
  });

  describe('search', () => {
    it('should search products by name or description', async () => {
      const mockProducts = [
        { id: '1', name: 'Water', description: 'Mineral water' },
      ];
      mockDb.all.mockResolvedValue(mockProducts);

      const result = await ProductModel.search('water');

      expect(mockDb.all).toHaveBeenCalledWith(
        'SELECT * FROM products WHERE name LIKE ? OR description LIKE ?',
        ['%water%', '%water%'],
      );
      expect(result).toEqual(mockProducts);
    });
  });
});
