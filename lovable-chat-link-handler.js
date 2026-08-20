// Link handler for Katexs Chat Widget
// Makes URLs clickable in chat messages

function makeLinksClickable(text) {
  // URL regex pattern
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  
  // Replace URLs with clickable links
  return text.replace(urlPattern, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #4fc3f7; text-decoration: underline;">${url}</a>`;
  });
}

// Function to render message with clickable links
function renderMessage(text, sender) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message ${sender}`;
  messageDiv.innerHTML = makeLinksClickable(text);
  return messageDiv;
}

// Export for Lovable
window.makeLinksClickable = makeLinksClickable;
window.renderMessage = renderMessage;
