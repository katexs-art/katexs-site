/**
 * Voice + Chat Bridge
 * Unified interface for both voice (Vapi) and chat interactions
 */

class VoiceChatBridge {
  constructor(config) {
    this.config = {
      vapiApiKey: config.vapiApiKey,
      assistantId: config.assistantId,
      sessionId: config.sessionId,
      onMessage: config.onMessage || (() => {}),
      onVoiceStart: config.onVoiceStart || (() => {}),
      onVoiceEnd: config.onVoiceEnd || (() => {}),
      ...config
    };
    
    this.conversationHistory = [];
    this.isVoiceActive = false;
    this.vapiClient = null;
  }

  async init() {
    // Initialize Vapi client
    if (window.Vapi) {
      this.vapiClient = new window.Vapi(this.config.vapiApiKey);
      this.setupVapiListeners();
    }
  }

  setupVapiListeners() {
    this.vapiClient.on('call-start', () => {
      this.isVoiceActive = true;
      this.config.onVoiceStart();
    });

    this.vapiClient.on('call-end', () => {
      this.isVoiceActive = false;
      this.config.onVoiceEnd();
    });

    this.vapiClient.on('message', (message) => {
      if (message.type === 'transcript' && message.transcriptType === 'final') {
        this.handleVoiceInput(message.transcript);
      }
    });

    this.vapiClient.on('error', (error) => {
      console.error('Vapi error:', error);
    });
  }

  async handleVoiceInput(transcript) {
    // Add to conversation history
    this.conversationHistory.push({
      role: 'user',
      content: transcript,
      timestamp: Date.now(),
      channel: 'voice'
    });

    // Get AI response (same endpoint as chat)
    const response = await this.getAIResponse(transcript, 'voice');
    
    // Add AI response to history
    this.conversationHistory.push({
      role: 'assistant',
      content: response,
      timestamp: Date.now(),
      channel: 'voice'
    });

    // Notify UI
    this.config.onMessage({
      sender: 'agent',
      text: response,
      channel: 'voice'
    });
  }

  async handleChatInput(text) {
    // Add to conversation history
    this.conversationHistory.push({
      role: 'user',
      content: text,
      timestamp: Date.now(),
      channel: 'chat'
    });

    // Get AI response
    const response = await this.getAIResponse(text, 'chat');
    
    // Add AI response to history
    this.conversationHistory.push({
      role: 'assistant',
      content: response,
      timestamp: Date.now(),
      channel: 'chat'
    });

    // Notify UI
    this.config.onMessage({
      sender: 'agent',
      text: response,
      channel: 'chat'
    });

    return response;
  }

  async getAIResponse(input, channel) {
    try {
      const response = await fetch(`${this.config.apiUrl}/api/demo/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.config.sessionId,
          message: input,
          channel: channel,
          history: this.conversationHistory.slice(-10) // Last 10 messages for context
        })
      });

      const data = await response.json();
      return data.reply;
    } catch (err) {
      console.error('AI response failed:', err);
      return "I'm having trouble connecting. One moment please...";
    }
  }

  async startVoiceCall() {
    if (!this.vapiClient) {
      throw new Error('Vapi not initialized');
    }

    await this.vapiClient.start(this.config.assistantId, {
      sessionId: this.config.sessionId,
      // Pass conversation history for continuity
      conversationHistory: this.conversationHistory
    });
  }

  endVoiceCall() {
    if (this.vapiClient) {
      this.vapiClient.stop();
    }
  }

  // Switch from chat to voice (maintains context)
  async switchToVoice() {
    // Start voice call with current context
    await this.startVoiceCall();
    
    // Send system message to voice agent with current context
    const contextSummary = this.buildContextSummary();
    
    // This ensures voice agent knows what's been discussed
    return {
      success: true,
      message: 'Switched to voice mode',
      context: contextSummary
    };
  }

  // Switch from voice to chat (maintains context)
  async switchToChat() {
    this.endVoiceCall();
    
    return {
      success: true,
      message: 'Switched to chat mode',
      history: this.conversationHistory
    };
  }

  buildContextSummary() {
    // Build a summary of the conversation for context switching
    const recentMessages = this.conversationHistory.slice(-5);
    return recentMessages.map(m => `${m.role}: ${m.content}`).join('\n');
  }

  getConversationHistory() {
    return this.conversationHistory;
  }

  clearHistory() {
    this.conversationHistory = [];
  }
}

export default VoiceChatBridge;
