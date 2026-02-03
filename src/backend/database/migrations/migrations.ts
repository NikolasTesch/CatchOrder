import { getDb } from '../../config/database';
import { runSeeds } from '../seeds/seeds';

/**
 * Executa as migrations do banco de dados
 */
export const runMigrations = async () => {
  const db = await getDb();

  // ========================================
  // TABELA: categories
  // ========================================
  // Removido o campo SLUG da criação
  await db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME
    )
  `);

  // ========================================
  // TABELA: products
  // ========================================
  // Adicionado preparation_time na criação
  await db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      price INTEGER NOT NULL CHECK (price >= 0),
      image_path TEXT,
      is_active BOOLEAN DEFAULT 1,
      preparation_time INTEGER DEFAULT 15,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME,
      FOREIGN KEY (category_id) REFERENCES categories(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
    )
  `);

  // ... (Tabelas de Users, Tables, Orders e OrderItems permanecem iguais)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'waiter')),
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS restaurant_tables (
      id TEXT PRIMARY KEY,
      number INTEGER UNIQUE NOT NULL CHECK (number > 0),
      capacity INTEGER DEFAULT 4 CHECK (capacity > 0),
      status TEXT NOT NULL DEFAULT 'AVAILABLE' 
        CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'RESERVED')),
      waiter_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME,
      FOREIGN KEY (waiter_id) REFERENCES users(id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      table_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'OPEN' 
        CHECK (status IN ('OPEN', 'CLOSED', 'CANCELLED')),
      total INTEGER DEFAULT 0 CHECK (total >= 0),
      tip INTEGER DEFAULT 0 CHECK (tip >= 0),
      observations TEXT,
      opened_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      closed_at DATETIME,
      FOREIGN KEY (table_id) REFERENCES restaurant_tables(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS order_items(
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity INTEGER NOT NULL CHECK(quantity > 0),
      unit_price INTEGER NOT NULL CHECK(unit_price >= 0),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(order_id) REFERENCES orders(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
      FOREIGN KEY(product_id) REFERENCES products(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
    )
  `);

  // ========================================
  // MIGRATIONS DE ALTERAÇÃO (Para bancos existentes)
  // ========================================
  
  // 1. Adicionar campo observations (Legado)
  try {
    await db.exec(`ALTER TABLE orders ADD COLUMN observations TEXT`);
  } catch (error) {}

  // 2. Adicionar preparation_time em products
  try {
    await db.exec(`ALTER TABLE products ADD COLUMN preparation_time INTEGER DEFAULT 15`);
    console.log('✓ Coluna preparation_time adicionada');
  } catch (error) {}

  // 3. Remover slug de categories (SQLite moderno suporta DROP COLUMN)
  try {
    await db.exec(`ALTER TABLE categories DROP COLUMN slug`);
    console.log('✓ Coluna slug removida');
  } catch (error) {
    // Se falhar (versão antiga do SQLite), não tem problema crítico, apenas fica lá sem uso.
  }

  // ========================================
  // ÍNDICES
  // ========================================
  // Removido index de slug
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id)`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active)`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_tables_status ON restaurant_tables(status)`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_tables_waiter_id ON restaurant_tables(waiter_id)`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_orders_table_id ON orders(table_id)`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id)`);

  await runSeeds();
};
