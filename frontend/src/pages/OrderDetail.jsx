// frontend/src/pages/OrderDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      setLoading(true);
      setErr(null);
      try {
        const res = await apiFetch(`/api/orders/${id}/`);
        if (res.status === 401) {
          // not auth -> go to login
          navigate('/login');
          return;
        }
        if (!res.ok) {
          const text = await res.text();
          setErr('Failed to load order: ' + text);
          return;
        }
        const data = await res.json();
        setOrder(data);
      } catch (e) {
        setErr('Network error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, navigate]);

  if (loading) return <div style={{padding:20}}>Loading order…</div>;
  if (err) return <div style={{padding:20, color:'red'}}>{err}</div>;
  if (!order) return <div style={{padding:20}}>Order not found</div>;

  return (
    <div style={{padding:20}}>
      <Link to="/my-orders">← Back to My Orders</Link>
      <h2>Order #{order.id}</h2>
      <div style={{marginBottom:8}}>Date: {new Date(order.created_at).toLocaleString()}</div>
      <div style={{marginBottom:8}}>Total: ₹{order.total_amount}</div>
      <div style={{marginBottom:8}}>Status: {order.paid ? 'Paid' : 'Pending'}</div>

      <div style={{marginTop:16, padding:12, border:'1px solid #eee', borderRadius:8}}>
        <h4>Delivery</h4>
        <div><strong>Name:</strong> {order.full_name || '—'}</div>
        <div><strong>Email:</strong> {order.email || '—'}</div>
        <div><strong>Address:</strong> {order.address || '—'}</div>
      </div>

      <div style={{marginTop:16}}>
        <h4>Items</h4>
        <ul>
          {order.items.map(it => (
            <li key={it.product_id} style={{marginBottom:8}}>
              <div><strong>{it.product_title}</strong></div>
              <div>Qty: {it.quantity} × ₹{it.price}</div>
              <div>Subtotal: ₹{(parseFloat(it.price) * it.quantity).toFixed(2)}</div>
            </li>
          ))}
        </ul>
      </div>

      <div style={{marginTop:20}}>
        <button onClick={() => navigate('/')} style={{padding:'8px 12px', marginRight:8}}>Continue shopping</button>
        {/* optional: Cancel order - show only if not paid */}
        {!order.paid && (
          <button onClick={async () => {
            if (!window.confirm('Cancel this order?')) return;
            try {
              const res = await apiFetch(`/api/orders/${order.id}/`, { method: 'DELETE' });
              if (res.status === 204 || res.ok) {
                alert('Order cancelled');
                navigate('/my-orders');
              } else {
                alert('Could not cancel order');
              }
            } catch (e) {
              alert('Network error');
            }
          }} style={{padding:'8px 12px'}}>Cancel Order</button>
        )}
      </div>
    </div>
  );
}
