// frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { apiFetch } from '../utils/api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  async function onLogin(e) {
    e.preventDefault();

    try {
      const res = await fetch('/api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Login failed');
      }

      const data = await res.json();
      // console.log(data,'<<<---JSON OBJECT WITH THE RESPONSE---->>>>')

      // Save tokens
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);

      // IMPORTANT: save the username so Header can show it
      // Here `username` is the variable bound to the input field
      localStorage.setItem('username', username);
      // localStorage.setItem('user_email', email);

      // 2) ab /api/me/ se user details lo (email yahi se)
      // const meRes = await apiFetch('/api/me/');
      // if (!meRes.ok) {
      //   const txt = await meRes.text();
      //   console.error('Failed to fetch /api/me/:', txt);
      //   localStorage.setItem('username', username);
      // } else {
      //   const me = await meRes.json();
      //   localStorage.setItem('username', me.username);
      //   localStorage.setItem('user_email', me.email || '');
      // }

      // notify other components (Header) to re-read storage
      window.dispatchEvent(new Event('storage'));

      // navigate home or wherever
      navigate('/');
    } catch (err) {
      alert('Login error: ' + (err.message || err));
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Login</h2>
      <form onSubmit={onLogin} style={{ maxWidth: 420 }}>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: '100%', padding: 8, marginBottom: 8 }}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: 8, marginBottom: 8 }}
        />
        <button type="submit" style={{ padding: 10 }}>Login</button>
      </form>
    </div>
  );
}
