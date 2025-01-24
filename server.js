const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());

// Enhanced CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'https://paystack-frontend-test.vercel.app', 'https://your-production-frontend-url.com'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// Handle preflight requests
app.options('*', cors());

// Initialize Transaction API
app.post('/api/initialize-transaction', async (req, res) => {
  const { email, amount } = req.body;

  try {
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      { email, amount },
      { 
        headers: { 
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        } 
      }
    );
    res.json(response.data.data);
  } catch (err) {
    console.error(err.response?.data || err);
    res.status(500).json({ error: 'Transaction initialization failed' });
  }
});

// Verify Transaction API
app.get('/api/verify-transaction/:reference', async (req, res) => {
  const { reference } = req.params;

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` } }
    );
    res.json(response.data.data); // Return transaction status
  } catch (err) {
    console.error(err.response?.data || err);
    res.status(500).json({ error: 'Transaction verification failed' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
