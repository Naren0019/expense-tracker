import React, { useState } from 'react';
import api from '../api.js';
export default function Login({ onLogin }) {
 const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState('');
 async function submit(e) { e.preventDefault(); setError(''); try { const { data } = await api.post('/login', { email, password }); onLogin(data.access_token); } catch (err) { setError(err.response?.data?.error || 'Unable to log in.'); } }
 return <form onSubmit={submit}><h2>Welcome back</h2><label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Password<input type="password" required value={password} onChange={e=>setPassword(e.target.value)}/></label>{error && <p className="error" role="alert">{error}</p>}<button type="submit">Log in</button></form>;
}
