import request from 'supertest';
import { app } from '../../src/backend/app';
import { getDb } from '../../src/backend/config/database';
import { runMigrations } from '../../src/backend/database/migrations/migrations';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

describe('Category API Integration Tests', () => {
  let testCategoryId: string;
  let testToken: string;
  let testUserId: string;

  beforeAll(async () => {
    await runMigrations();
    const db = await getDb();

    // Setup User for Auth
    testUserId = uuidv4();
    const passwordHash = await bcrypt.hash('password123', 10);
    await db.run(
      'INSERT INTO users (id, name, username, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [testUserId, 'Test User', 'testuser@example.com', passwordHash, 'admin']
    );

    // Login to get token
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        username: 'testuser@example.com',
        password: 'password123'
      });

    testToken = loginResponse.body.token;

    // Create a category for retrieval/update/delete tests
    testCategoryId = uuidv4();
    await db.run('INSERT INTO categories (id, name, slug) VALUES (?, ?, ?)', [
      testCategoryId,
      'Initial Test Category',
      'initial-test-category',
    ]);
  });

  afterAll(async () => {
    const db = await getDb();
    await db.run('DELETE FROM categories WHERE id = ?', [testCategoryId]);
    await db.run('DELETE FROM users WHERE id = ?', [testUserId]);
  });

  describe('POST /categories', () => {
    it('should create a new category', async () => {
      const newCategory = {
        name: 'New Integration Category',
      };

      const response = await request(app)
        .post('/categories')
        .set('Authorization', `Bearer ${testToken}`)
        .send(newCategory)
        .expect(201);

      expect(response.body.message).toBe('Categoria criada com sucesso');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(newCategory.name);
      expect(response.body.data.slug).toBe('new-integration-category');

      // Cleanup the created category
      const db = await getDb();
      await db.run('DELETE FROM categories WHERE id = ?', [response.body.data.id]);
    });

    it('should return 400 when name is missing', async () => {
      const response = await request(app)
        .post('/categories')
        .set('Authorization', `Bearer ${testToken}`)
        .send({})
        .expect(400);

      expect(response.body.message).toBe('Nome da categoria é obrigatório');
    });
  });

  describe('GET /categories', () => {
    it('should return all categories', async () => {
      const response = await request(app)
        .get('/categories')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body.message).toBe('Lista de categorias');
      expect(Array.isArray(response.body.data)).toBe(true);
      // Verify our initial category is present
      const found = response.body.data.find((c: any) => c.id === testCategoryId);
      expect(found).toBeTruthy();
      expect(found.name).toBe('Initial Test Category');
    });
  });

  describe('GET /categories/:id', () => {
    it('should return a category by id', async () => {
      const response = await request(app)
        .get(`/categories/${testCategoryId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body.message).toBe(`Categoria com ID ${testCategoryId}`);
      expect(response.body.data.id).toBe(testCategoryId);
      expect(response.body.data.name).toBe('Initial Test Category');
    });

    it('should return 404 for non-existent category', async () => {
      const response = await request(app)
        .get('/categories/non-existent-id')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(404);

      expect(response.body.message).toBe('Categoria não encontrada');
    });
  });

  describe('PUT /categories/:id', () => {
    it('should update a category', async () => {
      const updateData = {
        name: 'Updated Category Name',
      };

      const response = await request(app)
        .put(`/categories/${testCategoryId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe(`Categoria ${testCategoryId} atualizada com sucesso`);
      expect(response.body.data.id).toBe(testCategoryId);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.slug).toBe('updated-category-name');
    });

    it('should return 404 for non-existent category', async () => {
      const response = await request(app)
        .put('/categories/non-existent-id')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ name: 'Update' })
        .expect(404);

      expect(response.body.message).toBe('Categoria não encontrada');
    });
  });

  describe('DELETE /categories/:id', () => {
    it('should delete a category', async () => {
      const response = await request(app)
        .delete(`/categories/${testCategoryId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body.message).toBe(`Categoria ${testCategoryId} removida com sucesso`);
    });

    it('should return 404 for already deleted or non-existent category', async () => {
      const response = await request(app)
        .delete(`/categories/${testCategoryId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(404);

      expect(response.body.message).toBe('Categoria não encontrada');
    });
  });
});
