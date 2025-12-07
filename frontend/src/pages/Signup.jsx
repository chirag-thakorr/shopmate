import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const [username,setUsername] = useState('');
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const navigate = useNavigate();

  async function onSignup(e) {
    e.preventDefault();
    const payload = { username, email, password };
    const res = await fetch('/api/register/', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      alert('Registration success. Please login.');
      localStorage.setItem('user_email', email);
      navigate('/login');
    } else {
      const txt = await res.text();
      alert('Signup failed: ' + txt);
    }
  }

  return (
    <div style={{padding:20}}>
      <h2>Signup</h2>
      <form onSubmit={onSignup} style={{maxWidth:400}}>
        <input placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} style={{width:'100%',padding:8,marginBottom:8}} />
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={{width:'100%',padding:8,marginBottom:8}} />
        <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{width:'100%',padding:8,marginBottom:8}} />
        <button type="submit" style={{padding:10}}>Signup</button>
      </form>
    </div>
  );
}
