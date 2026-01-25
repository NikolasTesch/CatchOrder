import sqlite3 from 'sqlite3';
import path from 'path';

export class DatabaseConnection {
  private static instance: sqlite3.Database;
  private static readonly DB_PATH = path.join(
    process.cwd(),
    'database',
    'app.db',
  );

  static getInstance(): sqlite3.Database {
    if (!this.instance) {
      this.instance = new sqlite3.Database(this.DB_PATH, (err) => {
        if (err) {
          console.error('Erro ao conectar ao banco:', err);
        } else {
          console.log('✓ Conectado ao SQLite');
          this.instance.run('PRAGMA foreign_keys = ON');
          this.initializeTables();
        }
      });
    }
    return this.instance;
  }

  private static initializeTables(): void {
    const db = this.instance;

    const createTablesSQL = `
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE
      );

      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS restaurant_tables (
        id TEXT PRIMARY KEY,
        number INTEGER NOT NULL UNIQUE,
        status TEXT NOT NULL DEFAULT 'available'
      );

      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        category_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        image_path TEXT,
        is_active BOOLEAN DEFAULT 1,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      );

      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        table_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'open',
        total REAL NOT NULL DEFAULT 0,
        opened_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        closed_at DATETIME,
        FOREIGN KEY (table_id) REFERENCES restaurant_tables(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      );
    `;

    db.exec(createTablesSQL, (err) => {
      if (err) {
        console.error('Erro ao criar tabelas:', err);
      } else {
        console.log('✓ Tabelas criadas com sucesso');
      }
    });
  }

  static close(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.instance) {
        this.instance.close((err) => {
          if (err) reject(err);
          else {
            console.log('✓ Conexão fechada');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }
}
