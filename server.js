const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());

// Enhanced CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'https://paystack-frontend-test.vercel.app', '*'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'Server is running', environment: process.env.NODE_ENV || 'development' });
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.status(200).json({ message: 'API is working properly', timestamp: new Date().toISOString() });
});

// Initialize Transaction API
app.post('/api/initialize-transaction', async (req, res) => {
  const { email, amount } = req.body;

  // Validate required fields
  if (!email || !amount) {
    return res.status(400).json({ error: 'Email and amount are required.' });
  }

  // Check if the secret key is available
  const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
  if (!PAYSTACK_SECRET_KEY) {
    return res.status(500).json({ error: 'Paystack secret key is not configured.' });
  }

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
    console.log('Transaction initialized successfully:', response.data);
    res.json(response.data.data);
  } catch (err) {
    console.error('Error initializing transaction:', err.response?.data || err.message);
    res.status(500).json({ error: 'Transaction initialization failed', details: err.response?.data || err.message });
  }
});

// Verify Transaction API
app.get('/api/verify-transaction/:reference', async (req, res) => {
  const { reference } = req.params;

  // Check if the secret key is available
  const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
  if (!PAYSTACK_SECRET_KEY) {
    return res.status(500).json({ error: 'Paystack secret key is not configured.' });
  }

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` } }
    );
    console.log('Transaction verified successfully:', response.data);
    res.json(response.data.data); // Return transaction status
  } catch (err) {
    console.error('Error verifying transaction:', err.response?.data || err.message);
    res.status(500).json({ error: 'Transaction verification failed', details: err.response?.data || err.message });
  }
});

// General fallback for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
