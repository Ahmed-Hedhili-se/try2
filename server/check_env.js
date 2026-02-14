import db from './database.js';
import pkg from './package.json' assert { type: 'json' };

async function check() {
    console.log('--- Environment Check ---');
    console.log(`Node Version: ${process.version}`);

    // Check dependencies
    const deps = Object.keys(pkg.dependencies);
    console.log('Dependencies:', deps.join(', '));

    // Check Database
    db.get('PRAGMA table_info(users)', (err, row) => {
        if (err) {
            console.error('❌ Database Error:', err.message);
        } else {
            console.log('✅ Database connected and users table found.');
            db.all('SELECT COUNT(*) as count FROM users', (err, rows) => {
                if (err) {
                    console.error('❌ Query Error:', err.message);
                } else {
                    console.log(`✅ Current user count: ${rows[0].count}`);
                }
                db.close();
            });
        }
    });
}

check();
