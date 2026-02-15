import db from './database.js';

const testUsers = [
    { name: 'Admin One', role: 'directeur', village: 'Gammarth', mail: 'admin@sos.tn' },
    { name: 'Psy Gammarth', role: 'psychologues', village: 'Gammarth', mail: 'psy.gammarth@sos.tn' },
    { name: 'Psy Akouda', role: 'psychologues', village: 'Akouda', mail: 'psy.akouda@sos.tn' }
];

const testReports = [
    { village: 'Gammarth', type: 'Santé', description: 'Gammarth Report', location: 'Gammarth', child_name: 'Child One' },
    { village: 'Akouda', type: 'Violence', description: 'Akouda Report', location: 'Akouda', child_name: 'Child Two' }
];

async function setup() {
    console.log('--- Setting up test data ---');

    for (const user of testUsers) {
        await new Promise((resolve, reject) => {
            db.run(`INSERT OR IGNORE INTO users (full_name, role, village, mail, password, is_approved) VALUES (?, ?, ?, ?, ?, 1)`,
                [user.name, user.role, user.village, user.mail, 'test1234'], (err) => {
                    if (err) console.error(err);
                    resolve();
                });
        });
    }

    const users = await new Promise((resolve) => db.all(`SELECT * FROM users`, (err, rows) => resolve(rows)));
    console.log('Users in DB:', users.length);

    const psyGammarth = users.find(u => u.mail === 'psy.gammarth@sos.tn');
    const psyAkouda = users.find(u => u.mail === 'psy.akouda@sos.tn');

    for (const report of testReports) {
        const submitter = report.village === 'Gammarth' ? psyGammarth : psyAkouda;
        await new Promise((resolve) => {
            db.run(`INSERT INTO signalisation (village, type, description, location, child_name, submitter_id, report_id, created_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [report.village, report.type, report.description, report.location, report.child_name, submitter?.id_user, Math.random().toString(36).substr(2, 9), new Date().toISOString(), 'SUBMITTED'],
                (err) => {
                    if (err) console.error(err);
                    resolve();
                });
        });
    }

    console.log('Reports created.');

    console.log('\n--- User IDs for Testing ---');
    users.forEach(u => console.log(`${u.id_user} | ${u.role} | ${u.village} | ${u.mail}`));

    process.exit(0);
}

setup();
