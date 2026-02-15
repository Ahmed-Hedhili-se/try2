const http = require('http');

function testGlobalView(role, userId, label) {
    console.log(`\n--- Testing Global View for ${label} ---`);
    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/global/signalisations',
        method: 'GET',
        headers: {
            'x-user-role': role,
            'x-user-id': userId
        }
    };

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            if (res.statusCode !== 200) {
                console.error(`Error ${res.statusCode}: ${data}`);
                return;
            }
            const reports = JSON.parse(data);
            console.log(`Total reports fetched: ${reports.length}`);
            if (reports.length > 0) {
                reports.forEach(r => {
                    console.log(`[ID ${r.id}] Village: ${r.village}, Status: ${r.status}, Psy: ${r.psychologue_nom || 'Non assigné'}`);
                });
            }
        });
    });

    req.on('error', (e) => { console.error(e); });
    req.end();
}

// Test as Directeur (Gammarth)
testGlobalView('directeur', '4', 'Directeur Gammarth');

// Test as Bureau National (All)
setTimeout(() => testGlobalView('bureau national', '999', 'Bureau National'), 1000); // 999 as mock BN id
