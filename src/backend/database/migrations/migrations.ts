import { getDb } from '../../config/database';
import { runSeeds } from '../seeds/seeds';

/**
 * Executa as migrations do banco de dados
 *
 * IMPORTANTE: Preços são armazenados como INTEGER em centavos
 * Exemplo: R$ 10,50 = 1050, R$ 0,99 = 99, R$ 100,00 = 10000
 */
export const runMigrations = async () => {
  const db = await getDb();

  // ========================================
  // TABELA: categories
  // ========================================
  await db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME
    )
  `);

  // ========================================
  // TABELA: products
  // ========================================
  await db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      price INTEGER NOT NULL CHECK (price >= 0),
      image_path TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME,
      FOREIGN KEY (category_id) REFERENCES categories(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
    )
  `);

  // ========================================
  // TABELA: users
  // ========================================
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('manager', 'waiter')),
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME
    )
  `);

  // Migration: Convert 'admin' users to 'manager'
  await db.exec(`UPDATE users SET role = 'manager' WHERE role = 'admin'`);

  // ========================================
  // TABELA: restaurant_tables
  // ========================================
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

  // ========================================
  // TABELA: orders
  // ========================================
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

  // Migration for existing databases: Add observations column if not exists
  try {
    await db.exec(`ALTER TABLE orders ADD COLUMN observations TEXT`);
  } catch (error) {
    // Column likely already exists, ignore error
  }


  // ========================================
  // TABELA: order_items
  // ========================================
  await db.exec(`
    CREATE TABLE IF NOT EXISTS order_items(
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK(quantity > 0),
    unit_price INTEGER NOT NULL CHECK(unit_price >= 0),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    delivered_at DATETIME,
    FOREIGN KEY(order_id) REFERENCES orders(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    FOREIGN KEY(product_id) REFERENCES products(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
  )
  `);

  // Migration for existing databases: Add delivered_at column if not exists
  try {
    const columns = await db.all('PRAGMA table_info(order_items)');
    const deliveredExists = columns.some((c: any) => c.name === 'delivered_at');
    if (!deliveredExists) {
      await db.exec(`ALTER TABLE order_items ADD COLUMN delivered_at DATETIME`);
      console.log('Migration: Added delivered_at to order_items');
    }
  } catch (error) {
    console.error('Migration Error (delivered_at):', error);
  }

  // Migration for existing databases: Add created_at column if not exists
  try {
    const columns = await db.all('PRAGMA table_info(order_items)');
    const createdExists = columns.some((c: any) => c.name === 'created_at');
    if (!createdExists) {
      // SQLite limitation: cannot add column with non-constant default (CURRENT_TIMESTAMP) via ALTER TABLE
      await db.exec(`ALTER TABLE order_items ADD COLUMN created_at DATETIME`);
      // Update existing rows to have a timestamp
      await db.exec(`UPDATE order_items SET created_at = datetime('now') WHERE created_at IS NULL`);
      console.log('Migration: Added created_at to order_items');
    }
  } catch (error) {
    console.error('Migration Error (created_at):', error);
  }

  // ========================================
  // ÍNDICES PARA OTIMIZAÇÃO DE PERFORMANCE
  // ========================================

  // Índices para categories
  await db.exec(
    `CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug)`,
  );

  // Índices para products
  await db.exec(
    `CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id)`,
  );
  await db.exec(
    `CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active)`,
  );

  // Índices para users
  await db.exec(
    `CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`,
  );
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`);

  // Índices para restaurant_tables
  await db.exec(
    `CREATE INDEX IF NOT EXISTS idx_tables_status ON restaurant_tables(status)`,
  );
  await db.exec(
    `CREATE INDEX IF NOT EXISTS idx_tables_waiter_id ON restaurant_tables(waiter_id)`,
  );

  // Índices para orders
  await db.exec(
    `CREATE INDEX IF NOT EXISTS idx_orders_table_id ON orders(table_id)`,
  );
  await db.exec(
    `CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)`,
  );
  await db.exec(
    `CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`,
  );

  // Índices para order_items
  await db.exec(
    `CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)`,
  );
  await db.exec(
    `CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id)`,
  );

  // Executar seeds
  await runSeeds();
};
