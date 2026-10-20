const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { verifyDeployment } = require('../verification/deployment');

test('deployment checks distinguish working hosts from observed production failures without writes', async t => {
  let base, mode = 'healthy';
  const methods = [];
  const server = http.createServer((req, res) => {
    methods.push(req.method);
    res.setHeader('Access-Control-Allow-Origin', mode === 'cors' ? 'http://localhost:5173' : base);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'content-type');
      res.writeHead(204); return res.end();
    }
    if (req.url === '/assets/app.js') { res.setHeader('Content-Type', 'application/javascript'); return res.end(`const api = '${base}/api';`); }
    if (req.url === '/api/health' && mode !== 'health') {
      res.setHeader('Content-Type', 'application/json'); return res.end(JSON.stringify({ status: 'ok', database: 'connected' }));
    }
    if (req.url === '/api/auth/me') { res.setHeader('Content-Type', 'application/json'); res.writeHead(401); return res.end(JSON.stringify({ error: 'Not authenticated' })); }
    if (req.url === '/api/users') {
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify([{ profile: 'public-handle', ...(mode === 'privacy' ? { email: 'never-log@example.test', bookmarks: ['never-log'] } : {}) }]));
    }
    if (req.url === '/result/verification.profile' && mode === 'dots') { res.writeHead(404); return res.end('Not found'); }
    res.setHeader('Content-Type', 'text/html');
    res.end('<html><script type="module" src="/assets/app.js"></script></html>');
  });
  server.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
  try {
    for (const [scenario, failedCheck] of [
      ['healthy', null], ['cors', 'credentialed CORS response matches frontend'],
      ['privacy', 'public directory excludes private fields'], ['health', 'backend database readiness'],
      ['dots', 'frontend route /result/verification.profile'],
    ]) {
      await t.test(scenario, async () => {
        mode = scenario;
        const result = await verifyDeployment({ frontendUrl: base, backendUrl: base, timeoutMs: 2000 });
        assert.equal(result.passed, scenario === 'healthy');
        if (failedCheck) assert.equal(result.checks.find(check => check.name === failedCheck).status, 'FAIL');
        assert.doesNotMatch(JSON.stringify(result), /never-log/);
      });
    }
    assert.ok(methods.every(method => method === 'GET' || method === 'OPTIONS'));
    await assert.rejects(verifyDeployment({ frontendUrl: 'https://user:secret@example.test', backendUrl: base }), /without credentials/);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
