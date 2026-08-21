# KATEXS PLATFORM CHAT WIDGET

## Design Reference: Hostinger AI Agent

### Position
- **Top right corner** of platform (not bottom)
- **Button**: "Agent" with sparkle icon
- **Opens**: Slide-out panel from right side

### Widget Structure

```
┌─────────────────────────────────────┐
│  ☰  ✨ Agent              ⛶  ✕    │  ← Header
├─────────────────────────────────────┤
│                                     │
│     [Katexs Logo]                   │
│                                     │
│     Hello {user_name} 👋            │  ← Greeting
│     How can I help you today?       │
│                                     │
├─────────────────────────────────────┤
│  ↗ Check Ongoing Actions            │  ← Quick Actions
│  ↗ View Agent Logs                  │
│  ↗ Check Voice Connectivity         │
│  ↗ Katexs Data Center Locations     │
├─────────────────────────────────────┤
│  [Voice] [Chat] [Agents] [Account]  │  ← Category Tabs
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐    │
│  │ How do I create a voice     │    │  ← Input
│  │ agent for my business?      │    │
│  └─────────────────────────────┘    │
│  ⚡ Agent ▼              🎙️        │  ← Model + Voice
│                                     │
│  Agent can make mistakes.           │  ← Disclaimer
│  Double-check replies.              │
└─────────────────────────────────────┘
```

### Styling

```css
/* Widget Panel */
.agent-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100vh;
  background: #ffffff;
  box-shadow: -4px 0 24px rgba(0,0,0,0.08);
  z-index: 9999;
  display: flex;
  flex-direction: column;
}

/* Header */
.agent-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.agent-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 8px;
}

.agent-title::before {
  content: "✨";
}

/* Greeting Section */
.agent-greeting {
  padding: 32px 24px;
  text-align: center;
}

.agent-greeting h2 {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
}

.agent-greeting p {
  font-size: 14px;
  color: #6b7280;
}

/* Quick Actions */
.agent-actions {
  padding: 0 20px;
}

.action-item {
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.action-item:hover {
  background: #f3f4f6;
}

.action-item::before {
  content: "↗";
  color: #6b7280;
}

/* Category Tabs */
.agent-tabs {
  padding: 16px 20px;
  display: flex;
  gap: 8px;
  overflow-x: auto;
}

.agent-tab {
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid #e5e7eb;
  background: transparent;
  color: #374151;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
}

.agent-tab.active {
  background: #111827;
  color: white;
  border-color: #111827;
}

/* Input Area */
.agent-input-area {
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  margin-top: auto;
}

.agent-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  resize: none;
  min-height: 80px;
}

.agent-input:focus {
  outline: none;
  border-color: #111827;
}

/* Footer */
.agent-footer {
  padding: 8px 20px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.agent-model {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;
}

.agent-voice-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid #e5e7eb;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.agent-disclaimer {
  padding: 0 20px 16px;
  font-size: 12px;
  color: #9ca3af;
  text-align: center;
}

/* Messages */
.agent-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}

.message-user {
  background: #111827;
  color: white;
  padding: 12px 16px;
  border-radius: 16px 16px 4px 16px;
  margin-bottom: 12px;
  max-width: 85%;
  align-self: flex-end;
}

.message-agent {
  background: #f3f4f6;
  color: #111827;
  padding: 12px 16px;
  border-radius: 16px 16px 16px 4px;
  margin-bottom: 12px;
  max-width: 85%;
}

/* Toggle Button (when closed) */
.agent-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 10px 20px;
  background: #111827;
  color: white;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 9998;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.agent-toggle::before {
  content: "✨";
}
```

### Claude Prompt

```
You are Katexs AI, the premium platform assistant for Katexs - a billion-dollar AI workforce platform.

YOUR ROLE:
- Help users create and manage AI agents
- Guide through platform features
- Troubleshoot technical issues
- Answer billing questions
- Provide strategic advice on AI implementation

TONE:
- Professional but warm
- Confident and knowledgeable
- Concise and actionable
- Billion-dollar company quality

OPENING:
"Hello {user_name} 👋\nHow can I help you today?"

QUICK ACTIONS:
- Check Ongoing Actions
- View Agent Logs  
- Check Voice Connectivity
- Katexs Data Center Locations

CATEGORIES:
- Voice (voice agents)
- Chat (chat agents)
- Agents (all agents)
- Account (billing, settings)

RULES:
- Always offer specific next steps
- Use platform terminology correctly
- If unsure, escalate gracefully
- Maintain premium feel in every response
```

### Implementation

```javascript
class KatexsPlatformChat {
  constructor() {
    this.isOpen = false;
    this.messages = [];
    this.userName = 'there'; // Get from auth
  }

  async init() {
    // Create toggle button
    this.createToggleButton();
    
    // Create panel (hidden initially)
    this.createPanel();
    
    // Load Claude
    this.claude = new ClaudeAPI();
  }

  createToggleButton() {
    const btn = document.createElement('button');
    btn.className = 'agent-toggle';
    btn.innerHTML = '✨ Agent';
    btn.onclick = () => this.toggle();
    document.body.appendChild(btn);
  }

  createPanel() {
    const panel = document.createElement('div');
    panel.className = 'agent-panel';
    panel.style.display = 'none';
    panel.innerHTML = `
      <div class="agent-header">
        <div class="agent-title">Agent</div>
        <div>
          <button onclick="chat.maximize()">⛶</button>
          <button onclick="chat.close()">✕</button>
        </div>
      </div>
      <div class="agent-greeting">
        <h2>Hello ${this.userName} 👋</h2>
        <p>How can I help you today?</p>
      </div>
      <div class="agent-actions">
        <div class="action-item">Check Ongoing Actions</div>
        <div class="action-item">View Agent Logs</div>
        <div class="action-item">Check Voice Connectivity</div>
        <div class="action-item">Katexs Data Center Locations</div>
      </div>
      <div class="agent-tabs">
        <button class="agent-tab active">Voice</button>
        <button class="agent-tab">Chat</button>
        <button class="agent-tab">Agents</button>
        <button class="agent-tab">Account</button>
      </div>
      <div class="agent-messages"></div>
      <div class="agent-input-area">
        <textarea class="agent-input" placeholder="Ask me anything..."></textarea>
      </div>
      <div class="agent-footer">
        <div class="agent-model">⚡ Agent</div>
        <button class="agent-voice-btn">🎙️</button>
      </div>
      <div class="agent-disclaimer">
        Agent can make mistakes. Double-check replies.
      </div>
    `;
    document.body.appendChild(panel);
  }

  toggle() {
    this.isOpen = !this.isOpen;
    document.querySelector('.agent-panel').style.display = 
      this.isOpen ? 'flex' : 'none';
  }

  async sendMessage(message) {
    // Add user message
    this.addMessage('user', message);
    
    // Call Claude
    const response = await this.claude.send(message, this.messages);
    
    // Add agent response
    this.addMessage('agent', response);
  }
}

// Initialize
const chat = new KatexsPlatformChat();
chat.init();
```

## Key Features

1. **Top-right position** (not bottom)
2. **Slide-out panel** (not popup)
3. **Professional greeting** with user name
4. **Quick actions** for common tasks
5. **Category tabs** (Voice, Chat, Agents, Account)
6. **Voice input** button
7. **Model selector** (Agent dropdown)
8. **Disclaimer** footer
9. **Billion-dollar quality** feel

Build this now.
