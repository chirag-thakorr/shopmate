// frontend/src/pages/CartPage.jsx
import React, { useEffect, useState } from 'react';
import { getCart, updateQuantity, removeFromCart, cartTotal, clearCart } from '../utils/cart';
import { Link, useNavigate } from 'react-router-dom';

export default function CartPage() {
  const [cart, setCart] = useState(getCart());
  const navigate = useNavigate();

  useEffect(() => {
    setCart(getCart());
  }, []);

  function onQtyChange(id, newQty) {
    const updated = updateQuantity(id, newQty);
    setCart(updated);
  }

  function onRemove(id) {
    const updated = removeFromCart(id);
    setCart(updated);
  }

  function onClear() {
    clearCart();
    setCart([]);
  }

  function onCheckout() {
    // Placeholder for checkout step
    // alert('Checkout - (not implemented). Cart total: ₹' + cartTotal().toFixed(2));
    // Optionally navigate to /checkout later
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Please login before placing an order.');
      navigate('/login');
      return;
    }
    navigate('/checkout');
  }

  if (!cart.length) {
    return (
      <div style={{padding:20}}>
        <h2>Your cart is empty</h2>
        <p><Link to="/">Continue shopping</Link></p>
      </div>
    );
  }

  return (
    <div style={{padding:20}}>
      <h2>Your Cart</h2>
      <div style={{display:'grid', gap:12}}>
        {cart.map(item => (
          <div key={item.id} style={{display:'flex', justifyContent:'space-between', padding:12, border:'1px solid #eee', borderRadius:8}}>
            <div style={{flex:1}}>
              <Link to={`/product/${item.slug}`} style={{textDecoration:'none', color:'#333'}}><strong>{item.title}</strong></Link>
              <div style={{color:'#666'}}>Price: ₹{item.price}</div>
              <div style={{color:'#666'}}>Available: {item.inventory}</div>
            </div>
            <div style={{display:'flex', gap:8, alignItems:'center'}}>
              <input
                type="number"
                min="1"
                max={item.inventory || 9999}
                value={item.quantity}
                onChange={(e) => onQtyChange(item.id, e.target.value)}
                style={{width:70, padding:6}}
              />
              <button onClick={() => onRemove(item.id)} style={{padding:'8px 12px'}}>Remove</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{marginTop:20, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div>
          <button onClick={onClear} style={{padding:'8px 12px', marginRight:8}}>Clear Cart</button>
          <button onClick={() => navigate('/')} style={{padding:'8px 12px'}}>Continue Shopping</button>
        </div>
        <div>
          <strong>Total: ₹{cartTotal().toFixed(2)}</strong>
          <button onClick={onCheckout} style={{marginLeft:12, padding:'10px 14px', background:'#28a745', color:'#fff', border:'none', borderRadius:6}}>Checkout</button>
        </div>
      </div>
    </div>
  );
}
