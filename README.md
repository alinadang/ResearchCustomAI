# Research Custom AI

A modern, interactive research assistant that helps users organize, preview, and analyze documents, enhanced with AI-powered insights.

---

## 🚀 Overview

Research Custom AI combines a sleek React frontend with a Python-based backend to create a seamless research workflow. Users can upload documents, preview content instantly, and leverage AI to generate insights and use cases.

---

## ✨ Features

* 📂 **Document Management** – Upload and organize research files
* 📄 **PDF Previews** – Instant thumbnail rendering of documents
* ⚡ **Real-Time Activity Tracking** – Monitor interactions and workflow
* 🤖 **AI Integration** – Generate insights and use-case suggestions
* 🎨 **Modern UI** – Responsive design built with React and Tailwind

---

## 🛠️ Tech Stack

### Frontend

* React (Vite)
* TypeScript
* Tailwind CSS
* React PDF
* Lucide Icons

### Backend

* Python
* OpenAI / GPT API

---

## 📦 Installation

### 1. Clone the repository

```bash
git clone https://github.com/alinadang/ResearchCustomAI.git
cd ResearchCustomAI
```

---

## ▶️ Running the Project

### Frontend

```bash
npm install
npm run dev
```

App runs at: **http://localhost:5173**

---

### Backend (AI API)

#### 1. Set environment variable

```bash
export API_KEY=your_api_key
```

Windows (PowerShell):

```bash
$env:API_KEY="your_api_key"
```

#### 2. Set up virtual environment

```bash
python -m venv .venv
.venv\Scripts\activate
```

#### 3. Run backend

```bash
python -m app.core.apicall
```

---

## 📂 Project Structure

```
├── src/
│   ├── components/
│   ├── components/tabs/
│   ├── context/
│   └── data/
├── app/
│   └── core/
│       └── apicall.py
```

---

## 🧠 How It Works

1. Upload documents through the UI
2. Preview and organize files instantly
3. Interact with AI to generate insights
4. Track activity and workflow in real time

---

## 🔒 Environment Variables

| Variable | Description    |
| -------- | -------------- |
| API_KEY  | OpenAI API key |

---

## 📌 Future Improvements

* Authentication & user accounts
* Persistent database storage
* Advanced document search
* Improved AI summarization

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

---

## 📄 License

MIT License
