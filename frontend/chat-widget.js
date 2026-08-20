/**
 * Katexs AI Chat Widget
 * Embeddable chat widget for demo and live agents
 */

class KatexsChatWidget {
  constructor(config) {
    this.config = {
      apiUrl: config.apiUrl || 'https://api.katexs.com',
      sessionId: config.sessionId || this.generateSessionId(),
      businessName: config.businessName || 'Our Business',
      agentName: config.agentName || 'Assistant',
      primaryColor: config.primaryColor || '#1a73e8',
      position: config.position || 'bottom-right',
      ...config
    };
    
    this.messageCount = 0;
    this.messageCap = 15;
    this.isDemo = true;
    this.messages = [];
    
    this.init();
  }

  generateSessionId() {
    return 'demo_' + Math.random().toString(36).substr(2, 9);
  }

  init() {
    this.createStyles();
    this.createWidget();
    this.attachEventListeners();
  }

  createStyles() {
    const styles = document.createElement('style');
    styles.textContent = `
      .katexs-widget {
        position: fixed;
        ${this.config.position.includes('bottom') ? 'bottom: 20px;' : 'top: 20px;'}
        ${this.config.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        z-index: 9999;
      }
      
      .katexs-chat-window {
        width: 380px;
        height: 600px;
        background: white;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.15);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        transition: all 0.3s ease;
      }
      
      .katexs-header {
        background: ${this.config.primaryColor};
        color: white;
        padding: 16px 20px;
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      .katexs-header-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(255,255,255,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
      }
      
      .katexs-header-info h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }
      
      .katexs-header-info p {
        margin: 0;
        font-size: 13px;
        opacity: 0.9;
      }
      
      .katexs-demo-badge {
        position: absolute;
        top: 12px;
        right: 12px;
        background: rgba(255,255,255,0.2);
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 500;
      }
      
      .katexs-messages {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      
      .katexs-message {
        max-width: 80%;
        padding: 12px 16px;
        border-radius: 16px;
        font-size: 14px;
        line-height: 1.5;
        animation: messageSlide 0.3s ease;
      }
      
      @keyframes messageSlide {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .katexs-message.user {
        align-self: flex-end;
        background: ${this.config.primaryColor};
        color: white;
        border-bottom-right-radius: 4px;
      }
      
      .katexs-message.agent {
        align-self: flex-start;
        background: #f0f0f0;
        color: #333;
        border-bottom-left-radius: 4px;
      }
      
      .katexs-input-area {
        padding: 16px 20px;
        border-top: 1px solid #e0e0e0;
        display: flex;
        gap: 10px;
      }
      
      .katexs-input {
        flex: 1;
        border: 1px solid #ddd;
        border-radius: 24px;
        padding: 10px 18px;
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s;
      }
      
      .katexs-input:focus {
        border-color: ${this.config.primaryColor};
      }
      
      .katexs-send-btn {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: ${this.config.primaryColor};
        color: white;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s;
      }
      
      .katexs-send-btn:hover {
        transform: scale(1.05);
      }
      
      .katexs-hire-screen {
        position: absolute;
        inset: 0;
        background: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px;
        text-align: center;
        z-index: 10;
      }
      
      .katexs-hire-screen h2 {
        font-size: 24px;
        margin-bottom: 12px;
      }
      
      .katexs-hire-screen p {
        color: #666;
        margin-bottom: 24px;
      }
      
      .katexs-pricing-card {
        border: 2px solid #e0e0e0;
        border-radius: 12px;
        padding: 24px;
        margin: 8px 0;
        width: 100%;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .katexs-pricing-card:hover {
        border-color: ${this.config.primaryColor};
      }
      
      .katexs-pricing-card.featured {
        border-color: ${this.config.primaryColor};
        background: rgba(26, 115, 232, 0.05);
      }
      
      .katexs-pricing-card h3 {
        margin: 0 0 8px 0;
        font-size: 18px;
      }
      
      .katexs-pricing-card .price {
        font-size: 32px;
        font-weight: 700;
        color: ${this.config.primaryColor};
      }
      
      .katexs-pricing-card .price span {
        font-size: 16px;
        color: #666;
        font-weight: 400;
      }
      
      .katexs-pricing-card ul {
        text-align: left;
        margin: 16px 0;
        padding-left: 20px;
        color: #555;
      }
      
      .katexs-pricing-card li {
        margin: 6px 0;
      }
      
      .katexs-cta-btn {
        background: ${this.config.primaryColor};
        color: white;
        border: none;
        padding: 14px 32px;
        border-radius: 24px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        width: 100%;
        transition: transform 0.2s;
      }
      
      .katexs-cta-btn:hover {
        transform: scale(1.02);
      }
      
      .katexs-toggle-btn {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: ${this.config.primaryColor};
        color: white;
        border: none;
        cursor: pointer;
        font-size: 24px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        transition: transform 0.2s;
      }
      
      .katexs-toggle-btn:hover {
        transform: scale(1.05);
      }
      
      .katexs-hidden {
        display: none !important;
      }
    `;
    document.head.appendChild(styles);
  }

