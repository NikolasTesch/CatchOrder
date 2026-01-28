import request from 'supertest';
import { app } from '../../src/backend/app';
import { getDb } from '../../src/backend/config/database';
import { runMigrations } from '../../src/backend/database/migrations/migrations';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

describe('User API Integration Tests', () => {
  let authToken: string;
  let adminUserId: string;
  let testUserId: string;

  beforeAll(async () => {
    await runMigrations();
    const db = await getDb();

    // Create an admin/authorized user for operations
    adminUserId = uuidv4();
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminEmail = `admin-${Date.now()}@example.com`;

    await db.run(
      'INSERT INTO users (id, name, username, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [adminUserId, 'Admin User', adminEmail, hashedPassword, 'admin']
    );

    // Login to get token
    const response = await request(app)
      .post('/auth/login')
      .send({
        username: adminEmail,
        password: 'admin123',
      });

    authToken = response.body.token;
  });

  afterAll(async () => {
    const db = await getDb();
    await db.run('DELETE FROM users WHERE id = ?', [adminUserId]);
    if (testUserId) {
      await db.run('DELETE FROM users WHERE id = ?', [testUserId]);
    }
  });

  describe('POST /users', () => {
    it('should create a new user successfully', async () => {
      const newUser = {
        name: 'New Test User',
        username: `newuser-${Date.now()}`,
        password: 'password123',
        role: 'client'
      };

      const response = await request(app)
        .post('/users')
        .send(newUser)
        .expect(201);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name', newUser.name);
      expect(response.body.data).toHaveProperty('username', newUser.username);
      expect(response.body.data).not.toHaveProperty('password'); // Should not return password

      testUserId = response.body.data.id;
    });

    it('should return 409 when creating user with existing username', async () => {
      // First create a user (we can reuse the admin email or create another)
      const duplicateUser = {
        name: 'Duplicate User',
        username: `duplicate-${Date.now()}`,
        password: 'password123',
        role: 'client'
      };

      await request(app).post('/users').send(duplicateUser).expect(201);

      // Try to create again
      const response = await request(app)
        .post('/users')
        .send(duplicateUser)
        .expect(409);

      expect(response.body).toHaveProperty('message', 'Usuário já existe');
    });
  });

  describe('GET /users', () => {
    it('should list all users when authenticated', async () => {
      const response = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1); // At least the admin
    });

    it('should return 401 when not authenticated', async () => {
      await request(app)
        .get('/users')
        .expect(401);
    });
  });

  describe('GET /users/:id', () => {
    it('should return a specific user details', async () => {
      const response = await request(app)
        .get(`/users/${adminUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('id', adminUserId);
    });

    it('should return 404 for non-existent user', async () => {
      await request(app)
        .get(`/users/${uuidv4()}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PUT /users/:id', () => {
    it('should update user details', async () => {
      const updatedName = 'Updated Name';
      const response = await request(app)
        .put(`/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: updatedName
        })
        .expect(200);

      expect(response.body.data).toHaveProperty('name', updatedName);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete a user', async () => {
      await request(app)
        .delete(`/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify deletion
      await request(app)
        .get(`/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      testUserId = ''; // Prevent double cleanup
    });
  });
});
