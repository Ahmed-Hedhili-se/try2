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

    db.run(`
      CREATE TABLE IF NOT EXISTS signalisation (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        report_id TEXT UNIQUE,
        created_at TEXT,
        status TEXT DEFAULT 'SUBMITTED',
        anonymous INTEGER DEFAULT 0,
        submitter_id INTEGER,
        child_age TEXT,
        relationship TEXT,
        location TEXT,
        type TEXT,
        description TEXT,
        photo_filename TEXT,
        photo_mimetype TEXT,
        photo_size INTEGER,
        audio_filename TEXT,
        audio_mimetype TEXT,
        audio_size INTEGER,
        psy_notes TEXT,
        urgency TEXT,
        director_decision TEXT,
        director_notes TEXT,
        FOREIGN KEY (submitter_id) REFERENCES users (id_user)
      )
    `, (err) => {
      if (err) {
        console.error('Error creating table signalisation', err.message);
      }
    });
  }
});

export default db;