  createWidget() {
    const widget = document.createElement('div');
    widget.className = 'katexs-widget';
    widget.innerHTML = `
      <div class="katexs-chat-window katexs-hidden" id="katexs-chat-window">
        <div class="katexs-header">
          <div class="katexs-header-avatar">🤖</div>
          <div class="katexs-header-info">
            <h3>${this.config.agentName}</h3>
            <p>${this.config.businessName}</p>
          </div>
          <span class="katexs-demo-badge">Demo</span>
        </div>
        
        <div class="katexs-messages" id="katexs-messages"></div>
        
        <div class="katexs-input-area">
          <input type="text" class="katexs-input" id="katexs-input" 
                 placeholder="Type a message..." maxlength="500">
          <button class="katexs-send-btn" id="katexs-send">→</button>
        </div>
        
        <div class="katexs-hire-screen katexs-hidden" id="katexs-hire-screen">
          <h2>🎉 ${this.config.agentName} is Ready to Work!</h2>
          <p>Your AI receptionist is trained and ready. Choose your plan:</p>
          
          <div class="katexs-pricing-card" data-plan="starter">
            <h3>Quick Start</h3>
            <div class="price">$50<span>/mo</span></div>
            <ul>
              <li>AI chat on your website</li>
              <li>Trained on your business</li>
              <li>500 messages/month</li>
              <li>Basic dashboard</li>
            </ul>
            <button class="katexs-cta-btn">Get Started</button>
          </div>
          
          <div class="katexs-pricing-card featured" data-plan="pro">
            <h3>Professional ⭐</h3>
            <div class="price">$497<span>/mo</span></div>
            <ul>
              <li>Voice + Chat AI agent</li>
              <li>1,000 voice minutes</li>
              <li>Unlimited chat</li>
              <li>CRM integration</li>
              <li>Priority support</li>
            </ul>
            <button class="katexs-cta-btn">Go Pro</button>
          </div>
        </div>
      </div>
      
      <button class="katexs-toggle-btn" id="katexs-toggle">💬</button>
    `;
    
    document.body.appendChild(widget);
    this.elements = {
      chatWindow: document.getElementById('katexs-chat-window'),
      messages: document.getElementById('katexs-messages'),
      input: document.getElementById('katexs-input'),
      sendBtn: document.getElementById('katexs-send'),
      toggleBtn: document.getElementById('katexs-toggle'),
      hireScreen: document.getElementById('katexs-hire-screen')
    };
  }

  attachEventListeners() {
    this.elements.toggleBtn.addEventListener('click', () => this.toggleChat());
    this.elements.sendBtn.addEventListener('click', () => this.sendMessage());
    this.elements.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });
    
    // Pricing card clicks
    document.querySelectorAll('.katexs-pricing-card').forEach(card => {
      card.addEventListener('click', () => this.selectPlan(card.dataset.plan));
    });
  }

  toggleChat() {
    this.elements.chatWindow.classList.toggle('katexs-hidden');
    if (!this.elements.chatWindow.classList.contains('katexs-hidden') && this.messages.length === 0) {
      this.startDemo();
    }
  }

  async startDemo() {
    // Fetch agent config and greeting
    try {
      const response = await fetch(`${this.config.apiUrl}/api/demo/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: this.config.sessionId })
      });
      const data = await response.json();
      
      if (data.greeting) {
        this.addMessage('agent', data.greeting);
      }
    } catch (err) {
      console.error('Demo start failed:', err);
      this.addMessage('agent', `Hi! I'm ${this.config.agentName}, your AI receptionist. How can I help you today?`);
    }
  }

  async sendMessage() {
    const text = this.elements.input.value.trim();
    if (!text) return;
    
    if (this.messageCount >= this.messageCap) {
      this.showHireScreen();
      return;
    }
    
    this.addMessage('user', text);
    this.elements.input.value = '';
    this.messageCount++;
    
    try {
      const response = await fetch(`${this.config.apiUrl}/api/demo/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.config.sessionId,
          message: text,
          messageNumber: this.messageCount
        })
      });
      
      const data = await response.json();
      this.addMessage('agent', data.reply);
      
      if (data.closeTriggered || this.messageCount >= this.messageCap - 1) {
        setTimeout(() => this.showHireScreen(), 2000);
      }
    } catch (err) {
      console.error('Message failed:', err);
      this.addMessage('agent', "I'm having trouble connecting. One moment please...");
    }
  }

  addMessage(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `katexs-message ${sender}`;
    msgDiv.textContent = text;
    this.elements.messages.appendChild(msgDiv);
    this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
    this.messages.push({ sender, text, timestamp: Date.now() });
  }

  showHireScreen() {
    this.elements.hireScreen.classList.remove('katexs-hidden');
  }

  async selectPlan(plan) {
    try {
      const response = await fetch(`${this.config.apiUrl}/api/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.config.sessionId,
          plan: plan
        })
      });
      
      const data = await response.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      console.error('Checkout failed:', err);
      alert('Something went wrong. Please try again.');
    }
  }
}

// Auto-initialize if config exists
if (window.KATEXS_CONFIG) {
  window.katexsWidget = new KatexsChatWidget(window.KATEXS_CONFIG);
}

export default KatexsChatWidget;
