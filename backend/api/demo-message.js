/**
 * Demo Message API
 * Handles chat messages with the AI receptionist
 */

const { createClient } = require('@supabase/supabase-js');

// Import shared session store
const demoStart = require('./demo-start');
const demoSessions = demoStart.demoSessions;

let supabase;
try {
  supabase = createClient(
    process.env.SUPABASE_URL || 'http://localhost',
    process.env.SUPABASE_KEY || 'dummy'
  );
} catch (err) {
  console.log('Supabase not configured, using in-memory storage');
}

// OpenAI/Moonshot API call
async function getAIResponse(config, message, history, messageNumber) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.MOONSHOT_API_KEY;
  const apiUrl = process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions';
  
  // Build system prompt with injected config
  const systemPrompt = buildSystemPrompt(config, messageNumber);
  
  // Build messages array
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: message }
  ];
  
  // Check if API key is configured
  if (!apiKey || apiKey === 'undefined') {
    console.log('No AI API key configured, returning demo response');
    return generateDemoResponse(config, message, messageNumber);
  }
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview', // or moonshot model
        messages: messages,
        temperature: 0.7,
        max_tokens: 500
      })
    });
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (err) {
    console.error('AI API error:', err.message);
    return generateDemoResponse(config, message, messageNumber);
  }
}

// Generate demo response when AI API not available
function generateDemoResponse(config, message, messageNumber) {
  const responses = [
    "I'd be happy to help with that! What's the plumbing issue you're dealing with?",
    "Got it — where are you located?",
    "Thanks! How urgent is this — emergency or can it wait a day or two?",
    "Perfect — what's the best name and number for you?",
    "Got it. I can get you on the schedule as early as tomorrow. Morning or afternoon?",
    "You're set. You'll get a confirmation text shortly.",
    "Is there anything else I can help you with today?",
    "That's exactly what I'd do for every caller — nights, weekends, holidays, all of it. Hiring me takes about 5 minutes, and I start immediately. Want to make it official?"
  ];
  
  if (messageNumber <= responses.length) {
    return responses[messageNumber - 1];
  }
  return "That's the end of my audition — tap 'Hire Me' and I'm on the clock today.";
}

function buildSystemPrompt(config, messageNumber) {
  const remainingMessages = config.message_cap - messageNumber;
  const isCloseTime = remainingMessages <= 3 || messageNumber >= 10;
  
  return `You are ${config.agent_name}, the AI receptionist for ${config.business_name}, a ${config.niche} business.
You are currently in a LIVE DEMO. The business owner is testing you right now, deciding whether to hire you.

### YOUR KNOWLEDGE
- Business: ${config.business_name}
- Services: ${config.services.join(', ')}
- Service area: ${config.service_area}
- Hours: ${config.hours}
- Phone: ${config.phones?.[0] || 'Not on file'}
- FAQs: ${config.faq_pairs.map(f => `Q: ${f.q} A: ${f.a}`).join('\n')}

### HOW YOU BEHAVE
1. Open with: "${config.greeting_line}" (only on first message)
2. Answer ONLY from your knowledge above. Never invent services, prices, or policies.
3. If asked something outside your knowledge: "Great question — that one's for the owner. Want me to have someone reach out to you?"
4. If asked about price and no price exists: "Pricing depends on the job — I can have someone text you a quote today. What's the best number?"
5. Never break character. You are ${config.agent_name}, the receptionist.

### THE MONEY MOTION
When the visitor describes a need, run qualification naturally:
- Ask: ${config.qualification_questions[0]}
- Then: ${config.qualification_questions[1]}
- Then: ${config.qualification_questions[2]}
- Then capture: "Perfect — what's the best name and number for you?"
- Then booking: "Got it. I can get you on the schedule as early as tomorrow. Morning or afternoon?"
- Confirm: "You're set. You'll get a confirmation text shortly."

DEMO MODE: PERFORM this flow, but no real booking is created. If asked "was that real?": "In demo mode I just show you the moves — the moment I'm hired, that booking would be real."

### THE CLOSE
${isCloseTime ? `You have ${remainingMessages} messages left. DELIVER THE CLOSE NOW:
"That's exactly what I'd do for every caller — nights, weekends, holidays, all of it. Hiring me takes about 5 minutes, and I start immediately. Want to make it official?"` : `You have ${remainingMessages} messages remaining. Focus on demonstrating value.`}

### TONE RULES
- Friendly, brief (1-3 sentences), zero corporate stiffness
- Contractions always. No emoji unless they use them first.
- Sound like the best hire they never made.`;
}

// Main handler
module.exports = async (req, res) => {
  try {
    const { sessionId, message, channel = 'chat', history = [] } = req.body;
    
    if (!sessionId || !message) {
      return res.status(400).json({ error: 'Session ID and message required' });
    }
    
    // Get session (try Supabase first, fallback to memory)
    let session;
    try {
      const { data, error } = await supabase
        .from('demo_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .single();
      
      if (!error && data) session = data;
    } catch (err) {
      // Supabase not available
    }
    
    // Fallback to shared memory store
    if (!session) {
      session = demoSessions.get(sessionId);
    }
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Check message cap
    if (session.message_count >= session.config.message_cap) {
      return res.json({
        reply: "That's the end of my audition — tap 'Hire Me' and I'm on the clock today.",
        closeTriggered: true,
        capHit: true
      });
    }
    
    // Get AI response
    const reply = await getAIResponse(
      session.config,
      message,
      history,
      session.message_count + 1
    );
    
    // Update message count
    const newCount = (session.message_count || 0) + 1;
    const isCapHit = newCount >= session.config.message_cap;
    
    // Update in shared memory store
    session.message_count = newCount;
    session.status = isCapHit ? 'cap_hit' : 'active';
    demoSessions.set(sessionId, session);
    
    // Try Supabase (ignore errors)
    try {
      await supabase
        .from('demo_sessions')
        .update({ 
          message_count: newCount,
          status: isCapHit ? 'cap_hit' : 'active',
          last_message_at: new Date().toISOString()
        })
        .eq('session_id', sessionId);
    } catch (err) {
      // Supabase not available
    }
    
    // Check if close should trigger
    const closeTriggered = newCount >= session.config.message_cap - 3 || 
                          reply.includes('Hire me') || 
                          reply.includes('make it official');
    
    res.json({
      reply: reply,
      messageNumber: newCount,
      remainingMessages: session.config.message_cap - newCount,
      closeTriggered: closeTriggered,
      capHit: isCapHit
    });
    
  } catch (err) {
    console.error('Demo message error:', err);
    res.status(500).json({ error: 'Failed to process message', details: err.message });
  }
};
