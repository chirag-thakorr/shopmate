// frontend/src/utils/images.js
export function fixMediaUrl(url) {
  if (!url) return null;

  // Dev environment: backend container ka host -> browser ka host
  const backendBase = 'http://backend:8000';
  const localBase = 'http://localhost:8000';

  if (url.startsWith(backendBase)) {
    return url.replace(backendBase, localBase);
  }

  return url;
}
