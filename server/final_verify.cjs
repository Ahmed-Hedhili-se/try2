const http = require('http');

const testApi = (path, role, id) => new Promise((resolve) => {
    const options = { hostname: 'localhost', port: 5000, path, method: 'GET', headers: { 'x-user-role': role, 'x-user-id': id } };
    http.request(options, (res) => {
        let data = '';
        res.on('data', (c) => data += c);
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).end();
});

async function run() {
    console.log('--- FINAL TEST ---');

    // 1. Global View
    const g = await testApi('/api/global/signalisations', 'directeur', '4');
    const gBody = JSON.parse(g.body);
    const sigs1 = gBody.reports.filter(r => r.village === 'Siliana').length;
    console.log(`Global View - Siliana count: ${sigs1} (Should be 0)`);

    // 2. Analyse View
    const a = await testApi('/api/signalisations?userId=4', 'directeur', '4');
    const aBody = JSON.parse(a.body);
    const sigs2 = aBody.filter(r => r.village === 'Siliana').length;
    console.log(`Analyse View - Siliana count: ${sigs2} (Should be 0)`);

    // 3. IDOR Check
    const s = await testApi('/api/signalisations/16', 'directeur', '4');
    console.log(`IDOR (Report 16) Status: ${s.status} (Should be 403)`);

    process.exit(0);
}
run();
