const { test } = require('node:test');
const assert = require('node:assert/strict');
const { runtimeConfig } = require('../lib/config');
const production = { NODE_ENV: 'production', SESSION_SECRET: 'test-only-session-secret-at-least-32-characters', FRONTEND_URL: 'https://frontend.example/' };

test('development defaults and normalized origins are consistent', () => {
  assert.equal(runtimeConfig({}).frontendUrl, 'http://localhost:5173');
  assert.equal(runtimeConfig(production).frontendUrl, 'https://frontend.example');
});
test('production fails before serving with missing or invalid frontend origins', () => {
  for (const url of ['', 'http://frontend.example', 'https://frontend.example/path', 'https://frontend.example?query=1', 'https://user:password@frontend.example', 'invalid']) {
    assert.throws(() => runtimeConfig({ ...production, FRONTEND_URL: url }), /FRONTEND_URL/);
  }
});
test('OAuth requires a complete credential pair and an explicit production HTTPS callback origin', () => {
  assert.throws(() => runtimeConfig({ ...production, GITHUB_CLIENT_ID: 'id' }), /both/);
  const oauth = { ...production, GITHUB_CLIENT_ID: 'id', GITHUB_CLIENT_SECRET: 'test-only-placeholder' };
  assert.throws(() => runtimeConfig(oauth), /BACKEND_URL/);
  assert.throws(() => runtimeConfig({ ...oauth, BACKEND_URL: 'http://backend.example' }), /BACKEND_URL/);
  assert.equal(runtimeConfig({ ...oauth, BACKEND_URL: 'https://backend.example/' }).backendUrl, 'https://backend.example');
});
