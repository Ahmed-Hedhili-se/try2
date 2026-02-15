import db from './database.js';

db.all("SELECT id, report_id, attached_file, audio_record FROM signalisation ORDER BY id DESC LIMIT 5", [], (err, rows) => {
    if (err) {
        console.error(err);
    } else {
        console.log('Recent Reports with Attachments:', rows);
    }
    process.exit(0);
});
