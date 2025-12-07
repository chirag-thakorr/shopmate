// frontend/src/pages/OrderSuccess.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    fetch(`/api/orders/${id}/`)
      .then(res => res.json())
      .then(data => setOrder(data))
      .catch(()=>setOrder(null));
  }, [id]);

  if (order === null) return <div style={{padding:20}}>Loading...</div>;

  return (
    <div style={{padding:20}}>
      <h2>Thank you for your order!</h2>
      <p>Order ID: <strong>{order.id}</strong></p>
      <p>Total: ₹{order.total_amount}</p>
      <p>We have sent a confirmation to: {order.email}</p>
      <p><Link to="/">Back to shopping</Link></p>
    </div>
  );
}
