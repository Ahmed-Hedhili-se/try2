import db from './database.js';

db.all("SELECT id, report_id, child_name FROM signalisation LIMIT 10", [], (err, rows) => {
    if (err) {
        console.error(err);
    } else {
        console.log('Signalisations:', rows);
    }
    process.exit(0);
});
