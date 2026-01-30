import { getDb } from '../../config/database';
import { runSeeds } from '../seeds/seeds';

export const runMigrations = async () => {
  const db = await getDb();

  // Tabela de Categorias
  await db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL
    )
  `);

  // Tabela de Produtos
  await db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      price INTEGER NOT NULL,
      image_path TEXT,
      is_active BOOLEAN DEFAULT 1,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `);

  // Tabela de Usuários
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME
    )
  `);

  // Tabela de Mesas (Restaurant Tables)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS restaurant_tables (
      id TEXT PRIMARY KEY,
      number INTEGER UNIQUE NOT NULL,
      status TEXT NOT NULL DEFAULT 'AVAILABLE',
      waiter_id TEXT,
      FOREIGN KEY (waiter_id) REFERENCES users(id)
    )
  `);

  try {
    await db.exec(
      `ALTER TABLE restaurant_tables ADD COLUMN waiter_id TEXT REFERENCES users(id)`,
    );
  } catch (error) {
    // Ignore if column already exists
  }



  // Tabela de Pedidos (Orders)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      table_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'OPEN',
      total INTEGER DEFAULT 0,
      tip INTEGER DEFAULT 0,
      opened_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      closed_at DATETIME,
      FOREIGN KEY (table_id) REFERENCES restaurant_tables(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Tabela de Itens do Pedido (Order Items)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price INTEGER NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Executar seeds
  await runSeeds();
};
