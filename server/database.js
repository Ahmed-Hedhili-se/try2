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
      village TEXT,
      signalisation_other INTEGER DEFAULT 0,
      signalisation_psy INTEGER DEFAULT 0,
      see_all INTEGER DEFAULT 0,
      is_approved INTEGER DEFAULT 0
    )`, (err) => {
      if (err) {
        console.error('Error creating table', err.message);
      } else {
        // Migration: Rename ville to village if necessary
        db.run(`ALTER TABLE users RENAME COLUMN ville TO village`, (err) => {
          if (err) {
            // Error is expected if column is already renamed or doesn't exist
            if (!err.message.includes("no such column") && !err.message.includes("duplicate column name")) {
              // console.log("Migration (ville -> village) note:", err.message);
            }
          } else {
            console.log("Database Migration: Renamed 'ville' to 'village' successful.");
          }
        });
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
        village TEXT,
        abuser_name TEXT,
        child_name TEXT,
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
        attached_file TEXT, -- Path to standard file attachment
        audio_record TEXT,  -- Path to voice recording
        psy_notes TEXT,
        urgency TEXT,
        director_decision TEXT,
        director_notes TEXT,
        FOREIGN KEY (submitter_id) REFERENCES users (id_user)
      )
    `, (err) => {
      if (err) {
        console.error('Error creating table signalisation', err.message);
      } else {
        // Migration: Add columns if they don't exist
        db.run(`ALTER TABLE signalisation ADD COLUMN village TEXT`, (err) => { });
        db.run(`ALTER TABLE signalisation ADD COLUMN abuser_name TEXT`, (err) => { });
        db.run(`ALTER TABLE signalisation ADD COLUMN child_name TEXT`, (err) => { });
        db.run(`ALTER TABLE signalisation ADD COLUMN attached_file TEXT`, (err) => { });
        db.run(`ALTER TABLE signalisation ADD COLUMN audio_record TEXT`, (err) => { });
      }
    });

    db.run(`
      CREATE TABLE IF NOT EXISTS signalisation_attachments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT UNIQUE,
        signalisation_id INTEGER,
        filename TEXT,
        original_name TEXT,
        mimetype TEXT,
        type TEXT, -- 'vocal' or 'file'
        created_at TEXT,
        FOREIGN KEY (signalisation_id) REFERENCES signalisation (id)
      )
    `, (err) => {
      if (err) {
        console.error('Error creating table signalisation_attachments', err.message);
      }
    });
  }
});

export default db;
