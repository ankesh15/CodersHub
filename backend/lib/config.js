function origin(value, name, { required = false, production = false, fallback } = {}) {
  if (!value && required) throw new Error(`Production requires ${name}.`);
  let url;
  try { url = new URL(value || fallback); } catch { throw new Error(`${name} must be an HTTP(S) origin.`); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash || url.pathname !== '/' || (production && url.protocol !== 'https:')) {
    throw new Error(`${name} must be ${production ? 'an HTTPS' : 'an HTTP(S)'} origin without a path, credentials, query or fragment.`);
  }
  return url.origin;
}
function runtimeConfig(env = process.env) {
  const production = env.NODE_ENV === 'production';
  if (production && (!env.SESSION_SECRET || env.SESSION_SECRET.length < 32)) {
    throw new Error('Production requires SESSION_SECRET with at least 32 characters.');
  }
  const frontendUrl = origin(env.FRONTEND_URL, 'FRONTEND_URL', { required: production, production, fallback: 'http://localhost:5173' });
  const oauthEnabled = Boolean(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET);
  if (Boolean(env.GITHUB_CLIENT_ID) !== Boolean(env.GITHUB_CLIENT_SECRET)) {
    throw new Error('Set both GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to enable OAuth, or leave both unset.');
  }
  const backendUrl = env.BACKEND_URL || oauthEnabled || !production
    ? origin(env.BACKEND_URL, 'BACKEND_URL', { required: production && oauthEnabled, production, fallback: 'http://localhost:5000' })
    : null;
  return { production, frontendUrl, backendUrl, oauthEnabled };
}
module.exports = { runtimeConfig };
