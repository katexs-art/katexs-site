# PLATFORM INTEGRATION - Katexs.com/platform

## What's Already Built
- Platform UI at `katexs.com/platform`
- Hostinger-style design
- Black/white theme with changeable accents

## What Needs Integration

### 1. Vapi API (Voice Agents)

**For creating voice agents:**
```javascript
// Vapi API Integration
const VAPI_PRIVATE_KEY = '2076d3ac-660f-4050-afd3-8d1d327cf196';
const VAPI_PUBLIC_KEY = '3aa43d4c-cc97-45c0-a851-1f5eb87c2af1';

// Create assistant
async function createVoiceAgent(config) {
  const response = await fetch('https://api.vapi.ai/assistant', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: config.agentName,
      model: {
        provider: 'anthropic',
        model: 'claude-3-5-sonnet-20241022',
        systemPrompt: config.voicePrompt
      },
      voice: {
        provider: '11labs',
        voiceId: config.voiceId || 'burt'
      },
      firstMessage: config.firstMessage,
      endCallFunctionEnabled: true,
      metadata: {
        business_name: config.businessName,
        niche: config.niche
      }
    })
  });
  
  return await response.json();
}

// Get assistants
async function getVoiceAgents() {
  const response = await fetch('https://api.vapi.ai/assistant', {
    headers: {
      'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`
    }
  });
  
  return await response.json();
}

// Update assistant
async function updateVoiceAgent(assistantId, config) {
  const response = await fetch(`https://api.vapi.ai/assistant/${assistantId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(config)
  });
  
  return await response.json();
}
```

### 2. Claude API (Site-wide Chat)

**For the floating chat widget (like Hostinger):**
```javascript
// Claude Chat Integration
const CLAUDE_API_KEY = '***';

class KatexsPlatformChat {
  constructor() {
    this.messages = [];
    this.isOpen = false;
  }
  
  async sendMessage(userMessage) {
    this.messages.push({ role: 'user', content: userMessage });
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        system: `You are Katexs AI, the platform assistant. Help users with:
- Creating and managing AI agents
- Understanding features
- Troubleshooting issues
- Billing questions

Be concise, helpful, and professional.`,
        messages: this.messages
      })
    });
    
    const data = await response.json();
    const reply = data.content[0].text;
    
    this.messages.push({ role: 'assistant', content: reply });
    return reply;
  }
}

// Initialize floating chat
window.katexsChat = new KatexsPlatformChat();
```

### 3. Supabase Integration

**For data storage:**
```javascript
// Supabase client
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://lquoahkuzqwtiiihshdaf.supabase.co',
  'eyJhbG...' // Anon key
);

// Get agents
async function getAgents() {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .order('created_at', { ascending: false });
    
  return data || [];
}

// Create agent
async function createAgent(agentData) {
  const { data, error } = await supabase
    .from('agents')
    .insert({
      name: agentData.name,
      type: agentData.type,
      status: 'active',
      config: agentData.config,
      created_at: new Date().toISOString()
    })
    .select()
    .single();
    
  return data;
}

// Update agent status
async function updateAgentStatus(agentId, status) {
  const { data, error } = await supabase
    .from('agents')
    .update({ status })
    .eq('id', agentId);
    
  return data;
}
```

### 4. Agent Cards Functionality

**Connect to real data:**
```javascript
// Load agents on page
async function loadAgents() {
  const agents = await getAgents();
  
  agents.forEach(agent => {
    renderAgentCard({
      name: agent.name,
      type: agent.type,
      status: agent.status,
      sessions: agent.session_count || 0,
      lastActive: agent.last_active,
      channels: agent.channels || ['voice', 'chat']
    });
  });
}

// Render agent card
function renderAgentCard(agent) {
  return `
    <div class="agent-card">
      <div class="agent-header">
        <div class="agent-icon">${getAgentIcon(agent.type)}</div>
        <div class="agent-status ${agent.status}">${agent.status}</div>
      </div>
      <h3>${agent.name}</h3>
      <p>${agent.type}</p>
      <div class="agent-channels">
        ${agent.channels.map(c => `<span class="channel-${c}">${c}</span>`).join('')}
      </div>
      <div class="agent-stats">
        <span>${agent.sessions} sessions</span>
        <span>Last active ${timeAgo(agent.lastActive)}</span>
      </div>
    </div>
  `;
}
```

### 5. Create Agent Modal

**Full functionality:**
```javascript
// Create agent flow
async function handleCreateAgent(formData) {
  // 1. Create in Supabase
  const agent = await createAgent({
    name: formData.name,
    type: formData.type,
    config: formData.config
  });
  
  // 2. Create Vapi assistant (if voice)
  if (formData.channels.includes('voice')) {
    const vapiAgent = await createVoiceAgent({
      agentName: formData.name,
      voicePrompt: formData.prompt,
      businessName: formData.businessName,
      niche: formData.niche
    });
    
    // Save Vapi ID to Supabase
    await supabase
      .from('agents')
      .update({ vapi_assistant_id: vapiAgent.id })
      .eq('id', agent.id);
  }
  
  // 3. Refresh agent list
  await loadAgents();
  
  // 4. Close modal
  closeModal();
}
```

## API Keys Needed

| Service | Key | Usage |
|---------|-----|-------|
| **Vapi** | `2076d3ac-660f-4050-afd3-8d1d327cf196` | Voice agents |
| **Claude** | `sk-ant...` | Site chat |
| **Supabase** | `eyJhbG...` | Data storage |

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/agents` | GET | List all agents |
| `/api/agents` | POST | Create agent |
| `/api/agents/:id` | PATCH | Update agent |
| `/api/agents/:id` | DELETE | Delete agent |
| `/api/chat` | POST | Claude chat |

## Checklist

- [ ] Vapi API connected for voice
- [ ] Claude API connected for chat
- [ ] Supabase connected for data
- [ ] Agent cards show real data
- [ ] Create agent works end-to-end
- [ ] Status toggles work
- [ ] Session counts accurate
- [ ] Chat widget floating on all pages
