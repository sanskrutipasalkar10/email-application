# Inbox IQ: AI Supply Chain Chief of Staff 📧🚀

**Inbox IQ** is an intelligent email management system designed for supply chain professionals. It acts as a "Chief of Staff" for your inbox, using local LLMs (via Ollama) to categorize emails, assess risks, and draft professional responses automatically.

## 🌟 The Problem
Supply chain managers are overwhelmed by hundreds of emails daily—ranging from critical manufacturing delays and customs holds to routine inventory updates and spam. Identifying high-risk issues manually is slow and prone to error.

## 💡 The Solution: Inbox IQ
Inbox IQ leverages **FastAPI**, **React**, and **Ollama** to provide:
- **Instant Analysis**: Automated risk-scoring (0-10) for every incoming email.
- **Structural Categorization**: Automatically groups emails into Logistics, Procurement, Manufacturing, Quality, etc.
- **AI-Drafted Replies**: Generate concise, professional replies based on recommended actions with a single click.
- **Contextual Chat**: Ask questions about your entire inbox ("Which shipments are delayed?") using RAG-lite techniques.
- **Privacy First**: Runs completely locally using Ollama—no sensitive email data leaves your infrastructure.

## 🛠️ Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons.
- **Backend**: FastAPI (Python), Uvicorn.
- **AI Engine**: Ollama (Supporting Qwen 2.5/3 Coder and VL models).
- **Security**: Environment-based configuration, CORS protection.

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js & npm
- [Ollama](https://ollama.ai/) installed and running.

### Backend Setup
1. Navigate to the `backend` directory.
2. Create a virtual environment: `python -m venv venv`.
3. Activate the environment: `.\venv\Scripts\activate` (Windows).
4. Install dependencies: `pip install -r requirements.txt`.
5. Run the server: `python app.py`.

### Frontend Setup
1. Navigate to the `frontend` directory.
2. Install dependencies: `npm install`.
3. Start the dev server: `npm run dev`.

## 📁 Repository Structure
```text
inbox-iq-product/
├── backend/            # FastAPI Server & AI Logic
│   ├── app.py          # Main API endpoints
│   └── requirements.txt
└── frontend/           # React + Tailwind Dashboard
    ├── src/
    └── package.json
```

## 🔒 Security Note
Sensitive files such as `service_account.json` and `.env` are excluded from this repository via `.gitignore` for security purposes. Please ensure you configure your local environment variables before running.

---
*Developed for intelligent supply chain operations.*
