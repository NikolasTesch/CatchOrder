import request from 'supertest';
import { app } from '../../src/backend/app';
import { getDb } from '../../src/backend/config/database';
import { runMigrations } from '../../src/backend/database/migrations/migrations';
import { v4 as uuidv4 } from 'uuid';

describe('Products API Integration Tests', () => {
  let testCategoryId: string;
  let testProductId: string;

  beforeAll(async () => {
    await runMigrations();
    const db = await getDb();

    // Create test category
    testCategoryId = uuidv4();
    await db.run('INSERT INTO categories (id, name, slug) VALUES (?, ?, ?)', [
      testCategoryId,
      'Test Category',
      'test-category',
    ]);
  });

  afterAll(async () => {
    const db = await getDb();

    // Clean up test data
    await db.run('DELETE FROM products WHERE category_id = ?', [
      testCategoryId,
    ]);
    await db.run('DELETE FROM categories WHERE id = ?', [testCategoryId]);
  });

  describe('POST /products', () => {
    it('should create a new product', async () => {
      const newProduct = {
        category_id: testCategoryId,
        name: 'Integration Test Product',
        description: 'Product created during integration test',
        price: 25.99,
        image_path: '/img/test-product.jpg',
        is_active: true,
      };

      const response = await request(app)
        .post('/products')
        .send(newProduct)
        .expect(201);

      expect(response.body.message).toBe('Product created successfully');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(newProduct.name);
      expect(response.body.data.price).toBe(newProduct.price);

      testProductId = response.body.data.id;
    });

    it('should return 400 when required fields are missing', async () => {
      const invalidProduct = {
        name: 'Incomplete Product',
      };

      const response = await request(app)
        .post('/products')
        .send(invalidProduct)
        .expect(400);

      expect(response.body.message).toBe(
        'category_id, name, and price are required',
      );
    });
  });

  describe('GET /products', () => {
    it('should return all products', async () => {
      const response = await request(app).get('/products').expect(200);

      expect(response.body.message).toBe('Products retrieved successfully');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /products/active', () => {
    it('should return only active products', async () => {
      const response = await request(app).get('/products/active').expect(200);

      expect(response.body.message).toBe(
        'Active products retrieved successfully',
      );
      expect(Array.isArray(response.body.data)).toBe(true);

      // All returned products should be active
      response.body.data.forEach((product: { is_active: number }) => {
        expect(product.is_active).toBe(1);
      });
    });
  });

  describe('GET /products/:id', () => {
    it('should return a product by id', async () => {
      const response = await request(app)
        .get(`/products/${testProductId}`)
        .expect(200);

      expect(response.body.message).toBe('Product retrieved successfully');
      expect(response.body.data.id).toBe(testProductId);
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .get('/products/non-existent-id')
        .expect(404);

      expect(response.body.message).toBe('Product not found');
    });
  });

  describe('GET /products/category/:categoryId', () => {
    it('should return products by category', async () => {
      const response = await request(app)
        .get(`/products/category/${testCategoryId}`)
        .expect(200);

      expect(response.body.message).toBe(
        'Products by category retrieved successfully',
      );
      expect(Array.isArray(response.body.data)).toBe(true);

      // All returned products should belong to the category
      response.body.data.forEach((product: { category_id: string }) => {
        expect(product.category_id).toBe(testCategoryId);
      });
    });
  });

  describe('GET /products/search', () => {
    it('should search products by query', async () => {
      const response = await request(app)
        .get('/products/search?q=Integration')
        .expect(200);

      expect(response.body.message).toBe(
        'Search results retrieved successfully',
      );
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 400 when query is missing', async () => {
      const response = await request(app).get('/products/search').expect(400);

      expect(response.body.message).toBe('Search query is required');
    });
  });

  describe('PUT /products/:id', () => {
    it('should update a product', async () => {
      const updateData = {
        name: 'Updated Integration Test Product',
        price: 35.99,
      };

      const response = await request(app)
        .put(`/products/${testProductId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Product updated successfully');
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.price).toBe(updateData.price);
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .put('/products/non-existent-id')
        .send({ name: 'Updated Name' })
        .expect(404);

      expect(response.body.message).toBe('Product not found');
    });
  });

  describe('PATCH /products/:id/deactivate', () => {
    it('should deactivate a product', async () => {
      const response = await request(app)
        .patch(`/products/${testProductId}/deactivate`)
        .expect(200);

      expect(response.body.message).toBe('Product deactivated successfully');
      expect(response.body.data.is_active).toBe(0);
    });
  });

  describe('PATCH /products/:id/activate', () => {
    it('should activate a product', async () => {
      const response = await request(app)
        .patch(`/products/${testProductId}/activate`)
        .expect(200);

      expect(response.body.message).toBe('Product activated successfully');
      expect(response.body.data.is_active).toBe(1);
    });
  });

  describe('DELETE /products/:id', () => {
    it('should delete a product', async () => {
      const response = await request(app)
        .delete(`/products/${testProductId}`)
        .expect(200);

      expect(response.body.message).toBe('Product deleted successfully');
    });

    it('should return 404 for already deleted product', async () => {
      const response = await request(app)
        .delete(`/products/${testProductId}`)
        .expect(404);

      expect(response.body.message).toBe('Product not found');
    });
  });
});
