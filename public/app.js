// Speed Test Application
class SpeedTest {
    constructor() {
        this.baseUrl = window.location.origin;
        this.isRunning = false;
        this.results = {
            download: 0,
            upload: 0,
            ping: 0,
            date: null
        };
        this.initializeElements();
        this.loadHistory();
        this.attachEventListeners();
    }

    initializeElements() {
        this.startBtn = document.getElementById('startBtn');
        this.downloadSpeed = document.getElementById('downloadSpeed');
        this.uploadSpeed = document.getElementById('uploadSpeed');
        this.pingSpeed = document.getElementById('pingSpeed');
        this.downloadStatus = document.getElementById('downloadStatus');
        this.uploadStatus = document.getElementById('uploadStatus');
        this.pingStatus = document.getElementById('pingStatus');
        this.downloadGauge = document.getElementById('downloadGauge');
        this.uploadGauge = document.getElementById('uploadGauge');
        this.resultsPanel = document.getElementById('resultsPanel');
        this.historyContainer = document.getElementById('historyContainer');
    }

    attachEventListeners() {
        this.startBtn.addEventListener('click', () => {
            if (!this.isRunning) {
                this.runSpeedTest();
            }
        });
    }

    async runSpeedTest() {
        this.isRunning = true;
        this.startBtn.classList.add('testing');
        this.startBtn.querySelector('.button-text').textContent = 'Testing...';
        this.resultsPanel.classList.add('hidden');

        try {
            // Run ping test first
            await this.runPingTest();

            // Run download test
            await this.runDownloadTest();

            // Run upload test
            await this.runUploadTest();

            // Save results
            this.saveResults();
            this.displayResults();

        } catch (error) {
            console.error('Speed test error:', error);
            alert(`An error occurred: ${error.message}. Please try again.`);
        } finally {
            this.isRunning = false;
            this.startBtn.classList.remove('testing');
            this.startBtn.querySelector('.button-text').textContent = 'Start Test';
            this.resetStatuses();
        }
    }

    async runPingTest() {
        this.pingStatus.textContent = 'Testing...';
        this.pingStatus.classList.add('testing');

        const pingTimes = [];
        const numPings = 10;

        for (let i = 0; i < numPings; i++) {
            const startTime = performance.now();

            try {
                await fetch(`${this.baseUrl}/api/ping?t=${Date.now()}`);
                const endTime = performance.now();
                const pingTime = endTime - startTime;
                pingTimes.push(pingTime);

                // Update display with current average
                const avgPing = pingTimes.reduce((a, b) => a + b, 0) / pingTimes.length;
                this.pingSpeed.textContent = Math.round(avgPing);

            } catch (error) {
                console.error('Ping failed:', error);
            }

            // Small delay between pings
            await this.sleep(100);
        }

        // Calculate average ping
        const avgPing = pingTimes.reduce((a, b) => a + b, 0) / pingTimes.length;
        this.results.ping = Math.round(avgPing);
        this.pingSpeed.textContent = this.results.ping;
        this.pingStatus.textContent = 'Complete';
        this.pingStatus.classList.remove('testing');
    }

    async runDownloadTest() {
        this.downloadStatus.textContent = 'Testing...';
        this.downloadStatus.classList.add('testing');

        const testDuration = 10000; // 10 seconds
        const chunkSize = 5 * 1024 * 1024; // 5 MB chunks

        let totalBytes = 0;
        const startTime = performance.now();
        let lastUpdateTime = startTime;

        while (performance.now() - startTime < testDuration) {
            try {
                const chunkStartTime = performance.now();
                const response = await fetch(`${this.baseUrl}/api/download?size=${chunkSize}&t=${Date.now()}`);

                const reader = response.body.getReader();
                let chunkBytes = 0;

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    chunkBytes += value.length;
                    totalBytes += value.length;

                    // Update speed every 500ms
                    const currentTime = performance.now();
                    if (currentTime - lastUpdateTime >= 500) {
                        const elapsed = (currentTime - startTime) / 1000;
                        const speedMbps = (totalBytes * 8) / (elapsed * 1000000);
                        this.updateDownloadDisplay(speedMbps);
                        lastUpdateTime = currentTime;
                    }
                }

            } catch (error) {
                console.error('Download test error:', error);
                break;
            }
        }

        // Calculate final speed
        const totalTime = (performance.now() - startTime) / 1000;
        const speedMbps = (totalBytes * 8) / (totalTime * 1000000);
        this.results.download = Math.round(speedMbps * 100) / 100;

