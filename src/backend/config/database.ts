import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database | null = null;

export const getDb = async (): Promise<Database> => {
    if (db) {
        return db;
    }

    const dbPath = path.resolve(__dirname, '../../../database/restaurante.sqlite');

    db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    return db;
};
