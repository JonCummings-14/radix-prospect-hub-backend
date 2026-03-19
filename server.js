const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// More aggressive CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

const API_KEY = process.env.ANTHROPIC_API_KEY;

app.get('/health', (req, res) => {
  res.json({ status: 'ok', hasKey: !!API_KEY });
});

app.post('/api/search-zoominfo', async (req, res) => {
  try {
    const { companies, jobTitles } = req.body;
    
    if (!companies || !jobTitles) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    // For now, return test data
    res.json({ 
      success: true, 
      contacts: [
        {
          id: '1',
          firstName: 'Test',
          lastName: 'Contact',
          jobTitle: 'VP Operations',
          company: companies[0] || 'Test Company',
          email: 'test@example.com',
          phone: null,
          mobilePhone: '555-1234',
          contactAccuracyScore: 95
        }
      ],
      count: 1
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Running on ${PORT}`));
