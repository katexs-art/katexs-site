/**
 * Katexs Demo Agent Server
 * Main entry point
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('frontend'));

// API Routes
app.post('/api/demo/start', require('./backend/api/demo-start'));
app.post('/api/demo/message', require('./backend/api/demo-message'));
app.get('/api/public/demo/config/:deployId', require('./backend/api/demo-config'));
app.post('/api/checkout', require('./backend/api/checkout'));
app.post('/api/webhook/stripe', express.raw({ type: 'application/json' }), require('./backend/api/stripe-webhook'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve demo page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'demo-page.html'));
});

// Success page after payment
app.get('/success', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Welcome to Katexs!</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .success-card {
          background: white;
          padding: 60px;
          border-radius: 24px;
          text-align: center;
          max-width: 500px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15);
        }
        .success-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }
        h1 {
          color: #1a1a2e;
          margin-bottom: 16px;
        }
        p {
          color: #666;
          margin-bottom: 32px;
          line-height: 1.6;
        }
        .btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 16px 32px;
          border-radius: 12px;
          text-decoration: none;
          display: inline-block;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="success-card">
        <div class="success-icon">🎉</div>
        <h1>You're All Set!</h1>
        <p>Your AI receptionist is being deployed right now. You'll receive an email with your widget code and setup instructions within 5 minutes.</p>
        <a href="/" class="btn">Back to Demo</a>
      </div>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`🚀 Katexs Demo Agent running on port ${PORT}`);
  console.log(`📱 Demo page: http://localhost:${PORT}`);
});
