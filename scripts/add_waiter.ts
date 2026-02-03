import { getDb } from '../src/backend/config/database';
import { hashPassword } from '../src/backend/utils/passwordHash';
import { v4 as uuidv4 } from 'uuid';

(async () => {
  try {
    const db = await getDb();
    const username = 'waiter';
    const existing = await db.get('SELECT * FROM users WHERE username = ?', [username]);
    if (existing) {
      console.log('User already exists:', existing.username);
      process.exit(0);
    }

    const password = 'waiter123';
    const password_hash = await hashPassword(password);
    const id = uuidv4();
    const name = 'Waiter';
    const role = 'waiter';

    await db.run(
      `INSERT INTO users (id, name, username, password_hash, role) VALUES (?, ?, ?, ?, ?)`,
      [id, name, username, password_hash, role]
    );

    console.log('Inserted user', username);
    process.exit(0);
  } catch (err) {
    console.error('Error inserting user:', err);
    process.exit(1);
  }
})();
