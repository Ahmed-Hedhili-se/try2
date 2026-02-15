import db from './database.js';

const report = {
    village: 'Gammarth',
    type: 'Santé',
    description: 'Test Dossier for Psychologue',
    location: 'Gammarth',
    child_name: 'Enfant Test',
    submitter_id: 7, // Psy Gammarth
    report_id: 'DOSSIER_TEST_1',
    created_at: new Date().toISOString(),
    status: 'cloturé'
};

db.run(`INSERT INTO signalisation (village, type, description, location, child_name, submitter_id, report_id, created_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [report.village, report.type, report.description, report.location, report.child_name, report.submitter_id, report.report_id, report.created_at, report.status],
    (err) => {
        if (err) {
            console.error('Error creating test dossier:', err.message);
        } else {
            console.log('Test dossier created successfully!');
        }
        process.exit(0);
    });
