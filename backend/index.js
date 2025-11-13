const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON
app.use(express.json());

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// API routes (must come before catch-all handler)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.post('/api/data', (req, res) => {
  const data = req.body;
  res.json({
    received: true,
    data: data,
    timestamp: new Date().toISOString()
  });
});

// Catch-all handler: serve the SPA entry point for non-API GET requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Frontend served from: ${path.join(__dirname, '../frontend/dist')}`);
});
