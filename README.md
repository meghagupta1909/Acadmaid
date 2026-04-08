# 🎓 AcadMaid – Full Stack Learning Platform

**AcadMaid** is a web application for personalized learning, built with **React.js** (frontend) and **FastAPI** (backend).
---
## 🗂️ Project Structure

```
acadmaid/
├── backend/      # FastAPI backend
├── frontend/     # React frontend
└── README.md
```

---

## ⚙️ Setup

### Backend

```bash
cd backend
python -m venv venv      # create virtual environment
source venv/bin/activate # activate (Mac/Linux)
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend runs at: `http://localhost:8000`

### Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs at: `http://localhost:3000`

> Make sure the backend is running before starting the frontend.

---

## 🔑 Features

* User signup/login with JWT authentication
* Save learning preferences
* Get recommended videos for your subjects
* Track your learning progress
* Generate personalized study plans

---

## 🛠️ Technologies

* **Frontend:** React.js, React Router
* **Backend:** FastAPI, SQLAlchemy, SQLite
* **Authentication:** JWT, bcrypt
* **HTTP Client:** Axios

---
