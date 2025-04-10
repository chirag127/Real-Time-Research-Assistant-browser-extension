// Real-Time Research Assistant - Popup Script

const analyzeBtn = document.getElementById('analyzeBtn');
const statusDiv = document.getElementById('status');
const suggestionsList = document.getElementById('suggestionsList');
const savedList = document.getElementById('savedList');

// --- Event Listeners ---

analyzeBtn.addEventListener('click', () => {
    statusDiv.textContent = 'Analyzing page...';
    suggestionsList.innerHTML = ''; // Clear previous suggestions

    // 1. Get current tab info
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) {
            statusDiv.textContent = 'Error: Could not get active tab.';
            return;
        }
        const currentTab = tabs[0];

        // 2. Send message to background script to trigger analysis
        // We could also send a message to content script first to get page data,
        // but let's assume background can handle it via scripting API or other means for now.
        chrome.runtime.sendMessage({ action: "analyzePage", tabId: currentTab.id, url: currentTab.url }, (response) => {
            if (chrome.runtime.lastError) {
                statusDiv.textContent = `Error: ${chrome.runtime.lastError.message}`;
                console.error("Error sending analyzePage message:", chrome.runtime.lastError);
                return;
            }

            console.log("Response from background for analyzePage:", response); // Log the response

            if (response && response.status === "analyzed") {
                // Display topic and potentially summary briefly before fetching suggestions
                let statusText = `Topic: ${response.topic || 'N/A'}.`;
                if (response.summary) {
                    // Keep it short for the status line
                    statusText += ` Summary: ${response.summary.substring(0, 50)}...`;
                }
                statusDiv.textContent = statusText + " Fetching suggestions...";
                // 3. Request suggestions based on the detected topic
                fetchSuggestions(response.topic);
            } else if (response && response.status === "error") {
                 statusDiv.textContent = `Analysis Error: ${response.message || 'Unknown error'}`;
                 suggestionsList.innerHTML = ''; // Clear suggestions on error
            } else {
                statusDiv.textContent = 'Analysis failed or unexpected response.';
                suggestionsList.innerHTML = ''; // Clear suggestions
            }
        });
    });
});

// --- Functions ---

function fetchSuggestions(topic) {
    chrome.runtime.sendMessage({ action: "getSuggestions", topic: topic }, (response) => {
        if (chrome.runtime.lastError) {
            statusDiv.textContent = `Suggestion Error: ${chrome.runtime.lastError.message}`;
            console.error("Error sending getSuggestions message:", chrome.runtime.lastError);
            suggestionsList.innerHTML = '<li>Error loading suggestions.</li>';
            return;
        }

        console.log("Response from background for getSuggestions:", response); // Log the response

        if (response && response.status === "success" && response.suggestions) {
            statusDiv.textContent = 'Suggestions loaded.'; // Keep status concise
            displaySuggestions(response.suggestions);
        } else if (response && response.status === "error") {
            statusDiv.textContent = `Suggestion Error: ${response.message || 'Unknown error'}`;
            suggestionsList.innerHTML = `<li>${response.message || 'Could not load suggestions.'}</li>`;
        }
         else {
            statusDiv.textContent = 'Failed to load suggestions or unexpected response.';
            suggestionsList.innerHTML = '<li>No suggestions available or error occurred.</li>';
        }
    });
}

function displaySuggestions(suggestions) {
    suggestionsList.innerHTML = ''; // Clear previous
    if (suggestions.length === 0) {
        suggestionsList.innerHTML = '<li>No suggestions found.</li>';
        return;
    }
    suggestions.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            <a href="${item.url}" target="_blank">${item.title}</a>
            <button class="save-btn" data-title="${item.title}" data-url="${item.url}" data-summary="${item.summary}">Save</button>
            <p>${item.summary || 'No summary available.'}</p>
        `;
        suggestionsList.appendChild(li);
    });

    // Add event listeners to new save buttons
    document.querySelectorAll('.save-btn').forEach(button => {
        button.addEventListener('click', handleSaveClick);
    });
}

function handleSaveClick(event) {
    const button = event.target;
    const item = {
        title: button.dataset.title,
        url: button.dataset.url,
        summary: button.dataset.summary,
        savedAt: new Date().toISOString() // Add timestamp
    };
    saveItem(item);
    button.textContent = 'Saved!';
    button.disabled = true;
}

function handleRemoveClick(event) {
    const button = event.target;
    const urlToRemove = button.dataset.url;
    removeItem(urlToRemove);
}

function saveItem(item) {
    chrome.storage.local.get({ savedResearchItems: [] }, (result) => {
        const items = result.savedResearchItems;
        // Avoid duplicates based on URL
        if (!items.some(existingItem => existingItem.url === item.url)) {
            items.push(item);
            chrome.storage.local.set({ savedResearchItems: items }, () => {
                console.log('Item saved:', item);
                loadSavedItems(); // Refresh the saved list display
            });
        } else {
            console.log('Item already saved:', item.url);
        }
    });
}

function removeItem(url) {
    chrome.storage.local.get({ savedResearchItems: [] }, (result) => {
        let items = result.savedResearchItems;
        items = items.filter(item => item.url !== url);
        chrome.storage.local.set({ savedResearchItems: items }, () => {
            console.log('Item removed:', url);
            loadSavedItems(); // Refresh the saved list display
        });
    });
}


function loadSavedItems() {
    chrome.storage.local.get({ savedResearchItems: [] }, (result) => {
        savedList.innerHTML = ''; // Clear previous
        const items = result.savedResearchItems;
        if (items.length === 0) {
            savedList.innerHTML = '<li>No items saved yet.</li>';
            return;
        }
        items.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `
                <a href="${item.url}" target="_blank">${item.title}</a>
                <button class="remove-btn" data-url="${item.url}">Remove</button>
                <p>${item.summary || 'No summary.'} (Saved: ${new Date(item.savedAt).toLocaleDateString()})</p>
            `;
            savedList.appendChild(li);
        });

        // Add event listeners to new remove buttons
        document.querySelectorAll('.remove-btn').forEach(button => {
            button.addEventListener('click', handleRemoveClick);
        });
    });
}

// --- Initial Load ---

// Load saved items when the popup opens
document.addEventListener('DOMContentLoaded', loadSavedItems);

statusDiv.textContent = 'Ready. Click "Analyze Current Page" to start.';