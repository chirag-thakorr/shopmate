// frontend/src/pages/MyOrders.jsx
import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import { Link } from 'react-router-dom';

export default function MyOrders() {
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        setLoading(true);
        const token = localStorage.getItem('access_token');
        // console.log("TOKEN FOUND?", token);

        const res = await apiFetch('/api/orders/my/', {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: 'Bearer ' + token } : {})
          }
        });

        // const res = await apiFetch('/api/orders/my/');
        if (res.status === 401) {
          setErr('Please login to view your orders.');
          setOrders([]);
          setLoading(false);
          return;
        }
        if (!res.ok) {
          const text = await res.text();
          setErr('Failed to load: ' + text);
          // setLoading(false);
          return;
        }
        const data = await res.json();
        // setOrders(data.results || data);
        if (!ignore) setOrders(data.results || data);
      } catch (e) {
        // setErr('Network error');
        if (!ignore) setErr('Network error');
      } finally {
        // setLoading(false);
        if (!ignore) setLoading(false);
      }
    }
    load();
    function onStorage(e) {
      if (e.key === 'last_order_id' || e.key === 'last_order_time') {
        load();
      }
    }
    window.addEventListener('storage', onStorage);

    return () => {
      ignore = true;
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  if (loading) return <div style={{padding:20}}>Loading your orders…</div>;
  if (err) return <div style={{padding:20, color:'red'}}>{err}</div>;
  if (!orders || !orders.length) return <div style={{padding:20}}>You have no orders yet. <Link to="/">Shop now</Link></div>;

  return (
    <div style={{padding:20}}>
      <h2>Your Orders</h2>
      <div style={{display:'grid', gap:12}}>
        {orders.map(o => (
          <div key={o.id} style={{border:'1px solid #eee', padding:12, borderRadius:8}}>
            <div style={{display:'flex', justifyContent:'space-between'}}>
              <div>
                <strong>Order #{o.id}</strong>
                <div style={{color:'#666'}}>{new Date(o.created_at).toLocaleString()}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <p><strong>Delivery to:</strong> {o.full_name} — {o.email}</p>
                <p><strong>Address:</strong> {o.address}</p>
                <div>Total: ₹{o.total_amount}</div>
                <div>Status: {o.paid ? 'Paid' : 'Pending'}</div>
              </div>
            </div>
            <div style={{marginTop:8}}>
              <details>
                <summary>Items ({o.items.length})</summary>
                <ul>
                  {o.items.map(item => (
                    <li key={item.product_id}>
                      {item.product_title} — {item.quantity} × ₹{item.price}
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
