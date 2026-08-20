/**
 * Demo Start API
 * Handles business scraping, config generation, and demo session creation
 */

const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const cheerio = require('cheerio');

// Shared session store (must be before module.exports)
const demoSessions = new Map();

let supabase;
try {
  supabase = createClient(
    process.env.SUPABASE_URL || 'http://localhost',
    process.env.SUPABASE_KEY || 'dummy'
  );
} catch (err) {
  console.log('Supabase not configured');
}

// Google Places API search
async function searchGooglePlaces(query) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  
  // First, find place
  const findUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id,name,formatted_address,formatted_phone_number,website,rating,opening_hours&key=${apiKey}`;
  
  try {
    const findResponse = await axios.get(findUrl);
    const candidate = findResponse.data.candidates?.[0];
    
    if (!candidate) return null;
    
    // Get detailed info
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${candidate.place_id}&fields=name,formatted_address,formatted_phone_number,website,opening_hours,reviews,types&key=${apiKey}`;
    
    const detailsResponse = await axios.get(detailsUrl);
    return detailsResponse.data.result;
  } catch (err) {
    console.log('Google Places API error:', err.message);
    return null;
  }
}

// Website scraper
async function scrapeWebsite(url) {
  try {
    const response = await axios.get(url, { timeout: 10000 });
    const $ = cheerio.load(response.data);
    
    // Extract services
    const services = [];
    $('h2, h3, h4').each((i, el) => {
      const text = $(el).text().trim();
      if (text.length > 0 && text.length < 100) {
        services.push(text);
      }
    });
    
    // Extract FAQ
    const faqs = [];
    $('h2, h3').each((i, el) => {
      const question = $(el).text().trim();
      const answer = $(el).next('p').text().trim();
      if (question && answer && question.includes('?')) {
        faqs.push({ q: question, a: answer });
      }
    });
    
    // Extract description
    const description = $('meta[name="description"]').attr('content') || 
                       $('p').first().text().trim();
    
    return {
      services: services.slice(0, 10),
      faqs: faqs.slice(0, 5),
      description
    };
  } catch (err) {
    console.error('Scrape failed:', err.message);
    return { services: [], faqs: [], description: '' };
  }
}

// Generate agent config from scraped data
function generateConfig(placesData, scrapedData, niche) {
  const businessName = placesData?.name || 'Your Business';
  const agentName = generateAgentName(businessName);
  
  // Build services list
  const services = scrapedData?.services?.length > 0 
    ? scrapedData.services 
    : getDefaultServices(niche);
  
  // Build hours
  const hours = placesData?.opening_hours?.weekday_text?.join(', ') 
    || 'Mon-Fri 9am-5pm';
  
  // Build FAQ
  const faqPairs = scrapedData?.faqs?.length > 0
    ? scrapedData.faqs
    : getDefaultFAQs(niche);
  
  // Build qualification questions based on niche
  const qualificationQuestions = getQualificationQuestions(niche);
  
  return {
    business_name: businessName,
    niche: niche,
    agent_name: agentName,
    brand_colors: { primary: '#1a73e8', accent: '#34a853' },
    services: services,
    service_area: placesData?.formatted_address || 'Local area',
    hours: hours,
    phones: placesData?.formatted_phone_number ? [placesData.formatted_phone_number] : [],
    faq_pairs: faqPairs,
    greeting_line: `Thanks for calling ${businessName}, this is ${agentName} — how can I help you today?`,
    qualification_questions: qualificationQuestions,
    voice_persona: getVoicePersona(niche),
    message_cap: 15
  };
}

function generateAgentName(businessName) {
  // Extract first name or use default
  const names = ['Ava', 'Mia', 'Zoe', 'Luna', 'Nova', 'Iris'];
  const hash = businessName.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  return names[hash % names.length];
}

