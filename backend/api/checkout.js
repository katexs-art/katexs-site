/**
 * Checkout API
 * Creates Stripe checkout session for hiring the AI agent
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const PRICING = {
  starter: {
    name: 'Quick Start',
    price: 5000, // $50 in cents
    description: 'AI chat agent on your website'
  },
  pro: {
    name: 'Professional',
    price: 49700, // $497 in cents
    description: 'Voice + Chat AI agent'
  },
  enterprise: {
    name: 'Enterprise',
    price: 99700, // $997 in cents
    description: 'Unlimited everything'
  }
};

module.exports = async (req, res) => {
  try {
    const { sessionId, plan = 'starter' } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }
    
    // Get session
    const { data: session, error: sessionError } = await supabase
      .from('demo_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .single();
    
    if (sessionError || !session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const pricing = PRICING[plan];
    if (!pricing) {
      return res.status(400).json({ error: 'Invalid plan' });
    }
    
    // Create or get Stripe customer
    let customerId = session.stripe_customer_id;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        name: session.business_name,
        metadata: {
          demo_session_id: sessionId,
          business_name: session.business_name,
          niche: session.niche
        }
      });
      customerId = customer.id;
      
      // Update session with customer ID
      await supabase
        .from('demo_sessions')
        .update({ stripe_customer_id: customerId })
        .eq('session_id', sessionId);
    }
    
    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${pricing.name} — ${session.config.agent_name}`,
              description: `${pricing.description} for ${session.business_name}`
            },
            unit_amount: pricing.price,
            recurring: {
              interval: 'month'
            }
          },
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/demo?session_id=${sessionId}`,
      metadata: {
        demo_session_id: sessionId,
        plan: plan,
        business_name: session.business_name
      },
      subscription_data: {
        metadata: {
          demo_session_id: sessionId,
          plan: plan
        }
      }
    });
    
    // Store checkout session
    await supabase
      .from('payment_events')
      .insert({
        session_id: sessionId,
        stripe_checkout_id: checkoutSession.id,
        plan: plan,
        amount: pricing.price,
        status: 'pending',
        created_at: new Date().toISOString()
      });
    
    res.json({
      success: true,
      checkoutUrl: checkoutSession.url,
      checkoutSessionId: checkoutSession.id
    });
    
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: 'Failed to create checkout', details: err.message });
  }
};
