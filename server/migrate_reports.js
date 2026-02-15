import db from './database.js';

const columns = [
    'file_fiche_initial',
    'file_evaluation',
    'file_plan_action',
    'file_rapport_suivi',
    'file_rapport_final',
    'file_avis_cloture'
];

async function migrate() {
    console.log('--- Starting Database Migration ---');
    for (const col of columns) {
        await new Promise((resolve) => {
            db.run(`ALTER TABLE signalisation ADD COLUMN ${col} TEXT`, (err) => {
                if (err) {
                    if (err.message.includes('duplicate column name')) {
                        console.log(`Column ${col} already exists.`);
                    } else {
                        console.error(`Error adding ${col}:`, err.message);
                    }
                } else {
                    console.log(`Successfully added column: ${col}`);
                }
                resolve();
            });
        });
    }
    console.log('--- Migration Complete ---');
    process.exit(0);
}

migrate();
