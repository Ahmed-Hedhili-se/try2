import sqlite3 from 'sqlite3';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to SQLite database.');
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id_user INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT,
      role TEXT,
      mail TEXT UNIQUE,
      password TEXT,
      ville TEXT,
      signalisation_other INTEGER DEFAULT 0,
      signalisation_psy INTEGER DEFAULT 0,
      see_all INTEGER DEFAULT 0,
      is_approved INTEGER DEFAULT 0
    )`, (err) => {
      if (err) {
        console.error('Error creating table', err.message);
      }
    });
  }
});

export default db;
