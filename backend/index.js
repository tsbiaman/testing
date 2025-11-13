const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
  : null;

app.use(cors(allowedOrigins && allowedOrigins.length > 0 ? { origin: allowedOrigins } : undefined));
app.use(express.json());

const updates = [
  {
    id: 1,
    title: 'Deployment pipeline',
    message: 'GitHub Actions pushes updates to Docker Swarm using the private registry.',
  },
  {
    id: 2,
    title: 'Logging',
    message: 'Structured logs are collected via the stack and routed to the central logging service.',
  },
  {
    id: 3,
    title: 'Backups',
    message: 'Nightly database and Redis snapshots are taken and stored in the backups volume.',
  },
];

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/updates', (req, res) => {
  res.json({ updates });
});

app.post('/api/data', (req, res) => {
  const payload = req.body;
  res.json({
    received: true,
    data: payload,
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Backend service is running',
    endpoints: ['/api/health', '/api/updates', '/api/data'],
  });
});

app.listen(PORT, () => {
  console.log(`API server listening at http://localhost:${PORT}`);
  if (allowedOrigins && allowedOrigins.length > 0) {
    console.log(`CORS allowed origins: ${allowedOrigins.join(', ')}`);
  } else {
    console.log('CORS enabled for all origins');
  }
});
