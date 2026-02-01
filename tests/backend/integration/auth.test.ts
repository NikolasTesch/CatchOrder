import request from 'supertest';
import { app } from '../../../src/backend/app';
import { getDb } from '../../../src/backend/config/database';
import { runMigrations } from '../../../src/backend/database/migrations/migrations';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

describe('Auth API Integration Tests', () => {
  let testUserId: string;
  const testEmail = `testauth-${Date.now()}@example.com`;
  const testPassword = 'password123';

  beforeAll(async () => {
    await runMigrations();
    const db = await getDb();

    // Create a user for login testing
    testUserId = uuidv4();
    const hashedPassword = await bcrypt.hash(testPassword, 10);

    await db.run(
      'INSERT INTO users (id, name, username, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [testUserId, 'Auth Test User', testEmail, hashedPassword, 'client']
    );
  });

  afterAll(async () => {
    const db = await getDb();
    await db.run('DELETE FROM users WHERE id = ?', [testUserId]);
  });

  describe('POST /auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: testEmail, // Using email variable as username for simplicity, valid string
          password: testPassword,
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('id', testUserId);
      expect(response.body.user).toHaveProperty('username', testEmail);
    });

    it('should return 401 with invalid password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: testEmail,
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Credenciais inválidas');
    });

    it('should return 401 with non-existent username', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'nonexistentuser',
          password: 'password123',
        })
        .expect(401); // AuthController returns 401 for both invalid user and invalid password

      expect(response.body).toHaveProperty('message', 'Credenciais inválidas');
    });
  });

  describe('GET /auth/me', () => {
    let authToken: string;

    beforeAll(async () => {
      // Login to get token first
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          username: testEmail,
          password: testPassword,
        });
      authToken = loginResponse.body.token;
    });

    it('should return user profile when authenticated', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.user).toHaveProperty('id', testUserId);
      expect(response.body.user).toHaveProperty('username', testEmail);
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.user).not.toHaveProperty('password_hash');
    });

    it('should return 401 when not authenticated', async () => {
      await request(app)
        .get('/auth/me')
        .expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    let authToken: string;

    beforeAll(async () => {
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          username: testEmail,
          password: testPassword,
        });
      authToken = loginResponse.body.token;
    });

    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Logout realizado com sucesso');
    });

    // Note: Since JWT is stateless, "logout" on server side without blacklist usually just means client discards token.
    // If we had a blacklist, we would test that the token relies invalid. 
    // Assuming standard JWT implementation for now where presence of endpoint implies future/current blacklist or cookie clearing.
  });
});
