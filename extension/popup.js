document.addEventListener('DOMContentLoaded', () => {
  const topicEl = document.getElementById('detected-topic');
  const suggestionsList = document.getElementById('suggestions-list');
  const summaryEl = document.getElementById('summary-text');
  const saveBtn = document.getElementById('save-btn');
  const statusEl = document.getElementById('status');

  // Request latest data from background
  chrome.runtime.sendMessage({ type: 'getData' }, (response) => {
    if (response) {
      topicEl.textContent = response.topic || 'No topic detected';
      summaryEl.textContent = response.summary || 'No summary available';

      suggestionsList.innerHTML = '';
      if (response.suggestions && response.suggestions.length > 0) {
        response.suggestions.forEach(suggestion => {
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.href = suggestion.url;
          a.target = '_blank';
          a.textContent = suggestion.title;
          li.appendChild(a);
          suggestionsList.appendChild(li);
        });
      } else {
        suggestionsList.innerHTML = '<li>No suggestions available</li>';
      }
    } else {
      topicEl.textContent = 'No data';
      summaryEl.textContent = 'No data';
      suggestionsList.innerHTML = '<li>No data</li>';
    }
  });

  saveBtn.addEventListener('click', () => {
    chrome.storage.local.get(['savedInfo'], (result) => {
      const saved = result.savedInfo || [];
      chrome.runtime.sendMessage({ type: 'getData' }, (response) => {
        saved.push({
          topic: response.topic,
          summary: response.summary,
          suggestions: response.suggestions,
          timestamp: new Date().toISOString()
        });
        chrome.storage.local.set({ savedInfo: saved }, () => {
          statusEl.textContent = 'Information saved!';
          setTimeout(() => statusEl.textContent = '', 2000);
        });
      });
    });
  });
});