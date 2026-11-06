# Expense Tracker — React + Flask + MongoDB

## Requirements
- Node.js 18+ and npm
- Python 3.10+
- MongoDB Community Server running locally, or MongoDB Atlas

## 1. Start MongoDB
Start your local MongoDB service (default port 27017), or set `MONGO_URI` to your Atlas connection string.

## 2. Start backend
```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
```
Copy `.env.example` to `.env` and replace `JWT_SECRET_KEY` with a long random secret. Then:
```bash
python app.py
```
Backend runs at http://localhost:5000.

## 3. Start frontend (separate terminal)
```bash
cd frontend
npm install
```
Optionally copy `.env.example` to `.env`. Then:
```bash
npm run dev
```
Open http://localhost:5173, register, log in, and add transactions.

## API
- POST `/api/register` with `{name,email,password}`
- POST `/api/login` with `{email,password}` returns `{access_token,name}`
- GET `/api/transactions` with `Authorization: Bearer <token>`
- POST `/api/transactions` with `{type,amount,category,description,date}` and bearer token
- DELETE `/api/transactions/<id>` with bearer token
- GET `/api/summary` with bearer token

## Database
MongoDB database `expense_tracker` has `users` and `transactions` collections. Transaction amounts use Decimal128; all transaction reads/deletes are scoped to the authenticated user.

## Notes
This is a learning project. For production, use HTTPS, hardened JWT/session handling (such as secure HttpOnly cookies and CSRF protection), rate limiting, pagination, stricter email validation, environment-specific CORS, and deployment-safe Flask configuration. Do not run the Flask debug server in production.
