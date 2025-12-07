// frontend/src/utils/api.js
export async function apiFetch(url, options = {}) {
  const token = localStorage.getItem('access_token');
  const headers = (options.headers || {});
  // if body present and not FormData, ensure content-type
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }
  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }
  const res = await fetch(url, { ...options, headers });
  return res;
}
