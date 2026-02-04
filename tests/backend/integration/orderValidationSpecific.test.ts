import request from 'supertest';
import { app } from '../../../src/backend/app';
import { getDb } from '../../../src/backend/config/database';
import { runMigrations } from '../../../src/backend/database/migrations/migrations';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

describe('Order Validation Logic', () => {
  let authToken: string;
  let testUserId: string;
  let testTableId: string;
  let testOrderId: string;

  beforeAll(async () => {
    await runMigrations();
    const db = await getDb();

    // 1. Create User & Token
    testUserId = uuidv4();
    const hashedPassword = await bcrypt.hash('password123', 10);
    const username = `waiter-validation-${Date.now()}`;

    await db.run(
      'INSERT INTO users (id, name, username, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [testUserId, 'Validation User', username, hashedPassword, 'waiter']
    );

    const loginResponse = await request(app)
      .post('/auth/login')
      .send({ username, password: 'password123' });

    authToken = loginResponse.body.token;

    // 2. Create Table
    testTableId = uuidv4();
    await db.run(
      'INSERT INTO restaurant_tables (id, number, status) VALUES (?, ?, ?)',
      [testTableId, Math.floor(Math.random() * 10000), 'AVAILABLE']
    );
  });

  beforeEach(async () => {
      // Create a fresh open order for each test
      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          table_id: testTableId,
          user_id: testUserId
        });
      testOrderId = response.body.data.id;
  });

  afterAll(async () => {
    // Cleanup if needed
  });

  it('should close order automatically when updating with invalid table_id', async () => {
    const invalidTableId = uuidv4();
    
    const response = await request(app)
      .put(`/orders/${testOrderId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        table_id: invalidTableId
      })
      .expect(400);

    // Check Error Message
    expect(response.body.message).toMatch(/inconsistência de dados/);

    // Check DB Status
    const db = await getDb();
    const order = await db.get('SELECT * FROM orders WHERE id = ?', [testOrderId]);
    expect(order.status).toBe('CLOSED');
  });

  it('should close order automatically when updating with invalid user_id', async () => {
    const invalidUserId = uuidv4();

    const response = await request(app)
      .put(`/orders/${testOrderId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        user_id: invalidUserId
      })
      .expect(400);

     // Check Error Message
     expect(response.body.message).toMatch(/inconsistência de dados/);

     // Check DB Status
     const db = await getDb();
     const order = await db.get('SELECT * FROM orders WHERE id = ?', [testOrderId]);
     expect(order.status).toBe('CLOSED');
  });

  it('should update successfully with valid table_id', async () => {
    // Create another valid table
    const newTableId = uuidv4();
    const db = await getDb();
    await db.run(
        'INSERT INTO restaurant_tables (id, number, status) VALUES (?, ?, ?)',
        [newTableId, Math.floor(Math.random() * 10000), 'AVAILABLE']
    );

    const response = await request(app)
      .put(`/orders/${testOrderId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        table_id: newTableId
      })
      .expect(200);

    expect(response.body.data.table_id).toBe(newTableId);
    expect(response.body.data.status).toBe('OPEN'); // Should remain OPEN

    // Verify in DB
    const order = await db.get('SELECT * FROM orders WHERE id = ?', [testOrderId]);
    expect(order.table_id).toBe(newTableId);
  });
});
