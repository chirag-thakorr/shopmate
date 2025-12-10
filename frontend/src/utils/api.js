// frontend/src/utils/api.js

// Helper to call API with JWT access token
// - Adds Authorization header automatically
// - If access token expired (401), tries to refresh using refresh_token
// - If refresh fails, logs out user (clears tokens) and returns original 401

async function refreshAccessToken() {
  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) return null;

  try {
    const res = await fetch('/api/token/refresh/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh })
    });

    if (!res.ok) {
      // refresh bhi fail → logout
      console.warn('Refresh token invalid, logging out');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('username');
      localStorage.removeItem('user_email');
      window.dispatchEvent(new Event('storage'));
      return null;
    }

    const data = await res.json();
    localStorage.setItem('access_token', data.access);
    // inform header etc.
    window.dispatchEvent(new Event('storage'));
    return data.access;
  } catch (e) {
    console.error('Error refreshing token', e);
    return null;
  }
}

export async function apiFetch(url, options = {}, _retry = true) {
  let token = localStorage.getItem('access_token');
  let headers = options.headers ? { ...options.headers } : {};

  // Set default Content-Type if body is JSON
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }

  let res = await fetch(url, { ...options, headers });

  // Access token expired / invalid
  if (res.status === 401 && _retry) {
    console.warn('Received 401, trying to refresh token...');
    const newToken = await refreshAccessToken();
    if (!newToken) {
      // refresh failed → user is logged out now
      return res; // original 401
    }

    // Retry original request with new token
    headers = options.headers ? { ...options.headers } : {};
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }
    headers['Authorization'] = 'Bearer ' + newToken;

    res = await fetch(url, { ...options, headers });
    return res;
  }

  return res;
}
