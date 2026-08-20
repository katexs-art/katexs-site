// Claude-Powered Chat Widget for Katexs Demo
// Uses Claude API for chat responses

const CLAUDE_API_KEY = 'sk-ant…iwAA'; // Replace with your key

class KatexsChatWidget {
  constructor(deployId, chatPrompt) {
    this.deployId = deployId;
    this.chatPrompt = chatPrompt;
    this.messages = [];
    this.messageCount = 0;
    this.MESSAGE_CAP = 15;
  }

  async sendMessage(userMessage) {
    if (this.messageCount >= this.MESSAGE_CAP) {
      return { 
        reply: "That's the end of my audition — tap 'Hire Me' and I'm on the clock today.",
        capHit: true 
      };
    }

    this.messages.push({ role: 'user', content: userMessage });
    this.messageCount++;

    try {
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
          system: this.chatPrompt,
          messages: this.messages
        })
      });

      const data = await response.json();
      const reply = data.content[0].text;
      
      this.messages.push({ role: 'assistant', content: reply });

      const isClose = this.messageCount >= this.MESSAGE_CAP - 3 || 
                      reply.includes('make it official');

      return {
        reply,
        messageNumber: this.messageCount,
        remainingMessages: this.MESSAGE_CAP - this.messageCount,
        closeTriggered: isClose,
        capHit: this.messageCount >= this.MESSAGE_CAP
      };

    } catch (error) {
      console.error('Claude API error:', error);
      return { 
        reply: "I'm having trouble connecting. Please try again.",
        error: true 
      };
    }
  }
}

// Export for Lovable
window.KatexsChatWidget = KatexsChatWidget;
