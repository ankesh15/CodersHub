// Real upstream requests; no fixtures, fallback responses or database access.
const { createApp } = require('../app');
(async () => {
  const server = createApp({ databaseReady: () => false }).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  try {
    for (const [platform, username] of [['github', 'octocat'], ['leetcode', 'leetcode'], ['codeforces', 'tourist'], ['codechef', 'tourist']]) {
      const response = await fetch(`http://127.0.0.1:${server.address().port}/api/${platform}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username }), signal: AbortSignal.timeout(120000) });
      const data = await response.json();
      if (!response.ok || !data.profile) process.exitCode = 1;
      console.log(JSON.stringify({ platform, status: response.status, error: data.error, warnings: data.warnings, profileReceived: Boolean(data.profile), repos: platform === 'github' ? data.profile?.public_repos : undefined, solved: data.profile?.totalSolved }));
    }
    const missing = await fetch(`http://127.0.0.1:${server.address().port}/api/codeforces`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'codershub_missing_88' }), signal: AbortSignal.timeout(15000) });
    console.log(JSON.stringify({ platform: 'codeforces', check: 'missing public handle', status: missing.status }));
    if (missing.status !== 404) process.exitCode = 1;
  } finally { server.close(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
