/**
 * API SERVICE LAYER
 * Connects Vercel Frontend to Render Backend API Service (and Neon DB).
 * Falls back to local memory state if offline or no backend deployed yet.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function fetchProductsFromBackend() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/products`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.warn('Backend API unavailable, using local client state:', err.message);
    return { success: false, error: err.message };
  }
}

export async function postProductToBackend(productData) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.warn('Backend API save failed, updated locally:', err.message);
    return { success: false, error: err.message };
  }
}

export async function postCheckoutToBackend(checkoutPayload) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checkoutPayload)
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.warn('Backend checkout API failed, processed locally:', err.message);
    return { success: false, error: err.message };
  }
}
