/**
 * Public Demo Config API
 * Returns chat/voice prompts for a deploy ID
 * No database keys exposed to browser
 */

const { createClient } = require('@supabase/supabase-js');

let supabase;
try {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE
  );
} catch (err) {
  console.log('Supabase not configured');
}

// In-memory fallback
const demoConfigs = new Map();

module.exports = async (req, res) => {
  try {
    const { deployId } = req.params;
    
    if (!deployId) {
      return res.status(400).json({ error: 'Deploy ID required' });
    }
    
    let config = null;
    
    // Try Supabase first
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('deploy_configs')
          .select('*')
          .eq('id', deployId)
          .single();
        
        if (!error && data) {
          config = data;
        }
      } catch (err) {
        console.log('Supabase read failed, using fallback');
      }
    }
    
    // Fallback to memory
    if (!config) {
      config = demoConfigs.get(deployId);
    }
    
    if (!config) {
      return res.status(404).json({ error: 'Deploy config not found' });
    }
    
    // Return only what's needed (no sensitive data)
    res.json({
      success: true,
      deployId: config.id,
      businessName: config.business_name,
      niche: config.niche,
      chatPrompt: config.chat_prompt,
      voicePrompt: config.voice_prompt,
      businessConfig: config.config
    });
    
  } catch (err) {
    console.error('Demo config error:', err);
    res.status(500).json({ error: 'Failed to load config' });
  }
};

// Export for adding configs
module.exports.demoConfigs = demoConfigs;
