// Voice Debug Script
// Add this to your page to test Vapi

function testVoice() {
  console.log('Testing voice...');
  
  // Check if Vapi SDK loaded
  if (typeof window.Vapi === 'undefined') {
    console.error('❌ Vapi SDK not loaded');
    alert('Vapi SDK not loaded. Check internet connection.');
    return;
  }
  console.log('✅ Vapi SDK found');
  
  // Check if public key is set
  const publicKey = '3aa43d4c-cc97-45c0-a851-1f5eb87c2af1';
  if (!publicKey) {
    console.error('❌ Vapi public key missing');
    return;
  }
  console.log('✅ Public key found');
  
  // Try to initialize
  try {
    const vapi = new window.Vapi(publicKey);
    console.log('✅ Vapi initialized');
    
    // Test start
    vapi.start({
      model: {
        provider: 'anthropic',
        model: 'claude-3-5-sonnet-20241022',
        systemPrompt: 'You are a test assistant. Say hello.'
      },
      voice: {
        provider: '11labs',
        voiceId: 'burt'
      }
    }).then(() => {
      console.log('✅ Call started');
    }).catch(err => {
      console.error('❌ Call failed:', err);
      alert('Call failed: ' + err.message);
    });
    
  } catch (err) {
    console.error('❌ Vapi init failed:', err);
    alert('Vapi init failed: ' + err.message);
  }
}

// Add test button
window.testVoice = testVoice;
console.log('Voice debug loaded. Run testVoice() in console or click button.');
