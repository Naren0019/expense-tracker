import React, { useState } from 'react';
import api from '../api.js';
export default function Register({ onRegistered }) {
 const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState('');
 async function submit(e) { e.preventDefault(); setError(''); try { await api.post('/register', { name, email, password }); onRegistered(); } catch (err) { setError(err.response?.data?.error || 'Unable to register.'); } }
 return <form onSubmit={submit}><h2>Create account</h2><label>Name<input required value={name} onChange={e=>setName(e.target.value)}/></label><label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Password (8+ characters)<input type="password" minLength="8" required value={password} onChange={e=>setPassword(e.target.value)}/></label>{error && <p className="error" role="alert">{error}</p>}<button type="submit">Register</button></form>;
}
