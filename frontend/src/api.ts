import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL?.trim();

// In dev, use '/api' so Vite's proxy handles CORS.
// In production, use VITE_API_URL if provided, otherwise same-origin '/api'.
const baseURL =
  import.meta.env.PROD && rawApiUrl
    ? `${rawApiUrl.replace(/\/+$/, '').replace(/\/api$/, '')}/api`
    : '/api';

export const api = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
  },
});
