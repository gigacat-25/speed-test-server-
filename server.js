const express = require('express');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '100mb' }));


// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Configuration endpoint
app.get('/api/config', (req, res) => {
  res.json({
    downloadSize: 10 * 1024 * 1024, // 10 MB per chunk
    uploadSize: 1 * 1024 * 1024,    // 1 MB per chunk
    downloadDuration: 10000,         // 10 seconds
    uploadDuration: 10000,           // 10 seconds
    pingCount: 10                    // Number of ping tests
  });
});

// Download speed test endpoint
app.get('/api/download', (req, res) => {
  const chunkSize = 1024 * 1024; // 1 MB chunks
  const totalSize = parseInt(req.query.size) || 10 * 1024 * 1024; // Default 10 MB

  // Set headers
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Length', totalSize);
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  let bytesSent = 0;

  const sendChunk = () => {
    if (bytesSent >= totalSize) {
      res.end();
      return;
    }

    const remainingBytes = totalSize - bytesSent;
    const currentChunkSize = Math.min(chunkSize, remainingBytes);

    // Generate random data
    const chunk = crypto.randomBytes(currentChunkSize);

    bytesSent += currentChunkSize;
    res.write(chunk, (err) => {
      if (!err) {
        setImmediate(sendChunk);
      }
    });
  };

  sendChunk();
});

// Upload speed test endpoint
app.post('/api/upload', (req, res) => {
  let bytesReceived = 0;

  req.on('data', (chunk) => {
    bytesReceived += chunk.length;
  });

  req.on('end', () => {
    res.json({
      success: true,
      bytesReceived: bytesReceived,
      message: 'Upload test completed'
    });
  });

  req.on('error', (err) => {
    console.error('Upload error:', err);
    res.status(500).json({
      success: false,
      error: 'Upload failed'
    });
  });
});

// Ping/latency test endpoint
app.get('/api/ping', (req, res) => {
  res.json({
    timestamp: Date.now(),
    success: true
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Speed Test Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api/`);
});
