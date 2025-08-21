const https = require('https');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if certificates exist
if (!fs.existsSync('cert.pem') || !fs.existsSync('key.pem')) {
  console.error('SSL certificates not found. Please run the openssl command first.');
  process.exit(1);
}

// Start Next.js development server
const nextProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  env: { ...process.env, PORT: '3001' }
});

// Wait a moment for Next.js to start
setTimeout(() => {
  // Create HTTPS proxy server
  const httpsServer = https.createServer({
    cert: fs.readFileSync('cert.pem'),
    key: fs.readFileSync('key.pem')
  }, (req, res) => {
    // Proxy requests to Next.js server
    const proxyReq = https.request({
      hostname: 'localhost',
      port: 3001,
      path: req.url,
      method: req.method,
      headers: req.headers
    }, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    req.pipe(proxyReq);
  });

  httpsServer.listen(3000, () => {
    console.log('🚀 HTTPS Server running on https://localhost:3000');
    console.log('📝 Add this URL to your Spotify Dashboard:');
    console.log('   https://localhost:3000/auth/spotify/callback');
  });

  // Handle shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down servers...');
    httpsServer.close();
    nextProcess.kill();
    process.exit(0);
  });
}, 3000);
