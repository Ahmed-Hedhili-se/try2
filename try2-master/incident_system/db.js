const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to SQLite database.');
        createTable();
    }
});

function createTable() {
    db.run(`
        CREATE TABLE IF NOT EXISTS signalisations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            is_anonymous INTEGER,
            village TEXT,
            abuser_name TEXT,
            child_name TEXT,
            incident_type TEXT,
            urgency_level TEXT,
            description TEXT,
            status TEXT DEFAULT 'en attente'
        )
    `, (err) => {
        if (err) {
            console.error('Error creating table', err.message);
        } else {
            console.log('Table "signalisations" ready.');
        }
    });
}

module.exports = db;
