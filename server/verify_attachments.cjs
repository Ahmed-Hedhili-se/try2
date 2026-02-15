const http = require('http');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5000/api';
const REPORT_ID = 1; // Assuming report ID 1 exists

async function testAttachments() {
    console.log('--- Testing Signalisation Attachments ---');

    // 1. Fetch existing attachments
    console.log('\n1. Fetching existing attachments...');
    const atts = await get(`/signalisations/${REPORT_ID}/attachments`);
    console.log(`Found ${atts.length} attachments.`);

    // 2. Upload a mock attachment (vocal)
    console.log('\n2. Uploading mock vocal message...');
    const mockFile = path.join(__dirname, 'mock_vocal.wav');
    fs.writeFileSync(mockFile, 'mock audio content');

    try {
        const uploadResult = await uploadFile(REPORT_ID, mockFile, 'vocal');
        console.log('Upload successful:', uploadResult.message);
        console.log('Attachment ID:', uploadResult.attachment.uuid);

        // 3. Fetch again to verify
        const updatedAtts = await get(`/signalisations/${REPORT_ID}/attachments`);
        const found = updatedAtts.find(a => a.uuid === uploadResult.attachment.uuid);
        if (found) {
            console.log('✅ Verification successful: Attachment found in list.');
        } else {
            console.error('❌ Verification failed: Attachment NOT found in list.');
        }
    } catch (err) {
        console.error('❌ Error during upload test:', err.message);
    } finally {
        if (fs.existsSync(mockFile)) fs.unlinkSync(mockFile);
    }
}

function get(path) {
    return new Promise((resolve, reject) => {
        http.get(API_URL + path, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
    });
}

function uploadFile(reportId, filePath, type) {
    return new Promise((resolve, reject) => {
        const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
        const fileName = path.basename(filePath);

        let body = `--${boundary}\r\n`;
        body += `Content-Disposition: form-data; name="type"\r\n\r\n${type}\r\n`;
        body += `--${boundary}\r\n`;
        body += `Content-Disposition: form-data; name="attachment"; filename="${fileName}"\r\n`;
        body += `Content-Type: audio/wav\r\n\r\n`;

        const footer = `\r\n--${boundary}--`;

        const req = http.request({
            hostname: 'localhost',
            port: 5000,
            path: `/api/signalisations/${reportId}/attachments`,
            method: 'POST',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'x-user-role': 'psychologues'
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(JSON.parse(data));
                } else {
                    reject(new Error(`Status ${res.statusCode}: ${data}`));
                }
            });
        });

        req.write(body);
        req.write(fs.readFileSync(filePath));
        req.write(footer);
        req.end();
    });
}

testAttachments().catch(console.error);
