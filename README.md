# Real-Time Research Assistant

An AI-powered browser extension that accelerates your research by detecting topics, suggesting relevant articles, and providing concise summaries in real-time.

---

## ✨ Description

The Real-Time Research Assistant streamlines online research for academics, researchers, and students. It detects topics from your browsing, suggests relevant articles, and provides summaries, saving you valuable time.

---

## 🚀 Live Demo

[View the Landing Page](https://chirag127.github.io/Real-Time-Research-Assistant-browser-extension/)

---

## 🛠️ Tech Stack / Tools Used

- **Frontend:** HTML, CSS, JavaScript, Chrome Extension APIs (Manifest V3)
- **Backend:** Node.js, Express.js
- **AI Integration:** Gemini 2.0 Flash Lite via Google Generative AI API
- **Image Processing:** Sharp
- **Other Libraries:** mime-types, dotenv, cors, fs-extra, nodemon

---

## 📦 Installation Instructions

### Clone the Repository

```bash
git clone https://github.com/chirag127/Real-Time-Research-Assistant-browser-extension.git
cd Real-Time-Research-Assistant-browser-extension
```

### Generate Extension Icons

```bash
npm install sharp fs-extra
node generate-icons.js
```

### Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/` with your Gemini API key:

```
GEMINI_API_KEY=your_api_key_here
```

### Run Backend Server

```bash
nodemon server.js
```

### Load Extension in Browser

- Open your browser's Extensions page.
- Enable Developer Mode.
- Click **Load unpacked**.
- Select the `extension/` folder.

---

## 🔧 Usage

- Browse any webpage.
- The extension detects topics and suggests relevant articles.
- View AI-generated summaries.
- Save important information for later reference.

---

## 🧪 Features

- **Real-Time Topic Detection**
- **Relevant Content Suggestions**
- **AI Summarization**
- **Save Articles & Quotes**
- **Customizable Preferences**
- **Cross-Browser Support (Chrome, Edge, Firefox)**

---

## 📸 Screenshots

_Add screenshots of the extension popup, suggestions, and summaries here._

---

## 🙌 Contributing

Contributions are welcome! Please open issues or pull requests on [GitHub](https://github.com/chirag127/Real-Time-Research-Assistant-browser-extension).

---

## 🪪 License

This project is licensed under the MIT License.

---

© 2025 Chirag Singhal
