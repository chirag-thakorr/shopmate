import React, { useEffect, useState } from 'react';
import { useParams, Link } from "react-router-dom";
import { addToCart } from '../utils/cart';
import { fixMediaUrl } from '../utils/images';


export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetch(`/api/products/${slug}/`)
      .then(res => res.json())
      .then(data => setProduct(data));
  }, [slug]);

  if (!product) return <div style={{padding:20}}>Loading...</div>;

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
              cursor:"pointer",
              marginTop:"10px",
              fontSize:"16px"
            }}
            onClick={() => {
                addToCart(product, 1);
                // dispatch storage event so other tabs/components update
                window.dispatchEvent(new Event('storage'));
                alert("Item added to cart!");
            }}

          >
            Add to Cart
          </button>

        </div>
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
