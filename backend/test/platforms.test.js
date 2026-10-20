const { test } = require('node:test');
const assert = require('node:assert/strict');
const axios = require('axios');
const { createApp } = require('../app');

test('platform HTTP contracts handle real provider shapes, partial results and upstream failures', async t => {
  let get, post;
  const calls = [];
  const replacement = t.mock.method(axios, 'create', () => ({
    get: async (url, options) => { calls.push({ url, options }); return get(url, options); },
    post: async (url, body) => { calls.push({ url, body }); return post(url, body); },
  }));
  const server = createApp({ databaseReady: () => false }).listen(0, '127.0.0.1');
  replacement.mock.restore();
  await new Promise(resolve => server.once('listening', resolve));
  async function request(platform, username = 'tourist') {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/${platform}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username }),
    });
    return { status: response.status, data: await response.json() };
  }
  try {
    await t.test('GitHub follows repository pages and counts public events without inventing commits', async () => {
      get = async (url, options) => {
        if (url.endsWith('/repos')) return { data: Array.from({ length: options.params.page === 1 ? 100 : 1 }, () => ({ language: 'JavaScript' })) };
        if (url.endsWith('/events/public')) return { data: [{ created_at: '2026-01-01T12:00:00Z' }, { created_at: 'invalid' }] };
        return { data: { login: 'tourist', public_repos: 101 } };
      };
      const { status, data } = await request('github');
      assert.equal(status, 200);
      assert.deepEqual(data.languageStats, { JavaScript: 101 });
      assert.deepEqual(data.submissionCalendar, { '2026-01-01': 1 });
      assert.match(data.activityLabel, /not a full contribution calendar/);
      assert.ok(calls.some(call => call.options?.params?.page === 2));
    });
    await t.test('LeetCode retains public solves when the separate calendar query fails', async () => {
      post = async (_url, body) => {
        if (body.query.includes('query calendar')) throw new Error('Calendar unavailable');
        return { data: { data: { matchedUser: { submitStatsGlobal: { acSubmissionNum: [
          { difficulty: 'All', count: 6 }, { difficulty: 'Easy', count: 1 }, { difficulty: 'Medium', count: 2 }, { difficulty: 'Hard', count: 3 },
        ] } }, userContestRankingHistory: [{ attended: true, rating: 1500, contest: { startTime: 1704067200 } }, { attended: false }] } } };
      };
      const { status, data } = await request('leetcode');
      assert.equal(status, 200);
      assert.equal(data.profile.totalSolved, 6);
      assert.equal(data.profile.contestHistory.length, 1);
      assert.deepEqual(data.profile.submissionCalendar, {});
      assert.match(data.warnings[0], /calendar/);
    });
    await t.test('Codeforces deduplicates accepted problems and keeps failed submissions out of solved totals', async () => {
      get = async url => ({ data: { status: 'OK', result: url.endsWith('user.info') ? [{ handle: 'tourist' }] : url.endsWith('user.rating') ? [
        { newRating: 1600, ratingUpdateTimeSeconds: 1704067200, contestName: 'Round' },
      ] : [
        { verdict: 'OK', problem: { contestId: 1, index: 'A' }, creationTimeSeconds: 1704067200 },
        { verdict: 'OK', problem: { contestId: 1, index: 'A' }, creationTimeSeconds: 1704067200 },
        { verdict: 'WRONG_ANSWER', problem: { contestId: 1, index: 'B' }, creationTimeSeconds: 1704067200 },
      ] } });
      const { status, data } = await request('codeforces');
      assert.equal(status, 200);
      assert.equal(data.profile.totalSolved, 1);
      assert.equal(data.profile.submissionCalendar['2024-01-01'], 3);
      assert.equal(data.profile.ratingHistory[0].rating, 1600);
    });
    await t.test('upstream errors become explicit API errors and invalid handles never reach providers', async () => {
      for (const [upstream, expected] of [[404, 404], [429, 429], [402, 502], [500, 502]]) {
        get = async () => { throw { isAxiosError: true, response: { status: upstream } }; };
        assert.equal((await request('codechef')).status, expected);
      }
      get = async () => { throw { isAxiosError: true, code: 'ECONNABORTED' }; };
      assert.equal((await request('github')).status, 504);
      const before = calls.length;
      assert.equal((await request('github', '../admin?token=bad')).status, 400);
      assert.equal(calls.length, before);
    });
  } finally { await new Promise(resolve => server.close(resolve)); }
});
