// Real-Time Research Assistant - Backend Server
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// --- Configuration ---
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error("Error: GEMINI_API_KEY is not defined in the .env file.");
    // process.exit(1); // Optionally exit if the key is crucial for startup
}

// --- Initialize App ---
const app = express();

// --- Initialize Gemini ---
// Initialize the Generative AI model only if the API key is available
let genAI;
let model;
if (GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    // Using gemini-pro for now, adjust model name as needed (e.g., 'gemini-1.5-flash-latest')
    model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    console.log("Gemini AI initialized.");
} else {
    console.warn("Gemini AI not initialized due to missing API key.");
}


// --- Helper Function ---
function cleanGeminiResponse(text) {
  let cleanedText = text.trim();
  // Remove ```json ... ```
  if (cleanedText.startsWith('```json') && cleanedText.endsWith('```')) {
    cleanedText = cleanedText.substring(7, cleanedText.length - 3).trim();
  }
  // Remove ``` ... ``` (fallback)
  else if (cleanedText.startsWith('```') && cleanedText.endsWith('```')) {
     cleanedText = cleanedText.substring(3, cleanedText.length - 3).trim();
  }
  return cleanedText;
}

// --- Middleware ---
app.use(cors()); // Enable Cross-Origin Resource Sharing for requests from the extension
app.use(express.json()); // Parse JSON request bodies

// --- Routes ---

// Basic test route
app.get('/', (req, res) => {
    res.send('Real-Time Research Assistant Backend is running!');
});

// Placeholder: Analyze page content to detect topic
app.post('/analyze', async (req, res) => {
    console.log("Received /analyze request");
    const { content, url } = req.body;

    if (!content) {
        return res.status(400).json({ error: 'Content is required for analysis.' });
    }
    if (!model) {
         console.warn("/analyze endpoint called but Gemini is not initialized.");
         // Simulate response if Gemini isn't ready
         return res.json({ topic: "Topic (Simulated - No AI Key)", summary: "Summary (Simulated - No AI Key)" });
    }

    try {
        // Simple prompt for topic detection (can be refined)
        const prompt = `Analyze the following text content from the URL ${url || 'unknown'} and identify the main research topic. Also provide a very brief one-sentence summary.\n\nContent:\n${content.substring(0, 4000)}\n\nRespond in JSON format with keys "topic" and "summary". Example: {"topic": "Climate Change Impacts", "summary": "The text discusses the various impacts of climate change on ecosystems."}`;

        console.log("Sending request to Gemini...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log("Gemini response received:", text);

        // Clean and attempt to parse the JSON response from Gemini
        const cleanedText = cleanGeminiResponse(text);
        try {
            const parsedResult = JSON.parse(cleanedText);
            res.json({
                topic: parsedResult.topic || "Could not determine topic",
                summary: parsedResult.summary || "Could not generate summary"
            });
        } catch (parseError) {
            console.error("Error parsing cleaned Gemini response:", parseError, "Original text:", text);
            // Fallback if JSON parsing fails even after cleaning
             res.json({ topic: "Topic (Processing Error)", summary: "Could not parse AI response." });
        }

    } catch (error) {
        console.error("Error during Gemini API call:", error);
        res.status(500).json({ error: 'Failed to analyze content using AI.' });
    }
});

// Placeholder: Get suggestions based on a topic
app.post('/suggestions', async (req, res) => {
    console.log("Received /suggestions request");
    const { topic } = req.body;

    if (!topic) {
        return res.status(400).json({ error: 'Topic is required to get suggestions.' });
    }
     if (!model) {
         console.warn("/suggestions endpoint called but Gemini is not initialized.");
         // Simulate response if Gemini isn't ready
         return res.json({ suggestions: [
             { title: "Simulated Article 1", url: "#", summary: "This is a simulated summary." },
             { title: "Simulated Paper A", url: "#", summary: "Another simulated summary." }
         ]});
    }

    try {
        // Simple prompt for suggestions (can be greatly improved, e.g., web search integration)
        const prompt = `Based on the research topic "${topic}", suggest 3 relevant academic articles or reputable web resources. Provide the title, a plausible URL (can be placeholder like # if unknown), and a brief summary for each.\n\nRespond in JSON format with a key "suggestions" containing an array of objects, each with "title", "url", and "summary". Example: {"suggestions": [{"title": "...", "url": "...", "summary": "..."}]}`;

        console.log("Sending request to Gemini for suggestions...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log("Gemini suggestions response received:", text);

         // Clean and attempt to parse the JSON response from Gemini
         const cleanedText = cleanGeminiResponse(text);
        try {
            const parsedResult = JSON.parse(cleanedText);
            res.json({
                suggestions: parsedResult.suggestions || []
            });
        } catch (parseError) {
            console.error("Error parsing cleaned Gemini suggestions response:", parseError, "Original text:", text);
            // Fallback if JSON parsing fails even after cleaning
             res.json({ suggestions: [{title: "Suggestion Error", url: "#", summary: "Could not parse AI response."}] });
        }

    } catch (error) {
        console.error("Error during Gemini API call for suggestions:", error);
        res.status(500).json({ error: 'Failed to get suggestions using AI.' });
    }
});


// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    if (!GEMINI_API_KEY) {
        console.warn("Reminder: Server started without a GEMINI_API_KEY. AI features will be simulated or disabled.");
    }
});