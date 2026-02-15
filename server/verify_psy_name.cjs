const http = require('http');

const data = JSON.stringify({
    status: 'prise en charge',
    psychologue: 'Ahmed HEDHILI TEST'
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/signalisations/12/status',
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'psychologues',
        'x-user-id': '5',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    let responseData = '';
    res.on('data', (d) => {
        responseData += d;
    });
    res.on('end', () => {
        console.log('Response:', responseData);
        process.exit(0);
    });
});

req.on('error', (error) => {
    console.error(error);
    process.exit(1);
});

req.write(data);
req.end();
