# LOVABLE PROMPT - Katexs AI Customer Service

## What to Build

Build a chat widget for `/deploy/:id` that uses **Claude API directly** for customer service. No Vapi for chat - Vapi is voice-only.

## Key Rules

1. **Claude is the star** - All chat responses come from Claude API
2. **Chat only** - No "calling", no phone references. Use "chat", "message", "reach out"
3. **Widget-based** - Use our embeddable widget, not Vapi's widget
4. **Direct API** - Call `api.anthropic.com` directly from frontend

## Chat Prompt Template

```
You are {{agent_name}}, the AI customer service agent for {{business_name}}.

YOUR KNOWLEDGE:
- Business: {{business_name}}
- Services: {{services_list}}
- Service area: {{service_area}}
- Hours: {{hours}}
- Phone: {{phones_or_none}}
- FAQs: {{faq_pairs}}

BEHAVIOR:
1. Open with: "Hi! Thanks for reaching out to {{business_name}} — I'm {{agent_name}}, the AI assistant. How can I help you today?"
2. Answer ONLY from your knowledge. Never invent services, prices, policies.
3. Outside knowledge: "Great question — let me get the right person for you."
4. No price info: "Pricing depends on the job — want me to have someone reach out with a quote?"
5. Never break character. You are {{agent_name}}, the assistant.

THE MONEY MOTION:
When visitor describes need:
- Ask qualifying questions naturally
- Capture: "Perfect — what's the best name and number for you?"
- Offer booking: "I can get you scheduled. What works better — morning or afternoon?"
- Confirm: "You're all set! You'll get a confirmation shortly."

DEMO MODE: Show the flow, no real booking created.

THE CLOSE (message 12 of 15):
"That's exactly how I handle every chat — 24/7, instant responses, never miss a lead. Want to make it official?"

TONE: Friendly, brief (1-3 sentences), zero corporate stiffness. Contractions always.
```

## API Call

```javascript
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'CLAUDE_API_KEY',
    'anthropic-version': '2023-06-01'
  },
  body: JSON.stringify({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 500,
    system: chatPrompt,
    messages: chatHistory
  })
});
```

## Widget Structure

```html
<div id="katexs-chat-widget">
  <div class="chat-header">
    <span class="agent-name">{{agent_name}}</span>
    <span class="status">Online</span>
  </div>
  <div class="chat-messages"></div>
  <div class="chat-input">
    <input type="text" placeholder="Type a message..." />
    <button>Send</button>
  </div>
</div>
```

## CSS

```css
.chat-message.user {
  background: #1a73e8;
  color: white;
  border-radius: 18px 18px 4px 18px;
}

.chat-message.agent {
  background: #2d2d3a;
  color: #e0e0e0;
  border-radius: 18px 18px 18px 4px;
}
```

## What NOT to Do

❌ Use Vapi for chat
❌ Say "calling" or "phone" 
❌ Use "River" as default name (use generated agent name)
❌ White ring around messages
❌ Break character

## What TO Do

✅ Claude API direct for all chat
✅ "Reaching out" / "messaging" language
✅ Generated agent names (Ava, Mia, Zoe, etc.)
✅ Dark theme message bubbles
✅ Clickable links (blue, underlined)
✅ 15 message cap with close
