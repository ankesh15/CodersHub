import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

function apiDestination(env, building) {
  let value = (env.VITE_API_BASE_URL || '').trim();
  if (!value && env.VITE_API_URL?.trim()) {
    value = env.VITE_API_URL.trim().replace(/\/+$/, '');
    if (!value.endsWith('/api')) value += '/api';
  }
  if (!value) {
    if (building) throw new Error('Set VITE_API_BASE_URL to the backend URL including /api, or explicitly to /api when a production reverse proxy is configured.');
    return '/api';
  }
  value = value.replace(/\/+$/, '');
  if (value === '/api') return value;
  let url;
  try { url = new URL(value); } catch { throw new Error('API URL must be an absolute HTTP(S) URL including /api, or /api for a reverse proxy.'); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash || url.pathname === '/') {
    throw new Error('API URL must use HTTP(S), include its API path, and contain no credentials, query or fragment.');
  }
  return value;
}

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiBaseUrl = apiDestination(env, command === 'build');
  return {
    plugins: [react()],
    server: { proxy: { '/api': { target: env.API_PROXY_TARGET || 'http://localhost:5000', changeOrigin: true } } },
    define: { 'import.meta.env.VITE_API_BASE_URL': JSON.stringify(apiBaseUrl) },
  };
});
