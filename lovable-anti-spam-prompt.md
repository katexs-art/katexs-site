# ANTI-SPAM PROMPT - Katexs Demo Protection

## Goal
Prevent abuse of demo chat and voice. Keep API costs down. Maintain demo integrity.

## Anti-Spam Rules for Chat

### Rate Limiting
```javascript
// Frontend rate limiting
const RATE_LIMIT = {
  maxMessages: 15,        // Total demo cap
  maxPerMinute: 5,        // Messages per minute
  cooldownMs: 10000,      // 10 second cooldown between messages
  ipBlockDuration: 3600000 // 1 hour IP block after abuse
};

// Track in sessionStorage
let messageCount = parseInt(sessionStorage.getItem('demo_messages') || '0');
let lastMessageTime = parseInt(sessionStorage.getItem('demo_last_time') || '0');
```

### Spam Detection
```javascript
function isSpam(message, history) {
  // Check 1: Empty or too short
  if (!message || message.length < 2) return true;
  
  // Check 2: Repeated same message
  const lastMessage = history[history.length - 1];
  if (lastMessage && message.toLowerCase() === lastMessage.toLowerCase()) return true;
  
  // Check 3: Gibberish/random characters
  const gibberishPattern = /^(.)\1{4,}$/; // "aaaaa" or "xxxxx"
  if (gibberishPattern.test(message)) return true;
  
  // Check 4: Too many messages too fast
  const now = Date.now();
  if (now - lastMessageTime < RATE_LIMIT.cooldownMs) return true;
  
  // Check 5: Copy-paste spam (very long repeated text)
  if (message.length > 500) return true;
  
  return false;
}
```

### Response to Spam
```javascript
function handleSpam() {
  const responses = [
    "Hey, let's keep this real. One message at a time.",
    "Whoa there — I'm built for real conversations, not speed tests.",
    "Slow down! Quality over quantity.",
    "This demo is for real business owners. Let's chat properly."
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}
```

## Anti-Spam Rules for Voice (Vapi)

### Call Limits
```javascript
const VOICE_LIMITS = {
  maxCallsPerSession: 1,      // One voice demo per session
  maxCallDuration: 300000,    // 5 minutes max
  blockRepeatCallers: true    // Block same IP for 1 hour
};
```

### Voice Spam Detection
```javascript
// In Vapi webhook, check before connecting
function validateVoiceCall(callerId, ip) {
  // Check if already had a call
  if (sessionStorage.getItem('voice_call_completed')) {
    return { allowed: false, reason: 'Demo already completed' };
  }
  
  // Check IP block list
  if (isBlocked(ip)) {
    return { allowed: false, reason: 'Please try again later' };
  }
  
  return { allowed: true };
}
```

## Backend Protection (n8n)

### Webhook Rate Limiting
```javascript
// In n8n, before processing
const ip = $json.headers['x-forwarded-for'] || $json.headers['x-real-ip'];
const now = Date.now();

// Check Redis/memory for IP limits
const ipData = await getIpData(ip);
if (ipData.count > 50) { // Max 50 requests per hour
  return [{ json: { error: 'Rate limit exceeded', retryAfter: 3600 }}];
}

// Increment counter
await incrementIpCounter(ip, now);
```

### Cost Controls
```javascript
const COST_LIMITS = {
  maxTokensPerMessage: 500,     // Limit Claude response length
  maxMessagesPerDemo: 15,       // Hard cap on demo
  dailySpendLimit: 50,          // $50/day max across all demos
  alertThreshold: 40            // Alert at $40
};
```

## Frontend Implementation

### Chat Widget Anti-Spam
```javascript
class KatexsChatWidget {
  constructor() {
    this.messageCount = 0;
    this.lastMessageTime = 0;
    this.blocked = false;
  }

  async sendMessage(userMessage) {
    // Check if blocked
    if (this.blocked) {
      return { reply: "You've reached the demo limit. Ready to hire me?", capHit: true };
    }
    
    // Check rate limit
    const now = Date.now();
    if (now - this.lastMessageTime < 10000) { // 10 second cooldown
      return { reply: "Slow down! One message at a time.", spam: true };
    }
    
    // Check spam
    if (this.isSpam(userMessage)) {
      return { reply: this.getSpamResponse(), spam: true };
    }
    
    // Proceed with normal message
    this.lastMessageTime = now;
    this.messageCount++;
    
    // ... normal Claude API call
  }
  
  isSpam(message) {
    // Same checks as above
    if (!message || message.length < 2) return true;
    if (message.length > 500) return true;
    
    // Check gibberish
    const gibberish = /^(.)\1{4,}$/;
    if (gibberish.test(message)) return true;
    
    return false;
  }
  
  getSpamResponse() {
    const responses = [
      "Hey, let's keep this real. One message at a time.",
      "Whoa there — I'm built for real conversations, not speed tests.",
      "Slow down! Quality over quantity.",
      "This demo is for real business owners. Let's chat properly."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
}
```

### Voice Widget Anti-Spam
```javascript
class KatexsVoiceAgent {
  constructor() {
    this.callStarted = false;
    this.callCount = 0;
  }

  async start() {
    // Check if already used voice
    if (this.callCount >= 1) {
      alert('Voice demo already completed. Ready to hire me?');
      return;
    }
    
    // Check session
    if (sessionStorage.getItem('voice_demo_used')) {
      alert('One voice demo per session. Try the chat!');
      return;
    }
    
    this.callCount++;
    sessionStorage.setItem('voice_demo_used', 'true');
    
    // ... start Vapi call
  }
}
```

## Monitoring & Alerts

### Telegram Alerts
```javascript
// Send alert when abuse detected
async function sendAbuseAlert(ip, type, details) {
  const message = `🚨 Spam Detected
Type: ${type}
IP: ${ip}
Details: ${details}
Time: ${new Date().toISOString()}`;
  
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message
    })
  });
}
```

### Daily Summary
```javascript
// Daily report
function dailySummary() {
  const stats = {
    totalDemos: getTotalDemos(),
    totalMessages: getTotalMessages(),
    spamBlocked: getSpamCount(),
    cost: getDailyCost()
  };
  
  sendTelegramAlert(`📊 Daily Stats
Demos: ${stats.totalDemos}
Messages: ${stats.totalMessages}
Spam Blocked: ${stats.spamBlocked}
Cost: $${stats.cost}`);
}
```

## Summary

| Protection | Implementation |
|-----------|----------------|
| Message rate limit | 10 second cooldown |
| Max messages | 15 per demo |
| Gibberish detection | Regex pattern |
| Repeat detection | Compare to last message |
| Length limit | 500 chars max |
| Voice limit | 1 call per session |
| IP blocking | 1 hour after abuse |
| Daily cost cap | $50/day |
| Alerts | Telegram notifications |

This keeps costs down and demos clean.
