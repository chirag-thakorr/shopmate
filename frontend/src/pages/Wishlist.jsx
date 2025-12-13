import React, { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import { Link } from "react-router-dom";

export default function Wishlist() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await apiFetch("/api/wishlist/");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    }
    load();
  }, []);

  async function removeItem(id) {
    await apiFetch(`/api/wishlist/${id}/`, { method: "DELETE" });
    setItems(items.filter((i) => i.id !== id));
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>My Wishlist</h2>

      {items.length === 0 && <p>No items in wishlist.</p>}

      {items.map((w) => (
        <div key={w.id} style={{ border: "1px solid #ddd", padding: 12, marginBottom: 8 }}>
          <Link to={`/product/${w.product.slug}`}>
            <h3>{w.product.title}</h3>
          </Link>
          <button onClick={() => removeItem(w.id)}>Remove</button>
        </div>
      ))}
    </div>
  );
}
