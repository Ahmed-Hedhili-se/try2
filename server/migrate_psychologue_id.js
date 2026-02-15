import db from './database.js';

async function migrate() {
    console.log('--- Adding psychologue_id column ---');
    await new Promise((resolve) => {
        db.run(`ALTER TABLE signalisation ADD COLUMN psychologue_id INTEGER`, (err) => {
            if (err) {
                if (err.message.includes('duplicate column name')) {
                    console.log('Column psychologue_id already exists.');
                } else {
                    console.error('Error adding psychologue_id:', err.message);
                }
            } else {
                console.log('Successfully added column: psychologue_id');
            }
            resolve();
        });
    });
    console.log('--- Migration Complete ---');
    process.exit(0);
}

migrate();
