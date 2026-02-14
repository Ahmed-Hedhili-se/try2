import sqlite3 from 'sqlite3';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the role-based SQLite database.');

        const schema = `
      CREATE TABLE IF NOT EXISTS users (
        id_user INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT,
        role TEXT,
        mail TEXT UNIQUE,
        password TEXT,
        ville TEXT,
        signalisation_other INTEGER DEFAULT 0,
        signalisation_psy INTEGER DEFAULT 0,
        see_all INTEGER DEFAULT 0
      )
    `;

        db.run(schema, (err) => {
            if (err) {
                console.error('Error creating users table', err.message);
            } else {
                console.log('Users table ready.');
            }
        });
    }
});

export default db;
