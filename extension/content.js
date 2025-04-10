// Real-Time Research Assistant - Content Script

console.log("Research Assistant content script loaded.");

// Function to extract text content from the page
function getPageContent() {
  // Simple extraction, can be improved (e.g., focus on main content area)
  return document.body.innerText;
}

// Listen for messages from the popup or background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received in content script:", request);

  if (request.action === "getPageData") {
    const pageContent = getPageContent();
    const pageUrl = window.location.href;
    console.log("Sending page data to background.");
    sendResponse({
      status: "success",
      url: pageUrl,
      content: pageContent.substring(0, 5000) // Send a snippet for analysis
    });
  }

  // Add more message handlers if needed (e.g., highlighting text)
});

// Example: Send a message to the background script when the page loads
// (Could be used for automatic analysis, but might be too resource-intensive)
/*
window.onload = () => {
  chrome.runtime.sendMessage({ action: "analyzePage", url: window.location.href }, (response) => {
    if (chrome.runtime.lastError) {
      console.error("Error sending message:", chrome.runtime.lastError.message);
    } else {
      console.log("Background response:", response);
    }
  });
};
*/

// You might want to add UI elements to the page here later,
// like a sidebar or highlights, based on background script responses.