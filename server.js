const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();

// CORS configuration - allow all origins for testing
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

// Test endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', hasApiKey: !!ANTHROPIC_API_KEY });
});

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

async function searchZoomInfoContacts(companies, jobTitles) {
  const companyList = Array.isArray(companies) ? companies : [companies];
  const titleList = Array.isArray(jobTitles) ? jobTitles : [jobTitles];

  const prompt = `Search ZoomInfo for real contacts at these companies with these job titles.
Companies: ${companyList.join(', ')}
Job Titles: ${titleList.join(', ')}

Return ONLY a JSON array of REAL contacts with this structure. No generic names:
[{
  "id": "zoominfo_id",
  "firstName": "first name",
  "lastName": "last name",
  "jobTitle": "job title",
  "company": "company name",
  "email": "email or null",
  "phone": "phone or null",
  "mobilePhone": "mobile or null",
  "contactAccuracyScore": 90
}]

Only return JSON, nothing else.`;

  try {
    const response = await axios.post(ANTHROPIC_API_URL, {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    }, {
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      }
    });

    const text = response.data.content
      .filter(c => c.type === 'text')
      .map(c => c.text)
      .join('');
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error) {
    console.error('ZoomInfo search error:', error.message);
    return [];
  }
}

app.post('/api/search-zoominfo', async (req, res) => {
  try {
    const { companies, jobTitles } = req.body;

    if (!companies || !jobTitles) {
      return res.status(400).json({ error: 'Missing companies or jobTitles' });
    }

    const contacts = await searchZoomInfoContacts(companies, jobTitles);
    
    res.json({ 
      success: true,
      contacts,
      count: contacts.length 
    });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Search failed', details: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
