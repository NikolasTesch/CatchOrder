
import request from 'supertest';
import { app } from '../../../src/backend/app';
import { getDb } from '../../../src/backend/config/database';
import { runMigrations } from '../../../src/backend/database/migrations/migrations';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

describe('Table API Integration Tests', () => {
  let authToken: string;
  let adminUserId: string;
  let testTableId: string;

  beforeAll(async () => {
    await runMigrations();
    const db = await getDb();

    // Create an admin/authorized user for operations
    adminUserId = uuidv4();
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminEmail = `admin-tables-${Date.now()}@example.com`;

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

    // Clean up any remaining tables
    if (testTableId) {
      await db.run('DELETE FROM restaurant_tables WHERE id = ?', [testTableId]);
    }
    await db.run('DELETE FROM restaurant_tables WHERE number LIKE ?', ['%Test Table%']);
  });

  describe('POST /tables', () => {
    it('should create a new table successfully', async () => {
      const newTable = {
        number: `Test Table ${Date.now()}`,
        status: 'AVAILABLE'
      };

      const response = await request(app)
        .post('/tables')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newTable)
        .expect(201);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('number', newTable.number);
      expect(response.body.data).toHaveProperty('status', 'AVAILABLE');

      testTableId = response.body.data.id;
    });

    it('should return 409 when creating table with existing number', async () => {
      const duplicateTable = {
        number: `Duplicate Table ${Date.now()}`,
        status: 'AVAILABLE'
      };

      // Create first time
      await request(app)
        .post('/tables')
        .set('Authorization', `Bearer ${authToken}`)
        .send(duplicateTable)
        .expect(201);

      // Try to create again
      const response = await request(app)
        .post('/tables')
        .set('Authorization', `Bearer ${authToken}`)
        .send(duplicateTable)
        .expect(409);

      expect(response.body).toHaveProperty('message', 'Table number already exists');
    });

    it('should return 400 when number is missing', async () => {
      const invalidTable = {
        status: 'AVAILABLE'
      };

      await request(app)
        .post('/tables')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidTable)
        .expect(400);
    });
  });

  describe('GET /tables', () => {
    it('should list all tables', async () => {
      const response = await request(app)
        .get('/tables')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should list available tables', async () => {
      const response = await request(app)
        .get('/tables/available')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      // Verify all returned tables are actually AVAILABLE
      response.body.data.forEach((table: any) => {
        expect(table.status).toBe('AVAILABLE');
      });
    });
  });

  describe('GET /tables/:id', () => {
    it('should return a specific table', async () => {
      const response = await request(app)
        .get(`/tables/${testTableId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('id', testTableId);
    });

    it('should return 404 for non-existent table', async () => {
      await request(app)
        .get(`/tables/${uuidv4()}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PUT /tables/:id', () => {
    it('should update table number', async () => {
      const updatedNumber = `Updated Table ${Date.now()}`;

      const response = await request(app)
        .put(`/tables/${testTableId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          number: updatedNumber
        })
        .expect(200);

      expect(response.body.data).toHaveProperty('number', updatedNumber);
    });
  });

  describe('PATCH /tables/:id/status', () => {
    it('should update table status to OCCUPIED', async () => {
      const response = await request(app)
        .patch(`/tables/${testTableId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'OCCUPIED'
        })
        .expect(200);

      expect(response.body.data).toHaveProperty('status', 'OCCUPIED');
    });

    it('should return 400 for invalid status', async () => {
      await request(app)
        .patch(`/tables/${testTableId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'INVALID_STATUS'
        })
        .expect(400);
    });
  });

  describe('DELETE /tables/:id', () => {
    it('should delete a table', async () => {
      await request(app)
        .delete(`/tables/${testTableId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify deletion
      await request(app)
        .get(`/tables/${testTableId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      testTableId = ''; // Prevent double cleanup
    });
  });
});
