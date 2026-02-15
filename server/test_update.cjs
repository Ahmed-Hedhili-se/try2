const http = require('http');

const data = JSON.stringify({ status: 'en cours de traitement' });

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/signalisations/12/status',
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'psychologues',
        'x-user-id': '7',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    res.on('data', (d) => {
        process.stdout.write(d);
    });
    res.on('end', () => {
        console.log('\n--- Update Finished ---');
        process.exit(0);
    });
});

req.on('error', (error) => {
    console.error(error);
    process.exit(1);
});

req.write(data);
req.end();
