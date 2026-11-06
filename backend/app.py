import os
from datetime import date
from decimal import Decimal, InvalidOperation
from bson import ObjectId, Decimal128
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, get_jwt_identity, jwt_required
from pymongo import MongoClient, DESCENDING
from pymongo.errors import DuplicateKeyError
from werkzeug.security import generate_password_hash, check_password_hash

load_dotenv()
app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'development-only-change-me')
CORS(app, origins=[os.getenv('FRONTEND_ORIGIN', 'http://localhost:5173')])
JWTManager(app)
client = MongoClient(os.getenv('MONGO_URI', 'mongodb://localhost:27017/'), serverSelectionTimeoutMS=5000)
db = client['expense_tracker']
users = db.users
transactions = db.transactions
users.create_index('email', unique=True)
transactions.create_index([('user_id', 1), ('date', DESCENDING)])

def error(message, status=400):
    return jsonify({'error': message}), status

def user_object_id():
    return ObjectId(get_jwt_identity())

def serialize(t):
    return {'id': str(t['_id']), 'type': t['type'], 'amount': str(t['amount'].to_decimal()), 'category': t['category'], 'description': t.get('description', ''), 'date': t['date']}

@app.post('/api/register')
def register():
    data = request.get_json(silent=True) or {}
    name = str(data.get('name', '')).strip()
    email = str(data.get('email', '')).strip().lower()
    password = str(data.get('password', ''))
    if not name or '@' not in email or len(password) < 8:
        return error('Provide a name, valid email, and password of at least 8 characters.')
    try:
        result = users.insert_one({'name': name, 'email': email, 'password_hash': generate_password_hash(password)})
    except DuplicateKeyError:
        return error('Email is already registered.', 409)
    return jsonify({'message': 'Registered successfully', 'id': str(result.inserted_id)}), 201

@app.post('/api/login')
def login():
    data = request.get_json(silent=True) or {}
    user = users.find_one({'email': str(data.get('email', '')).strip().lower()})
    if not user or not check_password_hash(user['password_hash'], str(data.get('password', ''))):
        return error('Invalid email or password.', 401)
    return jsonify({'access_token': create_access_token(identity=str(user['_id'])), 'name': user['name']})

@app.get('/api/transactions')
@jwt_required()
def list_transactions():
    docs = transactions.find({'user_id': user_object_id()}).sort([('date', DESCENDING), ('_id', DESCENDING)])
    return jsonify([serialize(t) for t in docs])

@app.post('/api/transactions')
@jwt_required()
def add_transaction():
    data = request.get_json(silent=True) or {}
    kind = data.get('type')
    category = str(data.get('category', '')).strip()
    description = str(data.get('description', '')).strip()
    day = str(data.get('date', ''))
    try:
        amount = Decimal(str(data.get('amount', '')))
        if not amount.is_finite() or amount <= 0 or amount.as_tuple().exponent < -2 or amount > Decimal('999999999999'):
            raise ValueError()
        date.fromisoformat(day)
    except (InvalidOperation, ValueError, TypeError):
        return error('Provide a positive amount (up to 2 decimals) and valid ISO date.')
    if kind not in ('income', 'expense') or not category or len(category) > 60 or len(description) > 250:
        return error('Invalid type, category, or description.')
    document = {'user_id': user_object_id(), 'type': kind, 'amount': Decimal128(amount), 'category': category, 'description': description, 'date': day}
    result = transactions.insert_one(document)
    document['_id'] = result.inserted_id
    return jsonify(serialize(document)), 201

@app.delete('/api/transactions/<transaction_id>')
@jwt_required()
def delete_transaction(transaction_id):
    if not ObjectId.is_valid(transaction_id):
        return error('Invalid transaction ID.')
    result = transactions.delete_one({'_id': ObjectId(transaction_id), 'user_id': user_object_id()})
    if result.deleted_count == 0:
        return error('Transaction not found.', 404)
    return jsonify({'message': 'Deleted'})

@app.get('/api/summary')
@jwt_required()
def summary():
    income = Decimal('0')
    expense = Decimal('0')
    by_category = {}
    for t in transactions.find({'user_id': user_object_id()}):
        amount = t['amount'].to_decimal()
        if t['type'] == 'income':
            income += amount
        else:
            expense += amount
            by_category[t['category']] = by_category.get(t['category'], Decimal('0')) + amount
    return jsonify({'income': str(income), 'expense': str(expense), 'balance': str(income-expense), 'categories': [{'name': k, 'value': float(v)} for k, v in sorted(by_category.items())]})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