function getDefaultServices(niche) {
  const defaults = {
    plumbing: ['Emergency repairs', 'Drain cleaning', 'Water heater install', 'Repiping', 'Leak detection'],
    dental: ['Cleanings', 'Fillings', 'Crowns', 'Teeth whitening', 'Emergency dental'],
    hvac: ['AC repair', 'Heating install', 'Maintenance', 'Duct cleaning', 'Emergency service'],
    legal: ['Consultations', 'Contract review', 'Litigation', 'Estate planning', 'Business law'],
    real_estate: ['Buyer representation', 'Seller listing', 'Market analysis', 'Property management']
  };
  return defaults[niche.toLowerCase()] || ['Service 1', 'Service 2', 'Service 3'];
}

function getDefaultFAQs(niche) {
  const defaults = {
    plumbing: [
      { q: 'Do you offer free estimates?', a: 'Yes, free estimates for all non-emergency work.' },
      { q: 'Are you licensed and insured?', a: 'Fully licensed and insured.' }
    ],
    dental: [
      { q: 'Do you accept new patients?', a: 'Yes, we welcome new patients.' },
      { q: 'Do you offer payment plans?', a: 'Yes, we have flexible payment options.' }
    ]
  };
  return defaults[niche.toLowerCase()] || [
    { q: 'What are your hours?', a: 'We are open during regular business hours.' }
  ];
}

function getQualificationQuestions(niche) {
  const questions = {
    plumbing: [
      "What's the plumbing issue you're dealing with?",
      "Where are you located?",
      "How urgent is this — emergency or can it wait a day or two?"
    ],
    dental: [
      "What dental concern brings you in today?",
      "Are you a new or returning patient?",
      "Do you have dental insurance?"
    ],
    hvac: [
      "What type of HVAC system do you have?",
      "What's the issue you're experiencing?",
      "How old is your system?"
    ],
    legal: [
      "What legal matter do you need help with?",
      "Is this urgent or can we schedule a consultation?",
      "Have you worked with an attorney before?"
    ],
    real_estate: [
      "Are you looking to buy, sell, or rent?",
      "What's your timeline?",
      "What's your budget range?"
    ]
  };
  return questions[niche.toLowerCase()] || [
    "What can I help you with today?",
    "Where are you located?",
    "When do you need this done?"
  ];
}

function getVoicePersona(niche) {
  const personas = {
    plumbing: 'warm, direct, no-nonsense, small-business friendly',
    dental: 'gentle, reassuring, professional, caring',
    hvac: 'knowledgeable, helpful, reliable, straightforward',
    legal: 'professional, confident, empathetic, authoritative',
    real_estate: 'enthusiastic, knowledgeable, personable, sharp'
  };
  return personas[niche.toLowerCase()] || 'warm, professional, helpful';
}

// Export handler
const handler = async (req, res) => {
  try {
    const { url, niche } = req.body;
    
    if (!url || !niche) {
      return res.status(400).json({ error: 'URL and niche required' });
    }
    
    // Determine if URL or business name
    const isUrl = url.startsWith('http');
    
    // Scrape data
    let placesData = null;
    let scrapedData = null;
    
    if (isUrl) {
      // Scrape website
      scrapedData = await scrapeWebsite(url);
      
      // Also search Google Places
      try {
        placesData = await searchGooglePlaces(url);
      } catch (err) {
        console.log('Google Places search failed, using scraped data only');
      }
    } else {
      // Search by business name
      placesData = await searchGooglePlaces(url);
      
      // Scrape website if found
      if (placesData?.website) {
        scrapedData = await scrapeWebsite(placesData.website);
      }
    }
    
    // Generate config
    const config = generateConfig(placesData, scrapedData, niche);
    
    // Create demo session
    const sessionId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store in memory
    const session = {
      session_id: sessionId,
      business_name: config.business_name,
      niche: config.niche,
      config: config,
      message_count: 0,
      status: 'active',
      created_at: new Date().toISOString()
    };
    demoSessions.set(sessionId, session);
    
    // Return session info
    res.json({
      success: true,
      sessionId: sessionId,
      businessName: config.business_name,
      agentName: config.agent_name,
      brandColors: config.brand_colors,
      greeting: config.greeting_line,
      config: config
    });
    
  } catch (err) {
    console.error('Demo start error:', err);
    res.status(500).json({ error: 'Failed to start demo', details: err.message });
  }
};

// Export session store for other modules
handler.demoSessions = demoSessions;
module.exports = handler;
