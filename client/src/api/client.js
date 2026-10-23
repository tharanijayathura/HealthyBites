const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export async function api(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  let data;
  try { data = await response.json(); } catch { data = {}; }
  if (!response.ok) throw new Error(data.message || `Request failed (${response.status})`);
  return data;
}

export const get = path => api(path);
export const post = (path, body) => api(path, { method: 'POST', body: JSON.stringify(body) });
export const put = (path, body) => api(path, { method: 'PUT', body: JSON.stringify(body) });
export const patch = (path, body) => api(path, { method: 'PATCH', body: JSON.stringify(body) });
export const del = path => api(path, { method: 'DELETE' });

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  const response = await fetch(`${API_BASE}/admin/upload-image`, {
    method: 'POST',
    credentials: 'include',
    body: formData
  });
  let data;
  try { data = await response.json(); } catch { data = {}; }
  if (!response.ok) throw new Error(data.message || `Request failed (${response.status})`);
  return data;
}
