import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import viteConfig from '../vite.config.js';

function config(env, mode = 'production') {
  const keys = ['VITE_API_BASE_URL', 'VITE_API_URL'];
  const saved = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  try {
    for (const key of keys) {
      if (env[key] === undefined) delete process.env[key];
      else process.env[key] = env[key];
    }
    return viteConfig({ mode, command: mode === 'production' ? 'build' : 'serve' });
  } finally {
    for (const key of keys) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
  }
}
const apiBase = env => JSON.parse(config(env).define['import.meta.env.VITE_API_BASE_URL']);

test('production requires an explicit API destination, while local development uses the proxy', () => {
  assert.throws(() => config({}), /VITE_API_BASE_URL/);
  assert.equal(JSON.parse(config({}, 'development').define['import.meta.env.VITE_API_BASE_URL']), '/api');
  assert.equal(apiBase({ VITE_API_BASE_URL: '/api/' }), '/api');
});
test('API configuration normalizes legacy URLs and rejects unusable destinations', () => {
  assert.equal(apiBase({ VITE_API_URL: 'https://backend.example/api/' }), 'https://backend.example/api');
  assert.equal(apiBase({ VITE_API_URL: 'https://backend.example/' }), 'https://backend.example/api');
  assert.equal(apiBase({ VITE_API_BASE_URL: ' https://backend.example/api/ ' }), 'https://backend.example/api');
  for (const value of ['backend.example/api', 'javascript:alert(1)', 'https://user:password@backend.example/api', 'https://backend.example/api?token=secret', 'https://backend.example/api#fragment', '/']) {
    assert.throws(() => apiBase({ VITE_API_BASE_URL: value }), /API/);
  }
});
test('Vercel serves assets before SPA fallback, including direct links to dotted handles', () => {
  const { routes } = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url)));
  assert.equal(routes[0].handle, 'filesystem');
  const fallback = routes.find(route => route.src);
  for (const path of ['/dashboard', '/result/alice.dev', '/result/alice-dev', '/login']) {
    assert.match(path, new RegExp(`^(?:${fallback.src})$`));
    assert.equal(fallback.dest, '/index.html');
  }
});
