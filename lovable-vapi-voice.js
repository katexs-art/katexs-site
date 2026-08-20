// Vapi Voice Integration for Katexs Demo
// Uses Claude API for voice responses

const VAPI_PUBLIC_KEY = '3aa43d4c-cc97-45c0-a851-1f5eb87c2af1';

class KatexsVoiceAgent {
  constructor(deployId, voicePrompt) {
    this.deployId = deployId;
    this.voicePrompt = voicePrompt;
    this.vapi = null;
    this.isActive = false;
  }

  async init() {
    // Load Vapi SDK
    if (!window.Vapi) {
      await this.loadScript('https://cdn.jsdelivr.net/npm/@vapi-ai/web@latest/dist/vapi.js');
    }
    
    this.vapi = new window.Vapi(VAPI_PUBLIC_KEY);
    
    // Configure with Claude-powered voice prompt
    this.vapi.on('call-start', () => {
      console.log('Voice call started');
      this.isActive = true;
    });
    
    this.vapi.on('call-end', () => {
      console.log('Voice call ended');
      this.isActive = false;
    });
    
    this.vapi.on('error', (error) => {
      console.error('Vapi error:', error);
    });
  }

  async start() {
    if (!this.vapi) await this.init();
    
    // Start call with Claude-powered system prompt
    await this.vapi.start({
      model: {
        provider: 'anthropic',
        model: 'claude-3-5-sonnet-20241022',
        systemPrompt: this.voicePrompt
      },
      voice: {
        provider: '11labs',
        voiceId: 'burt' // Professional male voice
      },
      firstMessage: "Hi, thanks for calling. How can I help you today?",
      endCallFunctionEnabled: true,
      endCallMessage: "Thanks for calling. Have a great day!",
      metadata: {
        deploy_id: this.deployId,
        source: 'katexs_demo'
      }
    });
  }

  stop() {
    if (this.vapi && this.isActive) {
      this.vapi.stop();
    }
  }

  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
}

// Export for Lovable
window.KatexsVoiceAgent = KatexsVoiceAgent;
