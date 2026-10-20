// Read-only hosting checks. Never signs in or changes database records.
function origin(value, label) {
  let url;
  try { url = new URL(value); } catch { throw new Error(`${label} must be an HTTP(S) origin.`); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash || url.pathname !== '/') {
    throw new Error(`${label} must be an HTTP(S) origin without credentials, path, query or fragment.`);
  }
  return url.origin;
}
async function verifyDeployment({ frontendUrl, backendUrl, timeoutMs = 60000 }) {
  const frontend = origin(frontendUrl, 'VERIFY_FRONTEND_URL');
  const backend = origin(backendUrl, 'VERIFY_BACKEND_URL');
  const checks = [];
  const add = (name, pass, details = {}) => checks.push({ name, status: pass ? 'PASS' : 'FAIL', ...details });
  async function request(base, path, options = {}) {
    try {
      const response = await fetch(base + path, { ...options, signal: AbortSignal.timeout(timeoutMs) });
      const body = await response.text();
      let json;
      if (response.headers.get('content-type')?.includes('application/json')) {
        try { json = JSON.parse(body); } catch { /* Invalid JSON must fail its contract. */ }
      }
      return { response, body, json };
    } catch {
      add(`request ${base === frontend ? 'frontend' : 'backend'} ${path}`, false, { reason: 'Network error or timeout.' });
      return null;
    }
  }
  const pages = {};
  for (const path of ['/', '/dashboard', '/result/verification.profile']) {
    const result = await request(frontend, path);
    pages[path] = result;
    if (result) add(`frontend route ${path}`, result.response.status === 200 && result.response.headers.get('content-type')?.includes('text/html'), { httpStatus: result.response.status });
  }
  const assetPaths = [...(pages['/']?.body || '').matchAll(/<script\b[^>]*\bsrc=["'](\/assets\/[^"']+)["']/g)].map(match => match[1]);
  let configuredApiFound = false;
  for (const path of assetPaths) {
    const asset = await request(frontend, path);
    if (asset) {
      const javascript = /javascript|ecmascript/.test(asset.response.headers.get('content-type') || '');
      add('frontend JavaScript asset', asset.response.status === 200 && javascript, { httpStatus: asset.response.status });
      configuredApiFound ||= asset.body.includes(`${backend}/api`);
    }
  }
  add('compiled bundle references expected API base', assetPaths.length > 0 && configuredApiFound);
  const health = await request(backend, '/api/health');
  if (health) add('backend database readiness', health.response.status === 200 && health.json?.status === 'ok' && health.json?.database === 'connected', { httpStatus: health.response.status });
  const session = await request(backend, '/api/auth/me', { headers: { Origin: frontend } });
  if (session) {
    add('guest session rejects anonymous access', session.response.status === 401 && typeof session.json?.error === 'string', { httpStatus: session.response.status });
    add('credentialed CORS response matches frontend', session.response.headers.get('access-control-allow-origin') === frontend && session.response.headers.get('access-control-allow-credentials') === 'true', { allowedOrigin: session.response.headers.get('access-control-allow-origin') });
  }
  const preflight = await request(backend, '/api/user', { method: 'OPTIONS', headers: { Origin: frontend, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type' } });
  if (preflight) add('JSON profile request preflight', preflight.response.ok && preflight.response.headers.get('access-control-allow-origin') === frontend && /POST/i.test(preflight.response.headers.get('access-control-allow-methods') || '') && /content-type/i.test(preflight.response.headers.get('access-control-allow-headers') || ''), { httpStatus: preflight.response.status });
  const users = await request(backend, '/api/users');
  if (users) {
    const records = Array.isArray(users.json) ? users.json : [];
    const privateFields = ['password', 'email', 'githubId', 'bookmarks'];
    const exposed = privateFields.filter(key => records.some(row => row && Object.hasOwn(row, key)));
    add('public directory excludes private fields', users.response.status === 200 && Array.isArray(users.json) && exposed.length === 0, { httpStatus: users.response.status, recordsChecked: records.length, exposedFieldNames: exposed });
    // Field names and counts are reported; user values are never returned.
  }
  return { checkedAt: new Date().toISOString(), frontend, backend, passed: checks.every(check => check.status === 'PASS'), checks };
}
module.exports = { verifyDeployment };
