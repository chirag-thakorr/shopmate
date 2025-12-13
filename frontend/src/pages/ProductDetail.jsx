import React, { useEffect, useState } from 'react';
import { useParams, Link } from "react-router-dom";
import { addToCart } from '../utils/cart';
import { fixMediaUrl } from '../utils/images';
import { apiFetch } from '../utils/api'; 
import { Stars } from '../components/Stars';





export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');

  const isLoggedIn = !!localStorage.getItem('access_token');
  // const outOfStock = !product.inventory || product.inventory <= 0;
  const outOfStock = !product?.inventory;

  
  useEffect(() => {
    // product fetch
    fetch(`/api/products/${slug}/`)
      .then(res => res.json())
      .then(data => setProduct(data));
    // reviews fetch
    fetch(`/api/products/${slug}/reviews/`)
      .then(res => res.json())
      .then(data => setReviews(data))
      .catch(() => setReviews([]))
  }, [slug]);

  if (!product) return <div style={{padding:20}}>Loading...</div>;

  async function addToWishlist() {
    const res = await apiFetch("/api/wishlist/", {
      method: "POST",
      body: JSON.stringify({ product_id: product.id })
    });

    if (res.ok) {
      alert("Added to wishlist!");
    } else {
      alert("Login required!");
    }
  }

  async function submitReview(e) {
    e.preventDefault();
    if (!isLoggedIn) {
      alert('Please login to add a review.');
      return;
    }
    try {
      const res = await apiFetch(`/api/products/${slug}/reviews/`, {
        method: 'POST',
        body: JSON.stringify({
          rating: Number(newRating),
          comment: newComment
        })
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Failed to submit review');
      }
      const newRev = await res.json();
      // update list (top pe add)
      setReviews(prev => [newRev, ...prev.filter(r => r.id !== newRev.id)]);
      setNewComment('');
    } catch (err) {
      alert('Failed: ' + (err.message || err));
    }
  }


  return (
    <div style={{padding:20, fontFamily:"Arial"}}>
      
      <Link to="/" style={{textDecoration:"none", color:"#555"}}>
        ← Back to Products
      </Link>

      <div style={{display:"flex", gap:40, marginTop:20}}>

        {/* Left Side (Image placeholder) */}
        <div style={{
          width: "300px",
          height: "300px",
          background:"#eee",
          borderRadius:"10px",
          overflow:'hidden'
        }}>
          {product.image ? (
          <img
            src={fixMediaUrl(product.image)}
            alt={product.title}
            style={{width:'100%', height:'100%', objectFit:'cover'}}
          />
        ) : (
          <p style={{
            textAlign:"center",
            paddingTop:"130px",
            color:"#999"
          }}>
            No Image
          </p>
        )}
        </div>

        {/* Right Side (Details) */}
        <div style={{maxWidth:"600px"}}>
          <h1 style={{marginBottom:10}}>{product.title}</h1>
          <p style={{color:"#555", marginBottom:20}}>{product.description}</p>

          <h2 style={{color:"#333"}}>₹ {product.price}</h2>

          <p style={{margin:"10px 0", color:"#777"}}>
            Stock Available: {product.inventory}
          </p>

          <button 
            style={{
              padding:"12px 20px",
              border:"none",
              background:"#007bff",
              color:"white",
              borderRadius:"6px",
              cursor: outOfStock ? "not-allowed" : "pointer",
              marginTop:"10px",
              fontSize:"16px"
            }}
            disabled={outOfStock}
            onClick={() => {
                if (outOfStock) return;
                addToCart(product, 1);
                // dispatch storage event so other tabs/components update
                window.dispatchEvent(new Event('storage'));
                alert("Item added to cart!");
            }}

          >
            {outOfStock ? "Out of stock" : "Add to Cart"}
          </button>
          <button onClick={addToWishlist} style={{ padding: 10 }}>
            ❤️ Add to Wishlist
          </button>


        </div>
      </div>
      
      
            {/* Reviews section */}
      <div style={{marginTop:40}}>
        
        
        <h2>Reviews</h2>
        <Stars value={product.average_rating} />

        {product.review_count > 0 ? (
          <p>
            ⭐ {product.average_rating?.toFixed(1)} ({product.review_count} review
            {product.review_count > 1 ? 's' : ''})
          </p>
        ) : (
          <p>No reviews yet.</p>
        )}

        {isLoggedIn ? (
          <form onSubmit={submitReview} style={{marginTop:16, marginBottom:24}}>
            <div style={{marginBottom:8}}>
              <label>Rating: </label>
              <select
                value={newRating}
                onChange={e => setNewRating(e.target.value)}
              >
                <option value={5}>5 - Excellent</option>
                <option value={4}>4 - Good</option>
                <option value={3}>3 - Average</option>
                <option value={2}>2 - Poor</option>
                <option value={1}>1 - Very bad</option>
              </select>
            </div>

            <div style={{marginBottom:8}}>
              <textarea
                placeholder="Write your review…"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                style={{width:'100%', minHeight:80, padding:8}}
              />
            </div>

            <button type="submit" style={{padding:'8px 12px'}}>
              Submit Review
            </button>
          </form>
        ) : (
          <p><Link to="/login">Login</Link> to write a review.</p>
        )}

        {reviews.length === 0 ? (
          <p>No reviews to show.</p>
        ) : (
          <div style={{marginTop:12}}>
            {reviews.map(r => (
              <div key={r.id} style={{borderTop:'1px solid #eee', paddingTop:8, marginTop:8}}>
                <div>
                  <strong>{r.user_name}</strong>{' '}
                  <span>– ⭐ {r.rating}</span>
                </div>
                <div style={{color:'#555'}}>{r.comment}</div>
                <div style={{fontSize:12, color:'#999'}}>
                  {new Date(r.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

// ---- CART SYSTEM ----
// function addToCart(product) {
//   let cart = JSON.parse(localStorage.getItem("cart") || "[]");

//   let existing = cart.find(item => item.id === product.id);

//   if (existing) {
//     existing.quantity += 1;
//   } else {
//     cart.push({ ...product, quantity: 1 });
//   }
  
//   localStorage.setItem("cart", JSON.stringify(cart));
// }
