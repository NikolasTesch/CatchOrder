import request from 'supertest';
import { app } from '../../src/backend/app';
import { getDb } from '../../src/backend/config/database';
import { runMigrations } from '../../src/backend/database/migrations/migrations';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

describe('Orders API Integration Tests', () => {
  let authToken: string;
  let testUserId: string;
  let testTableId: string;
  let testProductId: string;
  let testOrderId: string;

  beforeAll(async () => {
    await runMigrations();
    const db = await getDb();

    // 1. Create User & Token
    testUserId = uuidv4();
    const hashedPassword = await bcrypt.hash('password123', 10);
    const username = `waiter-${Date.now()}`;

    await db.run(
      'INSERT INTO users (id, name, username, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [testUserId, 'Waiter User', username, hashedPassword, 'client']
    );

    const loginResponse = await request(app)
      .post('/auth/login')
      .send({ username, password: 'password123' });

    authToken = loginResponse.body.token;

    // 2. Create Category & Product (for Order Items)
    const categoryId = uuidv4();
    await db.run('INSERT INTO categories (id, name, slug) VALUES (?, ?, ?)', [categoryId, 'Drinks', `drinks-${Date.now()}`]);

    testProductId = uuidv4();
    await db.run(
      'INSERT INTO products (id, category_id, name, price, is_active) VALUES (?, ?, ?, ?, ?)',
      [testProductId, categoryId, 'Coke', 5.00, 1]
    );

    // 3. Create Table (Manual SQL as TableController is unimplemented)
    testTableId = uuidv4();
    await db.run(
      'INSERT INTO restaurant_tables (id, number, status) VALUES (?, ?, ?)',
      [testTableId, 10, 'AVAILABLE']
    );
  });

  afterAll(async () => {
    const db = await getDb();
    // Cleanup would go here, or rely on in-memory DB if configured (using file based sqlite in this project)
    // For file-based, avoiding complex cleanup instructions for now to keep it safe.
  });

  describe('POST /orders', () => {
    it('should create a new order successfully', async () => {
      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          table_id: testTableId,
          user_id: testUserId
        })
        .expect(201);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('status', 'OPEN');
      expect(response.body.data).toHaveProperty('total', 0);

      testOrderId = response.body.data.id;
    });
  });

  describe('POST /orders/:id/items', () => {
    it('should add an item to the order', async () => {
      const quantity = 2;
      const response = await request(app)
        .post(`/orders/${testOrderId}/items`)
        //.set('Authorization', `Bearer ${authToken}`) // Route is public in routing file currently? Checked file: yes, no auth middleware on addItem
        .send({
          product_id: testProductId,
          quantity: quantity
        })
        .expect(201);

      expect(response.body.data).toHaveProperty('order_id', testOrderId);
      expect(response.body.data).toHaveProperty('product_id', testProductId);
      expect(response.body.data).toHaveProperty('total_item', 10.00); // 5.00 * 2
    });
  });

  describe('GET /orders', () => {
    it('should list all orders', async () => {
      const response = await request(app)
        .get('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      const myOrder = response.body.data.find((o: any) => o.id === testOrderId);
      expect(myOrder).toBeDefined();
      // Total should be updated in the order table (Item add updates order total)
      expect(myOrder.total).toBe(10.00);
    });
  });

  describe('GET /orders/:id', () => {
    it('should return order details', async () => {
      const response = await request(app)
        .get(`/orders/${testOrderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('id', testOrderId);
      expect(response.body.data).toHaveProperty('total', 10.00);
    });
  });

  describe('POST /orders/:id/close', () => {
    it('should close the order', async () => {
      const response = await request(app)
        .post(`/orders/${testOrderId}/close`)
        //.set('Authorization', `Bearer ${authToken}`) // Also no auth in route file for close
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Comanda fechada com sucesso');
      expect(response.body).toHaveProperty('total', 10.00);

      // Verify status is CLOSED
      const db = await getDb();
      const order = await db.get('SELECT * FROM orders WHERE id = ?', [testOrderId]);
      expect(order.status).toBe('CLOSED');
    });
  });
});
