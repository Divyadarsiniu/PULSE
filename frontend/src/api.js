const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function fetchWatchlist(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/watchlist/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch watchlist');
    return await response.json();
  } catch (error) { return null; }
}

export async function acknowledgeChanges(userId) {
  await fetch(`${API_BASE_URL}/watchlist/${userId}/acknowledge`, { method: 'POST' });
}

export async function registerUser(name, email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Signup failed');
  return data.user;
}

export async function loginUser(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Login failed');
  return data.user;
}

export async function resetPassword(email, newPassword) {
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, new_password: newPassword }) });
  return await response.json();
}

export async function addStockToWatchlist(userId, ticker) {
  await fetch(`${API_BASE_URL}/watchlist/${userId}/add`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ticker }) });
}

export async function removeStockFromWatchlist(userId, ticker) {
  await fetch(`${API_BASE_URL}/watchlist/${userId}/remove`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ticker }) });
}

export async function fetchPreferences(userId) {
  const response = await fetch(`${API_BASE_URL}/preferences/${userId}`);
  if (!response.ok) return { price_threshold: 3.0, volume_threshold: 2.5, z_score_threshold: 2.0 };
  return await response.json();
}

export async function updatePreferences(userId, prefs) {
  await fetch(`${API_BASE_URL}/preferences/${userId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(prefs) });
}

export async function searchStocks(query) {
  const response = await fetch(`${API_BASE_URL}/stocks/search?q=${query}`);
  if (!response.ok) return [];
  return await response.json();
}

export async function fetchHistory(userId) {
  const response = await fetch(`${API_BASE_URL}/history/${userId}`);
  if (!response.ok) return [];
  return await response.json();
}