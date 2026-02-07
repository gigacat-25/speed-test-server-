# 🚀 Speed Test Server

An open-source speed test server for measuring internet connection speed. Test your download speed, upload speed, and latency with a beautiful, modern web interface.

![Speed Test](https://img.shields.io/badge/Speed-Test-blueviolet)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)

## ✨ Features

- 📥 **Download Speed Test** - Measure your download bandwidth
- 📤 **Upload Speed Test** - Measure your upload bandwidth  
- 🏓 **Ping/Latency Test** - Check your connection latency
- 📊 **Real-time Visualization** - Animated gauges showing live test progress
- 📜 **Test History** - Track your previous test results (stored locally)
- 🎨 **Modern UI** - Beautiful glassmorphism design with smooth animations
- 📱 **Responsive Design** - Works perfectly on desktop and mobile devices
- 🔒 **Privacy First** - All tests run locally, no data sent to third parties

## 🛠️ Installation

### Prerequisites

- Node.js (v14.0.0 or higher)
- npm (comes with Node.js)

### Setup

1. Clone or download this repository:
```bash
git clone <your-repo-url>
cd speed-test-server
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## 🚀 Usage

### Running the Server

**Development mode** (with auto-restart on file changes):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

### Testing Your Connection

1. Open the web interface in your browser
2. Click the **"Start Test"** button
3. Wait for the test to complete (about 30 seconds)
4. View your results and test history

## 📡 API Documentation

The server exposes the following REST API endpoints:

### GET `/api/config`
Returns test configuration settings.

**Response:**
```json
{
  "downloadSize": 10485760,
  "uploadSize": 1048576,
  "downloadDuration": 10000,
  "uploadDuration": 10000,
  "pingCount": 10
}
```

### GET `/api/download`
Streams random data for download speed testing.

**Query Parameters:**
- `size` (optional) - Size of data to download in bytes (default: 10MB)

**Response:** Binary data stream

### POST `/api/upload`
Receives data for upload speed testing.

**Request Body:** Binary data (application/octet-stream)

**Response:**
```json
{
  "success": true,
  "bytesReceived": 1048576,
  "message": "Upload test completed"
}
```

### GET `/api/ping`
Simple endpoint for latency measurement.

**Response:**
```json
{
  "timestamp": 1640000000000,
  "success": true
}
```

### GET `/api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "uptime": 123.456,
  "timestamp": 1640000000000
}
```

## ⚙️ Configuration

You can configure the server by setting environment variables:

- `PORT` - Server port (default: 3000)

Example:
```bash
PORT=8080 npm start
```

## 🐳 Docker Deployment (Optional)

Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t speed-test-server .
docker run -p 3000:3000 speed-test-server
```

## 🌐 Deployment

### Deploy to any Node.js hosting platform:

- **Heroku**: `git push heroku main`
- **DigitalOcean App Platform**: Connect your Git repository
- **AWS EC2**: Upload files and run `npm start`
- **Vercel/Netlify**: May require serverless function adaptation

## 🎨 Customization

### Modify Test Parameters

Edit `server.js` to change test configuration:
```javascript
app.get('/api/config', (req, res) => {
  res.json({
    downloadSize: 20 * 1024 * 1024,  // Change to 20 MB
    downloadDuration: 15000,          // Change to 15 seconds
    // ... other settings
  });
});
```

### Customize UI Theme

Edit `public/styles.css` to change colors and styling:
```css
:root {
    --primary-gradient: your-gradient;
    --accent-cyan: your-color;
    /* ... other variables */
}
```

## 📝 License

This project is licensed under the MIT License - see below for details:

```
MIT License

Copyright (c) 2026

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Bug Reports

If you find a bug, please open an issue with:
- Description of the bug
- Steps to reproduce
- Expected behavior
- Screenshots (if applicable)

## 💡 Feature Requests

Have an idea? Open an issue with the `enhancement` label!

## 📧 Support

For support, please open an issue on GitHub.

## 🙏 Acknowledgments

- Built with [Express.js](https://expressjs.com/)
- UI inspired by modern design trends
- Font: [Inter](https://fonts.google.com/specimen/Inter) and [Orbitron](https://fonts.google.com/specimen/Orbitron)

---

**Made with ❤️ for the open-source community**
