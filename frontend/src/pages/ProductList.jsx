// frontend/src/pages/ProductList.jsx
import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { fixMediaUrl } from '../utils/images';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(''); // slug
  const [search, setSearch] = useState('');
  const [typingSearch, setTypingSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // load categories once
  useEffect(() => {
    fetch('/api/categories/')
      .then(res => res.json())
      .then(data => setCategories(data.results || data))
      .catch(err => console.error('Failed to load categories', err));
  }, []);

  // load products whenever filters change
  useEffect(() => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (selectedCategory) params.append('category', selectedCategory);
    if (search) params.append('search', search);

    const url = '/api/products/' + (params.toString() ? `?${params.toString()}` : '');

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error('Network not ok');
        return res.json();
      })
      .then(data => {
        const list = data.results || data;
        setProducts(list);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load products', err);
        setError(err.message || 'Failed to load');
        setLoading(false);
      });
  }, [selectedCategory, search]);

  // small debounced search (user types -> wait 400ms)
  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(typingSearch);
    }, 400);
    return () => clearTimeout(id);
  }, [typingSearch]);

  if (loading) return <div style={{padding:20}}>Loading products…</div>;
  if (error) return <div style={{padding:20, color:'red'}}>Error: {error}</div>;
  // if (!products.length) return <div style={{padding:20}}>No products found.</div>;

  return (
    <div style={{padding:20, fontFamily: 'Arial, sans-serif'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
        <h1 style={{margin:0}}>Products</h1>

        {/* Search box */}
        <input
          type="search"
          placeholder="Search products…"
          value={typingSearch}
          onChange={e => setTypingSearch(e.target.value)}
          style={{padding:8, minWidth:200}}
        />
      </div>

      {/* Category filter bar */}
      <div style={{marginBottom:16, display:'flex', gap:8, flexWrap:'wrap'}}>
        <button
          onClick={() => setSelectedCategory('')}
          style={{
            padding:'6px 10px',
            borderRadius:16,
            border: selectedCategory === '' ? '2px solid #007bff' : '1px solid #ddd',
            background: selectedCategory === '' ? '#e6f0ff' : '#fff',
            cursor:'pointer'
          }}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.slug)}
            style={{
              padding:'6px 10px',
              borderRadius:16,
              border: selectedCategory === cat.slug ? '2px solid #007bff' : '1px solid #ddd',
              background: selectedCategory === cat.slug ? '#e6f0ff' : '#fff',
              cursor:'pointer'
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      

      {/* Product grid */}
      <div style={{
        display:'grid',
        gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',
        gap:16
      }}>
        {!loading && !error && products.length === 0 && (
          <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',
          gap:16,
          marginTop:16,
        }}>
            No products found.
          </div>
        )}
        {products.map(p => (
          <Link
            to={`/product/${p.slug}`}
            key={p.id}
            style={{textDecoration:'none', color:'inherit'}}
          >
            <div style={{border:'1px solid #e6e6e6', padding:12, borderRadius:8, background:'#fff'}}>
              {p.image && (
                <div style={{marginBottom:8}}>
                  <img
                    src={fixMediaUrl(p.image)}
                    alt={p.title}
                    style={{width:'100%', height:160, objectFit:'cover', borderRadius:6}}
                  />
                </div>
              )}
              <h3 style={{margin:'0 0 8px 0'}}>{p.title}</h3>
              <p style={{margin:'0 0 8px 0', color:'#444'}}>
                {p.description ? p.description.slice(0,120) : 'No description'}
              </p>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <strong>₹{p.price}</strong>
                <small style={{color:'#666'}}>{p.inventory} in stock</small>
              </div>
              {p.category && (
                <div style={{marginTop:6}}>
                  <small style={{padding:'2px 6px', borderRadius:10, border:'1px solid #ddd'}}>
                    {p.category.name}
                  </small>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