        this.updateDownloadDisplay(this.results.download);
        this.downloadStatus.textContent = 'Complete';
        this.downloadStatus.classList.remove('testing');
    }

    async runUploadTest() {
        this.uploadStatus.textContent = 'Testing...';
        this.uploadStatus.classList.add('testing');

        const testDuration = 10000; // 10 seconds
        const chunkSize = 1 * 1024 * 1024; // 1 MB chunks

        // Pre-allocate buffer to avoid CPU overhead during test
        const data = new Uint8Array(chunkSize);
        // Fill buffer in 64KB chunks to avoid QuotaExceededError
        const maxBytes = 65536;
        for (let i = 0; i < chunkSize; i += maxBytes) {
            const length = Math.min(maxBytes, chunkSize - i);
            crypto.getRandomValues(data.subarray(i, i + length));
        }

        let totalBytes = 0;
        const startTime = performance.now();
        let lastUpdateTime = startTime;

        while (performance.now() - startTime < testDuration) {
            try {
                const chunkStartTime = performance.now();

                await fetch(`${this.baseUrl}/api/upload`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/octet-stream'
                    },
                    body: data // Reuse pre-allocated buffer
                });

                totalBytes += chunkSize;

                // Update speed every 500ms
                const currentTime = performance.now();
                if (currentTime - lastUpdateTime >= 500) {
                    const elapsed = (currentTime - startTime) / 1000;
                    const speedMbps = (totalBytes * 8) / (elapsed * 1000000);
                    this.updateUploadDisplay(speedMbps);
                    lastUpdateTime = currentTime;
                }

            } catch (error) {
                console.error('Upload test error:', error);
                break;
            }
        }

        // Calculate final speed
        const totalTime = (performance.now() - startTime) / 1000;
        const speedMbps = (totalBytes * 8) / (totalTime * 1000000);
        this.results.upload = Math.round(speedMbps * 100) / 100;

        this.updateUploadDisplay(this.results.upload);
        this.uploadStatus.textContent = 'Complete';
        this.uploadStatus.classList.remove('testing');
    }

    updateDownloadDisplay(speedMbps) {
        const displaySpeed = Math.round(speedMbps * 100) / 100;
        this.downloadSpeed.textContent = displaySpeed;

        // Update gauge (max 100 Mbps for display)
        const maxSpeed = 100;
        const percentage = Math.min(speedMbps / maxSpeed, 1);
        const dashOffset = 251.2 - (251.2 * percentage);
        this.downloadGauge.style.strokeDashoffset = dashOffset;
    }

    updateUploadDisplay(speedMbps) {
        const displaySpeed = Math.round(speedMbps * 100) / 100;
        this.uploadSpeed.textContent = displaySpeed;

        // Update gauge (max 100 Mbps for display)
        const maxSpeed = 100;
        const percentage = Math.min(speedMbps / maxSpeed, 1);
        const dashOffset = 251.2 - (251.2 * percentage);
        this.uploadGauge.style.strokeDashoffset = dashOffset;
    }

    resetStatuses() {
        this.downloadStatus.textContent = 'Ready';
        this.uploadStatus.textContent = 'Ready';
        this.pingStatus.textContent = 'Ready';
        this.downloadStatus.classList.remove('testing');
        this.uploadStatus.classList.remove('testing');
        this.pingStatus.classList.remove('testing');
    }

    displayResults() {
        this.results.date = new Date();

        document.getElementById('resultDownload').textContent = this.results.download;
        document.getElementById('resultUpload').textContent = this.results.upload;
        document.getElementById('resultPing').textContent = this.results.ping;
        document.getElementById('resultDate').textContent = this.formatDate(this.results.date);

        this.resultsPanel.classList.remove('hidden');
    }

    saveResults() {
        let history = this.getHistory();
        history.unshift({
            download: this.results.download,
            upload: this.results.upload,
            ping: this.results.ping,
            date: this.results.date
        });

        // Keep only last 10 results
        history = history.slice(0, 10);

        localStorage.setItem('speedTestHistory', JSON.stringify(history));
        this.loadHistory();
    }

    getHistory() {
        const historyData = localStorage.getItem('speedTestHistory');
        return historyData ? JSON.parse(historyData) : [];
    }

    loadHistory() {
        const history = this.getHistory();

        if (history.length === 0) {
            this.historyContainer.innerHTML = '<p class="history-empty">No previous tests. Run a test to see results here.</p>';
            return;
        }

        this.historyContainer.innerHTML = '';

        history.forEach(result => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-stat">
                    <div class="history-label">Download</div>
                    <div class="history-value">${result.download} Mbps</div>
                </div>
                <div class="history-stat">
                    <div class="history-label">Upload</div>
                    <div class="history-value">${result.upload} Mbps</div>
                </div>
                <div class="history-stat">
                    <div class="history-label">Ping</div>
                    <div class="history-value">${result.ping} ms</div>
                </div>
                <div class="history-stat">
                    <div class="history-label">Date</div>
                    <div class="history-value">${this.formatDate(new Date(result.date))}</div>
                </div>
            `;
            this.historyContainer.appendChild(historyItem);
        });
    }

    formatDate(date) {
        const options = {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(date).toLocaleDateString('en-US', options);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new SpeedTest();
});
