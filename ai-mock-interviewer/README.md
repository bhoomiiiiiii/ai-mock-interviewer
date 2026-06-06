# 🤖 AI Mock Interviewer
> Practice smarter. Get hired faster.  
> Built for **Hack The Matrix** | By **Bhoomi Arora**

---

## 🚀 Setup in 5 minutes

### Prerequisites
- Node.js v18+
- Anthropic API key → https://console.anthropic.com

---

### Step 1 — Clone & install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Step 2 — Add your API key

```bash
cd server
cp .env.example .env
# Open .env and paste your ANTHROPIC_API_KEY
```

### Step 3 — Run both servers

Open **two terminals**:

**Terminal 1 (backend):**
```bash
cd server
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 (frontend):**
```bash
cd client
npm run dev
# Runs on http://localhost:5173
```

### Step 4 — Open the app
Go to → **http://localhost:5173**

---

## 📁 Project Structure

```
ai-mock-interviewer/
├── server/
│   ├── index.js          # Express + Claude API
│   ├── .env.example      # Copy to .env and add key
│   └── package.json
└── client/
    ├── src/
    │   ├── App.jsx                         # Screen routing
    │   ├── index.css                       # Global styles
    │   └── components/
    │       ├── SetupScreen.jsx             # Role + JD input
    │       ├── InterviewScreen.jsx         # Chat interview UI
    │       └── FeedbackScreen.jsx          # Scores + report
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## ✨ Features

| Feature | Details |
|---|---|
| 🧠 AI Questions | Personalized to role + JD via Claude API |
| 🎤 Voice Input | Web Speech API — works in Chrome/Edge |
| 📊 Scored Feedback | Communication, Technical, Clarity, Confidence |
| ⚡ Adaptive | Harder follow-ups if answers are strong |
| 📄 PDF Export | Print your feedback report |
| 🎯 Role Presets | SDE, PM, Data Analyst, and more |

---

## 🛠 Tech Stack

- **Frontend:** React + Vite, custom CSS
- **Backend:** Node.js + Express
- **AI:** Anthropic Claude API (claude-sonnet-4)
- **Voice:** Web Speech API (built-in browser)

---

## 🏆 Hack The Matrix — AI & Automation + EdTech
