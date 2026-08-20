/**
 * Stripe Webhook Handler
 * Processes successful payments and deploys live agent
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Deploy live agent to Vapi
async function deployLiveAgent(session) {
  const vapiApiKey = process.env.VAPI_API_KEY;
  
  // Create live assistant config
  const liveConfig = {
    name: `${session.config.agent_name} — ${session.business_name}`,
    model: {
      provider: 'openai',
      model: 'gpt-4',
      systemPrompt: buildLivePrompt(session.config)
    },
    voice: {
      provider: '11labs',
      voiceId: session.config.voice_id || 'default'
    },
    firstMessage: session.config.greeting_line,
    // Enable real actions
    functions: [
      {
        name: 'book_appointment',
        description: 'Book an appointment',
        parameters: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            phone: { type: 'string' },
            service: { type: 'string' },
            date: { type: 'string' },
            time: { type: 'string' }
          }
        }
      },
      {
        name: 'send_sms',
        description: 'Send SMS confirmation',
        parameters: {
          type: 'object',
          properties: {
            phone: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    ]
  };
  
  // Deploy to Vapi
  const response = await fetch('https://api.vapi.ai/assistant', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${vapiApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(liveConfig)
  });
  
  const vapiAssistant = await response.json();
  
  return {
    assistantId: vapiAssistant.id,
    phoneNumber: vapiAssistant.phoneNumber?.number || null
  };
}

function buildLivePrompt(config) {
  return `You are ${config.agent_name}, the AI receptionist for ${config.business_name}.

### YOUR KNOWLEDGE
- Business: ${config.business_name}
- Services: ${config.services.join(', ')}
- Service area: ${config.service_area}
- Hours: ${config.hours}
- Phone: ${config.phones?.[0] || 'Not on file'}
- FAQs: ${config.faq_pairs.map(f => `Q: ${f.q} A: ${f.a}`).join('\n')}

### HOW YOU BEHAVE
1. Answer from your knowledge above. Never invent services, prices, or policies.
2. If asked something outside your knowledge: "Great question — let me get the owner on that for you."
3. Be warm, brief, and professional.

### REAL ACTIONS (LIVE MODE)
- You CAN book appointments, send SMS, and add to CRM
- Always confirm before taking action
- Send confirmations immediately after booking`;
}

// Generate chat widget code for the business
function generateWidgetCode(session, assistantId) {
  return `<!-- Katexs AI Chat Widget -->
<script>
  window.KATEXS_CONFIG = {
    apiUrl: 'https://api.katexs.com',
    assistantId: '${assistantId}',
    businessName: '${session.business_name}',
    agentName: '${session.config.agent_name}',
    primaryColor: '${session.config.brand_colors.primary}'
  };
</script>
<script src="https://cdn.katexs.com/widget.js" async></script>
<!-- End Katexs AI Chat Widget -->`;
}

// Main webhook handler
module.exports = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle successful payment
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const demoSessionId = session.metadata?.demo_session_id;
    const plan = session.metadata?.plan;
    
    if (!demoSessionId) {
      console.log('No demo session ID in metadata');
      return res.json({ received: true });
    }
    
    try {
      // Get demo session
      const { data: demoSession, error } = await supabase
        .from('demo_sessions')
        .select('*')
        .eq('session_id', demoSessionId)
        .single();
      
      if (error || !demoSession) {
        throw new Error('Demo session not found');
      }
      
      // Update payment status
      await supabase
        .from('payment_events')
        .update({ 
          status: 'completed',
          stripe_subscription_id: session.subscription,
          completed_at: new Date().toISOString()
        })
        .eq('stripe_checkout_id', session.id);
      
      // Deploy live agent
      const deployment = await deployLiveAgent(demoSession);
      
      // Create live agent record
      const { data: liveAgent } = await supabase
        .from('agents')
        .insert({
          business_name: demoSession.business_name,
          niche: demoSession.niche,
          config: demoSession.config,
          vapi_assistant_id: deployment.assistantId,
          phone_number: deployment.phoneNumber,
          plan: plan,
          status: 'active',
          stripe_subscription_id: session.subscription,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      // Generate widget code
      const widgetCode = generateWidgetCode(demoSession, deployment.assistantId);
      
      // Update demo session
      await supabase
        .from('demo_sessions')
        .update({ 
          status: 'converted',
          live_agent_id: liveAgent.id,
          widget_code: widgetCode
        })
        .eq('session_id', demoSessionId);
      
      // Send confirmation email (via n8n or direct)
      await sendConfirmation(demoSession, liveAgent, widgetCode);
      
      console.log(`✅ Agent deployed for ${demoSession.business_name}`);
      
    } catch (err) {
      console.error('Deployment error:', err);
      
      // Log failure
      await supabase
        .from('payment_events')
        .update({ 
          status: 'deployment_failed',
          error: err.message
        })
        .eq('stripe_checkout_id', session.id);
    }
  }
  
  res.json({ received: true });
};

async function sendConfirmation(session, liveAgent, widgetCode) {
  // This would integrate with your email service (Resend, SendGrid, etc.)
  // For now, log it
  console.log(`
    📧 Confirmation for ${session.business_name}
    Agent: ${session.config.agent_name}
    Phone: ${liveAgent.phone_number || 'N/A'}
    Widget code sent!
  `);
}
