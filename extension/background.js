let latestData = {
  topic: '',
  suggestions: [],
  summary: ''
};

async function fetchAIResults(text) {
  try {
    const response = await fetch('http://localhost:5000/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: text })
    });
    const data = await response.json();
    // For demo, treat response.text as summary and topic
    latestData.summary = data.text || '';
    latestData.topic = data.text ? data.text.split('.')[0] : '';
    // Placeholder suggestions
    latestData.suggestions = [
      { title: 'Related Article 1', url: 'https://example.com/1' },
      { title: 'Related Article 2', url: 'https://example.com/2' }
    ];
  } catch (error) {
    console.error('Error fetching AI results:', error);
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'pageContent') {
    fetchAIResults(message.text);
  } else if (message.type === 'getData') {
    sendResponse(latestData);
  }
});