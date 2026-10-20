const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const MongoStore = require('connect-mongo');
const { spawn } = require('child_process');
const path = require('path');
const { createApp } = require('../app');
const User = require('../models/User');
const { resolveGithubUser } = require('../lib/oauth');
process.env.SESSION_SECRET = 'codershub-regression-secret-not-for-production';
let mongo, server, base, store;
before(async () => {
  // This suite never loads .env or uses the configured database.
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri(), { dbName: 'codershub_regression' });
  await User.init();
  store = MongoStore.create({ client: mongoose.connection.getClient(), dbName: mongoose.connection.name, collectionName: 'sessions' });
  server = createApp({ store }).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}/api`;
}, { timeout: 120000 });
after(async () => {
  if (server) await new Promise(resolve => server.close(resolve));
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
});
async function request(path, body, cookie, method = body === undefined ? 'GET' : 'POST') {
  const response = await fetch(base + path, { method, headers: { ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...(cookie ? { Cookie: cookie } : {}) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  return { status: response.status, data: await response.json(), cookie: response.headers.get('set-cookie')?.split(';')[0], headers: response.headers };
}
const account = { name: 'Alice', email: 'alice@example.test', profile: 'alice', password: 'secure-password', github: 'octocat' };
test('HTTP validation, auth and real database workflows', async t => {
  await t.test('rejects invalid bodies and handles before making platform requests', async () => {
    for (const route of ['/github', '/leetcode', '/codeforces', '/codechef', '/user']) {
      assert.equal((await request(route, {})).status, 400);
      assert.equal((await request(route, { username: { $ne: null }, profile: [] })).status, 400);
      assert.equal((await request(route, { username: 'foo?token=bad', profile: '../admin' })).status, 400);
    }
    assert.equal((await request('/leetcode', { username: 'valid', year: 1999 })).status, 400);
    const cross = await fetch(base + '/auth/logout', { method: 'POST', headers: { Origin: 'https://untrusted.example' } });
    assert.equal(cross.status, 403);
    const malformed = await fetch(base + '/user', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
    assert.equal(malformed.status, 400);
    assert.equal((await fetch(base + '/user', { method: 'POST', body: 'profile=alice' })).status, 415);
  });
  let cookie;
  await t.test('registration validates, hashes passwords, normalizes handles and persists a private session', async () => {
    assert.equal((await request('/auth/register', { ...account, password: 'short' })).status, 400);
    assert.equal((await request('/auth/register', { ...account, password: 'a'.repeat(73) })).status, 400);
    const response = await request('/auth/register', { ...account, email: ' ALICE@EXAMPLE.TEST ', profile: ' Alice ' });
    assert.equal(response.status, 201);
    assert.equal(response.data.user.profile, 'alice');
    assert.equal(response.data.user.password, undefined);
    assert.match(response.headers.get('set-cookie'), /HttpOnly/);
    cookie = response.cookie;
    const saved = await User.findOne({ profile: 'alice' });
    assert.notEqual(saved.password, account.password);
    assert.equal((await request('/auth/me', undefined, cookie)).data.user.email, account.email);
    assert.equal((await request('/auth/register', account)).status, 409);
    assert.ok(await mongoose.connection.collection('sessions').findOne({}));
  });
  await t.test('public directory and profile omit private fields', async () => {
    for (const result of [(await request('/user', { profile: 'ALICE' })).data, (await request('/users')).data[0]]) {
      for (const field of ['password', 'email', 'bookmarks', 'githubId']) assert.equal(result[field], undefined);
      assert.equal(result.profile, 'alice');
    }
  });
  await t.test('login rejects invalid credentials and rotates sessions', async () => {
    assert.equal((await request('/auth/login', { loginId: 'alice', password: 'wrong' })).status, 401);
    const response = await request('/auth/login', { loginId: ' ALICE ', password: account.password }, cookie);
    assert.equal(response.status, 200);
    assert.notEqual(response.cookie, cookie);
    assert.equal((await request('/auth/me', undefined, cookie)).status, 401);
    cookie = response.cookie;
  });
  await t.test('authorization and profile update allow clearing handles without changing ownership', async () => {
    assert.equal((await request('/user/update', { name: 'intruder' })).status, 401);
    assert.equal((await request('/user/update', { github: {} }, cookie)).status, 400);
    const response = await request('/user/update', { github: '', name: 'Alice Updated', profile: 'stolen', email: 'stolen@example.test' }, cookie);
    assert.equal(response.status, 200);
    assert.equal(response.data.user.github, '');
    assert.equal(response.data.user.profile, 'alice');
    assert.equal(response.data.user.email, account.email);
  });
  await t.test('bookmarks normalize, validate existence and toggle atomically', async () => {
    await request('/auth/register', { ...account, profile: 'bob', email: 'bob@example.test' });
    assert.equal((await request('/user/bookmark', { targetProfile: 'missing' }, cookie)).status, 404);
    assert.deepEqual((await request('/user/bookmark', { targetProfile: ' BOB ' }, cookie)).data.bookmarks, ['bob']);
    assert.deepEqual((await request('/user/bookmark', { targetProfile: 'bob' }, cookie)).data.bookmarks, []);
    await Promise.all([request('/user/bookmark', { targetProfile: 'bob' }, cookie), request('/user/bookmark', { targetProfile: 'bob' }, cookie)]);
    assert.deepEqual((await request('/auth/me', undefined, cookie)).data.user.bookmarks, []);
  });
  await t.test('OAuth identity is stable and does not link arbitrary public handles or conflicting emails', async () => {
    const oauth = await resolveGithubUser({ id: '123', username: 'octocat' });
    assert.notEqual(oauth.profile, 'alice');
    assert.equal((await resolveGithubUser({ id: '123', username: 'renamed' }))._id.toString(), oauth._id.toString());
    await assert.rejects(resolveGithubUser({ id: '456', username: 'another' }, account.email), { status: 409 });
    assert.equal((await request('/auth/login', { loginId: oauth.profile, password: 'wrong' })).status, 401);
    assert.equal((await request('/auth/github')).status, 503);
  });
  await t.test('session survives an app restart through MongoDB and logout destroys it', async () => {
    await new Promise(resolve => server.close(resolve));
    server = createApp({ store }).listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    base = `http://127.0.0.1:${server.address().port}/api`;
    assert.equal((await request('/auth/me', undefined, cookie)).status, 200);
    assert.equal((await request('/auth/logout', {}, cookie)).status, 200);
    assert.equal((await request('/auth/me', undefined, cookie)).status, 401);
  });
  await t.test('database outage is an immediate 503; guest sessions and platform validation still work', async () => {
    const degraded = createApp({ databaseReady: () => false }).listen(0, '127.0.0.1');
    await new Promise(resolve => degraded.once('listening', resolve));
    const url = `http://127.0.0.1:${degraded.address().port}/api`;
    try {
      assert.equal((await fetch(url + '/health')).status, 503);
      assert.equal((await fetch(url + '/users')).status, 503);
      assert.equal((await fetch(url + '/auth/me')).status, 401);
    } finally { await new Promise(resolve => degraded.close(resolve)); }
  });
  await t.test('actual backend entrypoint starts, connects, serves health and shuts down', async () => {
    const child = spawn(process.execPath, [path.join(__dirname, '../index.js')], { env: { ...process.env, MONGO_URI: mongo.getUri('codershub_regression'), PORT: '0', NODE_ENV: 'test' }, stdio: ['ignore', 'pipe', 'pipe'] });
    try {
      const port = await new Promise((resolve, reject) => {
        let output = '';
        const timer = setTimeout(() => reject(new Error('Backend startup timed out')), 10000);
        child.on('error', reject);
        child.stdout.on('data', chunk => { output += chunk; const match = output.match(/Server is running on port (\d+)/); if (match) { clearTimeout(timer); resolve(match[1]); } });
        child.once('exit', code => { clearTimeout(timer); reject(new Error(`Backend exited during startup: ${code}`)); });
      });
      const response = await fetch(`http://127.0.0.1:${port}/api/health`);
      assert.equal(response.status, 200);
      assert.equal((await response.json()).database, 'connected');
    } finally {
      child.kill('SIGTERM');
      await new Promise(resolve => child.once('exit', resolve));
    }
  });
  await t.test('production refuses weak secrets and nonpersistent sessions', () => {
    const original = process.env.NODE_ENV;
    const secret = process.env.SESSION_SECRET;
    process.env.NODE_ENV = 'production';
    try {
      process.env.SESSION_SECRET = 'short';
      assert.throws(() => createApp(), /SESSION_SECRET/);
      process.env.SESSION_SECRET = secret;
      assert.throws(() => createApp(), /persistent session store/);
    } finally { process.env.NODE_ENV = original; process.env.SESSION_SECRET = secret; }
  });

});
