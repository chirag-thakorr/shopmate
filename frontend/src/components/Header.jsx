// frontend/src/components/Header.jsx
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cartCount } from '../utils/cart';

export default function Header() {
  const [count, setCount] = useState(cartCount());
  const [username, setUsername] = useState(localStorage.getItem('username') || null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // update cart count and username on location change
    setCount(cartCount());
    setUsername(localStorage.getItem('username') || null);

    function onStorage() {
      // when localStorage changes (from login/logout in other tabs)
      setCount(cartCount());
      setUsername(localStorage.getItem('username') || null);
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [location]);

  function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    // notify other components
    window.dispatchEvent(new Event('storage'));
    // optionally navigate to home
    navigate('/');
  }

  function handleMyOrdersClick(e) {
    const token = localStorage.getItem('access_token');
    if (!token) {
      e.preventDefault();
      navigate('/login');
      return;
    }
    // else allow Link to navigate to /my-orders
  }


  return (
    <header style={{
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'12px 20px', borderBottom:'1px solid #eee', background:'#fafafa'
    }}>
      <Link to="/" style={{textDecoration:'none', color:'#333', fontWeight:700, fontSize:18}}>
        ShopMate
      </Link>

      <nav style={{display:'flex', gap:16, alignItems:'center'}}>
        <Link to="/" style={{textDecoration:'none', color:'#333'}}>Products</Link>

        {/* My Orders always visible */}
        <Link to="/my-orders" onClick={handleMyOrdersClick} style={{textDecoration:'none', color:'#333'}}>
          My Orders
        </Link>

        {username ? (
          <>
            <span style={{color:'#333'}}>Hi, {username}</span>
            <button onClick={logout} style={{padding:'6px 10px', cursor:'pointer'}}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{textDecoration:'none', color:'#333'}}>Login</Link>
            <Link to="/signup" style={{textDecoration:'none', color:'#333'}}>Signup</Link>
            {/* <Link to="/my-orders" style={{textDecoration:'none', color:'#333'}}>My Orders</Link> */}
          </>
        )}

        <Link to="/cart" style={{position:'relative', textDecoration:'none', color:'#333'}}>
          🛒 Cart
          {count > 0 && (
            <span style={{
              marginLeft:8,
              background:'#ff4d4f',
              color:'#fff',
              borderRadius:'50%',
              padding:'2px 8px',
              fontSize:12
            }}>{count}</span>
          )}
        </Link>
      </nav>
    </header>
  );
}
