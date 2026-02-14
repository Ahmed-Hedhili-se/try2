import { registerUser } from './userService.js';
import db from './db.js';

const testUsers = [
    { full_name: 'Alice Psychologue', role: 'psychologues', mail: 'alice@example.com', password: 'hash', ville: 'Paris' },
    { full_name: 'Bob Educateur', role: 'educatrice', mail: 'bob@example.com', password: 'hash', ville: 'Lyon' },
    { full_name: 'John Director', role: 'directeur', mail: 'john@example.com', password: 'hash', ville: 'Marseille' },
];

const runTests = async () => {
    console.log('--- Starting Registration Logic Tests ---');

    for (const user of testUsers) {
        try {
            const result = await registerUser(user);
            console.log(`\nVerified User: ${result.full_name} (${result.role})`);
            console.log(`-> signalisation_psy: ${result.signalisation_psy}`);
            console.log(`-> signalisation_other: ${result.signalisation_other}`);
            console.log(`-> see_all: ${result.see_all}`);
        } catch (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                console.log(`User ${user.full_name} already exists. Skipping insertion.`);
            } else {
                console.error(`Error testing user ${user.full_name}:`, err.message);
            }
        }
    }

    // Final database check
    console.log('\n--- Final Database Contents ---');
    db.all('SELECT id_user, full_name, role, signalisation_psy, signalisation_other, see_all FROM users', [], (err, rows) => {
        if (err) {
            console.error(err.message);
        } else {
            console.table(rows);
            db.close();
        }
    });
};

// Wait a moment for DB to init
setTimeout(runTests, 1000);
