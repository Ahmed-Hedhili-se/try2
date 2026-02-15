const http = require('http');

async function testApi(path, method, role, id) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: {
                'x-user-role': role,
                'x-user-id': id
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: data }));
        });

        req.on('error', (e) => reject(e));
        req.end();
    });
}

async function verify() {
    console.log('--- Deletion Verification Started ---');

    // 1. Create a dummy signalisation to delete
    const db = require('./database.js');
    const dummyId = await new Promise((resolve) => {
        db.run('INSERT INTO signalisation (type, description, village, status) VALUES ("Delete Test", "To be deleted", "Gammarth", "en attente")', function (err) {
            resolve(this.lastID);
        });
    });
    console.log(`Created dummy report with ID: ${dummyId}`);

    // 2. Test Deletion for Bureau National
    console.log('Testing Deletion for Bureau National...');
    const delRes = await testApi(`/api/reports/${dummyId}`, 'DELETE', 'bureau national', '1');
    console.log(`Status: ${delRes.status} (Expected: 200)`);
    console.log(`Body: ${delRes.body}`);

    // 3. Verify it's gone
    const checkSql = 'SELECT * FROM signalisation WHERE id = ?';
    const row = await new Promise((resolve) => {
        db.get(checkSql, [dummyId], (err, row) => resolve(row));
    });
    console.log(`Report ${dummyId} exists: ${!!row} (Expected: false)`);

    console.log('\n--- Deletion Verification Complete ---');
    process.exit(0);
}

verify().catch(console.error);
