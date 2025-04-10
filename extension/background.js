// Real-Time Research Assistant - Background Service Worker

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received in background:", request);

  if (request.action === "analyzePage") {
    const tabId = request.tabId || (sender.tab ? sender.tab.id : null);
    const pageUrl = request.url || (sender.tab ? sender.tab.url : null);
    console.log("Analyzing page:", pageUrl, "Tab ID:", tabId);

    if (!tabId) {
      console.error("Cannot analyze page: Tab ID is missing.");
      sendResponse({ status: "error", message: "Missing Tab ID." });
      return false; // No async response needed
    }

    // 1. Get content from the content script
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => document.body.innerText // Simple extraction, consider refining
    }).then(injectionResults => {
      if (chrome.runtime.lastError || !injectionResults || injectionResults.length === 0) {
        console.error("Scripting error or no result:", chrome.runtime.lastError);
        sendResponse({ status: "error", message: "Could not get page content." });
        return;
      }
      const pageContent = injectionResults[0].result;
      console.log("Page content retrieved (first 100 chars):", pageContent.substring(0, 100));

      // 2. Send content to backend for analysis
      fetch('http://localhost:3000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: pageContent.substring(0, 8000), url: pageUrl }) // Limit content size
      })
      .then(response => response.json())
      .then(data => {
        console.log("Backend /analyze response:", data);
        if (data.error) {
          sendResponse({ status: "error", message: data.error });
        } else {
          // Send back the topic and summary from the backend
          sendResponse({ status: "analyzed", topic: data.topic, summary: data.summary });
        }
      })
      .catch(error => {
        console.error('Error calling backend /analyze:', error);
        sendResponse({ status: "error", message: `Backend connection failed: ${error.message}` });
      });

    }).catch(error => {
        console.error('Error executing script:', error);
        sendResponse({ status: "error", message: `Failed to execute script: ${error.message}` });
    });

    return true; // Indicates that the response is sent asynchronously
  }

  if (request.action === "getSuggestions") {
    const topic = request.topic;
    console.log("Fetching suggestions for topic:", topic);

    if (!topic) {
        sendResponse({ status: "error", message: "Topic is required." });
        return false;
    }

    fetch('http://localhost:3000/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Backend /suggestions response:", data);
         if (data.error) {
          sendResponse({ status: "error", message: data.error, suggestions: [] });
        } else {
          sendResponse({ status: "success", suggestions: data.suggestions || [] });
        }
    })
    .catch(error => {
        console.error('Error calling backend /suggestions:', error);
        sendResponse({ status: "error", message: `Backend connection failed: ${error.message}`, suggestions: [] });
    });

    return true; // Indicates that the response is sent asynchronously
  }

  // Add more message handlers as needed
});

// Example: Listen for tab updates to potentially trigger analysis
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
    // console.log("Tab updated:", tab.url);
    // Optionally trigger analysis automatically here, or wait for user action
  }
});

console.log("Background service worker started.");