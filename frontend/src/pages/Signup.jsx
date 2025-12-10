import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const [username,setUsername] = useState('');
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const navigate = useNavigate();
  const [role, setRole] = useState('customer');


  async function onSignup(e) {
    e.preventDefault();
    const payload = { username, email, password, role };
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
        <div style={{marginBottom:8}}>
          <label>
            <input
              type="radio"
              value="customer"
              checked={role === 'customer'}
              onChange={() => setRole('customer')}
            /> Customer
          </label>
          <label style={{marginLeft:12}}>
            <input
              type="radio"
              value="seller"
              checked={role === 'seller'}
              onChange={() => setRole('seller')}
            /> Seller
          </label>
        </div>

        <input placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} style={{width:'100%',padding:8,marginBottom:8}} />
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={{width:'100%',padding:8,marginBottom:8}} />
        <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{width:'100%',padding:8,marginBottom:8}} />
        <button type="submit" style={{padding:10}}>Signup</button>
      </form>
    </div>
  );
}
