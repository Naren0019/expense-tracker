import React, { useState } from 'react';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
export default function App() {
  const [token, setToken] = useState(sessionStorage.getItem('token'));
  const [mode, setMode] = useState('login');
  function onLogin(value) { sessionStorage.setItem('token', value); setToken(value); }
  function logout() { sessionStorage.removeItem('token'); setToken(null); }
  if (token) return <Dashboard logout={logout} />;
  return <main className="auth-wrap"><div className="auth-card"><h1>💸 Expense Tracker</h1>{mode === 'login' ? <Login onLogin={onLogin} /> : <Register onRegistered={() => setMode('login')} />}<button className="link" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Create an account' : 'Already have an account? Log in'}</button></div></main>;
}
