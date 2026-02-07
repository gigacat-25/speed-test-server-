
const http = require('http');

function testDownload() {
    return new Promise((resolve, reject) => {
        console.log('Testing Download...');
        const req = http.get('http://localhost:3000/api/download?size=1048576', (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`Download failed with status ${res.statusCode}`));
                return;
            }

            let received = 0;
            res.on('data', (chunk) => {
                received += chunk.length;
            });

            res.on('end', () => {
                console.log(`Download finished. Received ${received} bytes.`);
                if (received === 1048576) {
                    resolve();
                } else {
                    reject(new Error(`Expected 1048576 bytes, got ${received}`));
                }
            });
        });

        req.on('error', reject);
    });
}

function testUpload() {
    return new Promise((resolve, reject) => {
        console.log('Testing Upload...');
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/upload',
            method: 'POST',
            headers: {
                'Content-Type': 'application/octet-stream'
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                console.log('Upload response:', body);
                if (res.statusCode === 200) {
                    resolve();
                } else {
                    reject(new Error(`Upload failed with status ${res.statusCode}`));
                }
            });
        });

        req.on('error', reject);

        // Send 1MB of data
        const chunk = Buffer.alloc(1024 * 1024); // 1MB
        req.write(chunk);
        req.end();
    });
}

async function run() {
    try {
        await testDownload();
        await testUpload();
        console.log('All tests passed!');
    } catch (err) {
        console.error('Test failed:', err);
        process.exit(1);
    }
}

run();
