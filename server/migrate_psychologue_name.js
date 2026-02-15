import db from './database.js';

async function migrate() {
    console.log('--- Adding psychologue column ---');
    await new Promise((resolve) => {
        db.run(`ALTER TABLE signalisation ADD COLUMN psychologue TEXT`, (err) => {
            if (err) {
                if (err.message.includes('duplicate column name')) {
                    console.log('Column psychologue already exists.');
                } else {
                    console.error('Error adding psychologue:', err.message);
                }
            } else {
                console.log('Successfully added column: psychologue');
            }
            resolve();
        });
    });
    console.log('--- Migration Complete ---');
    process.exit(0);
}

migrate();
