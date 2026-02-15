const http = require('http');

async function testApi(path, role, id) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: 'GET',
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
    console.log('--- Verification Started ---');

    // Test 1: Global View for Akouda Director (Should only see Report 15)
    console.log('Testing Global View for Akouda Director (UserID: 4)...');
    const globalRes = await testApi('/api/global/signalisations', 'directeur', '4');
    const globalData = JSON.parse(globalRes.body);
    const foundSiliana = globalData.reports.some(r => r.id === 16);
    const foundAkouda = globalData.reports.some(r => r.id === 15);

    console.log(`Global Status: ${globalRes.status}`);
    console.log(`Found Akouda (Report 15): ${foundAkouda}`);
    console.log(`Found Siliana (Report 16): ${foundSiliana} (Should be false)`);

    // Test 1b: Regular Analyse View for Akouda Director (Should only see Report 15)
    console.log('\nTesting Regular Analyse View for Akouda Director (UserID: 4)...');
    const analyseRes = await testApi('/api/signalisations?userId=4', 'directeur', '4');
    const analyseReports = JSON.parse(analyseRes.body);
    const foundSilianaInAnalyse = analyseReports.some(r => r.id === 16);
    const foundAkoudaInAnalyse = analyseReports.some(r => r.id === 15);

    console.log(`Analyse Status: ${analyseRes.status}`);
    console.log(`Found Akouda (Report 15): ${foundAkoudaInAnalyse}`);
    console.log(`Found Siliana (Report 16): ${foundSilianaInAnalyse} (Should be false)`);

    // Test 2: Single View for own village (Report 15)
    console.log('\nTesting Single View for own village (Report 15)...');
    const singleOwnRes = await testApi('/api/signalisations/15', 'directeur', '4');
    console.log(`Status: ${singleOwnRes.status}`);
    if (singleOwnRes.status === 200) {
        const report = JSON.parse(singleOwnRes.body);
        console.log(`Report ID: ${report.id}, Village: ${report.village}`);
    }

    // Test 3: IDOR Attack (Trying to access Siliana Report 16)
    console.log('\nTesting IDOR Protection (Trying to access Report 16 as Akouda Director)...');
    const attackRes = await testApi('/api/signalisations/16', 'directeur', '4');
    console.log(`Status: ${attackRes.status} (Expected: 403)`);
    console.log(`Body: ${attackRes.body}`);

    console.log('\n--- Verification Complete ---');
    process.exit(0);
}

verify().catch(console.error);
