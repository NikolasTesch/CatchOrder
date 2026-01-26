import sqlite3 from 'sqlite3';
import { env } from './environment';
import path from 'path';

/**
 * Database Configuration
 * 
 * Best Practices:
 * - Use connection pooling for better performance
 * - Handle errors gracefully
 * - Close connections properly
 * - Use prepared statements to prevent SQL injection
 */

interface DatabaseConfig {
  filename: string;
  mode?: number;
  verbose?: boolean;
}

/**
 * Get database configuration based on environment
 */
function getDatabaseConfig(): DatabaseConfig {
  const dbPath = path.resolve(process.cwd(), env.DB_PATH);
  
  const config: DatabaseConfig = {
    filename: dbPath,
    mode: sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  };

  // Enable verbose mode in development
  if (env.NODE_ENV === 'development') {
    config.verbose = true;
  }

  return config;
}

/**
 * Create database connection
 */
export function createConnection(): Promise<sqlite3.Database> {
  const config = getDatabaseConfig();

  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(
      config.filename,
      config.mode,
      (err) => {
        if (err) {
          console.error('❌ Database connection error:', err.message);
          reject(err);
        } else {
          console.log(`✅ Connected to database: ${config.filename}`);
          
          // Enable foreign keys
          db.run('PRAGMA foreign_keys = ON;', (pragmaErr) => {
            if (pragmaErr) {
              console.error('⚠️  Failed to enable foreign keys:', pragmaErr.message);
            }
          });
          
          resolve(db);
        }
      }
    );
  });
}

/**
 * Close database connection
 */
export function closeConnection(db: sqlite3.Database): Promise<void> {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        console.error('❌ Error closing database:', err.message);
        reject(err);
      } else {
        console.log('✅ Database connection closed');
        resolve();
      }
    });
  });
}

/**
 * Execute a SQL query with parameters (prepared statement)
 * Prevents SQL injection
 */
export function query<T = any>(
  db: sqlite3.Database,
  sql: string,
  params: any[] = []
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('❌ Query error:', err.message);
        reject(err);
      } else {
        resolve(rows as T[]);
      }
    });
  });
}

/**
 * Execute a SQL query that returns a single row
 */
export function queryOne<T = any>(
  db: sqlite3.Database,
  sql: string,
  params: any[] = []
): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        console.error('❌ Query error:', err.message);
        reject(err);
      } else {
        resolve(row as T | undefined);
      }
    });
  });
}

/**
 * Execute a SQL statement (INSERT, UPDATE, DELETE)
 */
export function execute(
  db: sqlite3.Database,
  sql: string,
  params: any[] = []
): Promise<{ lastID: number; changes: number }> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        console.error('❌ Execute error:', err.message);
        reject(err);
      } else {
        resolve({
          lastID: this.lastID,
          changes: this.changes,
        });
      }
    });
  });
}

/**
 * Health check - verify database connection
 */
export async function healthCheck(db: sqlite3.Database): Promise<boolean> {
  try {
    await query(db, 'SELECT 1');
    return true;
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return false;
  }
}

// Export singleton instance (optional)
let dbInstance: sqlite3.Database | null = null;

export async function getDatabase(): Promise<sqlite3.Database> {
  if (!dbInstance) {
    dbInstance = await createConnection();
  }
  return dbInstance;
}

export default {
  createConnection,
  closeConnection,
  query,
  queryOne,
  execute,
  healthCheck,
  getDatabase,
};
