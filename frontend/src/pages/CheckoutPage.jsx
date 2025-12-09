// frontend/src/pages/CheckoutPage.jsx
import React, { useState, useEffect } from 'react';
import { getCart, cartTotal, clearCart } from '../utils/cart';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';



export default function CheckoutPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  // const [fullName, setFullName] = useState(localStorage.getItem('username') || '');
  // const [email, setEmail] = useState(localStorage.getItem('user_email') || ''); 
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const cart = getCart();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      // direct redirect to login if not logged in
      navigate('/login');
    }
  }, [navigate]);

  // if (!cart.length) {
  //   return (
  //     <div style={{padding:20}}>
  //       <h2>Your cart is empty</h2>
  //     </div>
  //   );
  // }

  async function placeOrder() {
    if (!fullName || !email || !address) {
      alert('Please provide your name, email and address for the order.');
      return;
    }
    if (!cart.length) {
      alert('Cart khali hai.');
      return;
    }
    // setLoading(true);
    // const cart = getCart();
    // if (!cart.length) {
    //   alert('Cart is empty');
    //   setLoading(false);
    //   return;
    // }
    const payload = {
      full_name: fullName,
      email,
      address,
      items: cart.map(i => ({
        product_id: i.id,
        product_title: i.title,
        price: i.price,
        quantity: i.quantity
      }))
    };
    try {
      setLoading(true);
      const res = await apiFetch('/api/orders/', {
        method: 'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });
      // if (!res.ok) {
      //   const text = await res.text();
      //   throw new Error(text || 'Order failed');
      // }
      if (!res.ok) {
        const txt = await res.text();
        let msg = 'Order failed';
        try {
          const data = JSON.parse(txt);
          if (typeof data === 'string') msg = data;
          else if (data.detail) msg = data.detail;
          else if (Array.isArray(data.non_field_errors)) msg = data.non_field_errors.join(', ');
        } catch {
          msg = txt || msg;
        }
        throw new Error(msg);
      }

      const data = await res.json();

      // // Save last order id to localStorage so other pages can react
      // localStorage.setItem('last_order_id', String(data.id));
      // // Also optionally store last_order_time for more info
      // localStorage.setItem('last_order_time', new Date().toISOString());
      // // Dispatch storage event so other tabs/components (MyOrders) can listen
      // window.dispatchEvent(new Event('storage'));

      // clear cart and navigate to success page
      clearCart();
      window.dispatchEvent(new Event('storage'));

      navigate(`/order-success/${data.id}`);
    } catch (err) {
      alert('Order failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div style={{padding:20}}>
      <h2>Checkout</h2>
      <div style={{maxWidth:600}}>
        <div style={{marginBottom:12}}>
          <label>Full name</label><br />
          <input value={fullName} onChange={e=>setFullName(e.target.value)} style={{width:'100%',padding:8}} />
        </div>
        <div style={{marginBottom:12}}>
          <label>Email</label><br />
          <input value={email} onChange={e=>setEmail(e.target.value)} style={{width:'100%',padding:8}} />
        </div>
        <div style={{marginBottom:12}}>
          <label>Address</label><br />
          <textarea value={address} onChange={e=>setAddress(e.target.value)} style={{width:'100%',padding:8}} />
        </div>

        <div style={{marginTop:12}}>
          <strong>Order total: ₹{cartTotal().toFixed(2)}</strong>
        </div>

        <div style={{marginTop:16}}>
          <button onClick={placeOrder} disabled={loading} style={{padding:'10px 14px', background:'#007bff', color:'#fff', border:'none', borderRadius:6}}>
            {loading ? 'Placing order...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
}
