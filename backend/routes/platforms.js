const express = require('express');
const axios = require('axios');
const { handle } = require('../lib/validation');
const router = express.Router();
const client = axios.create({ timeout: 10000, maxContentLength: 10 * 1024 * 1024 });
function invalidResponse() { return Object.assign(new Error('Invalid platform response'), { status: 502 }); }
function fail(res, error, platform) {
  const upstream = error.response?.status;
  const missingCodeforcesUser = platform === 'Codeforces' && error.response?.data?.status === 'FAILED' && /not found/i.test(error.response.data.comment || '');
  const status = (!error.isAxiosError && error.status) || (upstream === 404 || missingCodeforcesUser ? 404 : upstream === 429 || upstream === 403 ? 429 : error.code === 'ECONNABORTED' ? 504 : 502);
  res.status(status).json({ error: status === 404 ? `${platform} user not found.` : status === 429 ? `${platform} request limit reached. Please try again later.` : `${platform} is unavailable or returned an invalid response. Please try again later.` });
}
function day(seconds) {
  const date = new Date(seconds * 1000);
  return Number.isFinite(date.getTime()) ? date.toISOString().slice(0, 10) : null;
}
function add(calendar, date) { if (date) calendar[date] = (calendar[date] || 0) + 1; }
function cfResult(response) {
  if (response.data?.status !== 'OK' || !Array.isArray(response.data.result)) {
    if (/not found/i.test(response.data?.comment || '')) throw Object.assign(new Error('User not found'), { status: 404 });
    throw invalidResponse();
  }
  return response.data.result;
}
// Reject objects, URL fragments and query injection before contacting any provider.
router.use((req, res, next) => {
  if (req.method !== 'POST' || !['/github', '/leetcode', '/codeforces', '/codechef'].includes(req.path)) return next();
  try { req.platformUsername = handle(req.body.username, 'Username'); next(); } catch (error) { next(error); }
});
router.post('/github', async (req, res) => {
  const username = encodeURIComponent(req.platformUsername);
  const headers = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  try {
    const { data: profile } = await client.get(`https://api.github.com/users/${username}`, { headers });
    if (!profile?.login || !Number.isFinite(profile.public_repos)) throw invalidResponse();
    const warnings = [];
    const languageStats = Object.create(null);
    const submissionCalendar = {};
    try {
      for (let page = 1; page <= 20; page++) {
        const { data: repos } = await client.get(`https://api.github.com/users/${username}/repos`, { headers, params: { per_page: 100, page, type: 'owner' } });
        if (!Array.isArray(repos)) throw invalidResponse();
        for (const repo of repos) if (typeof repo.language === 'string' && repo.language) languageStats[repo.language] = (languageStats[repo.language] || 0) + 1;
        if (repos.length < 100) break;
        if (page === 20) warnings.push('Repository languages are limited to the first 2,000 repositories.');
      }
    } catch { warnings.push('Repository language data is unavailable or incomplete.'); }
    try {
      // GitHub exposes a limited recent event timeline, not a yearly commit calendar.
      for (let page = 1; page <= 3; page++) {
        const { data: events } = await client.get(`https://api.github.com/users/${username}/events/public`, { headers, params: { per_page: 100, page } });
        if (!Array.isArray(events)) throw invalidResponse();
        for (const event of events) {
          const timestamp = Date.parse(event.created_at);
          if (Number.isFinite(timestamp)) add(submissionCalendar, day(timestamp / 1000));
        }
        if (events.length < 100) break;
      }
    } catch { warnings.push('Recent public event data is unavailable or incomplete.'); }
    res.json({ profile, languageStats, submissionCalendar, warnings, activityLabel: 'Recent public events (up to 300 events; not a full contribution calendar)' });
  } catch (error) { fail(res, error, 'GitHub'); }
});
router.post('/leetcode', async (req, res, next) => {
  const year = req.body.year === undefined ? new Date().getUTCFullYear() : Number(req.body.year);
  if (!Number.isInteger(year) || year < 2000 || year > new Date().getUTCFullYear()) return res.status(400).json({ error: 'Invalid calendar year.' });
  try {
    const [coreResult, calendarResult] = await Promise.allSettled([client.post('https://leetcode.com/graphql', {
      query: `query profile($username: String!) {
        matchedUser(username: $username) {
          profile { ranking reputation }
          contributions { points }
          submitStatsGlobal { acSubmissionNum { difficulty count } }
        }
        userContestRanking(username: $username) { rating globalRanking attendedContestsCount topPercentage }
        userContestRankingHistory(username: $username) { attended rating contest { title startTime } }
      }`, variables: { username: req.platformUsername, year },
    }),
    client.post('https://leetcode.com/graphql', {
      query: `query calendar($username: String!, $year: Int!) { matchedUser(username: $username) { userCalendar(year: $year) { submissionCalendar } } }`,
      variables: { username: req.platformUsername, year },
    })]);
    if (coreResult.status === 'rejected') throw coreResult.reason;
    const response = coreResult.value;
    const data = response.data?.data;
    if (!data || !Object.hasOwn(data, 'matchedUser')) throw invalidResponse();
    if (!data.matchedUser) {
      if (!response.data.errors || response.data.errors.some(error => /not (exist|found)|does not exist/i.test(error.message))) {
        return res.status(404).json({ error: 'LeetCode user not found.' });
      }
      throw invalidResponse();
    }
    const user = data.matchedUser;
    const counts = user.submitStatsGlobal?.acSubmissionNum;
    if (!Array.isArray(counts) || !['All', 'Easy', 'Medium', 'Hard'].every(difficulty => counts.some(item => item.difficulty === difficulty && Number.isFinite(item.count) && item.count >= 0))) throw invalidResponse();
    const count = difficulty => counts.find(item => item.difficulty === difficulty)?.count ?? 0;
    const warnings = response.data.errors?.length ? ['Some LeetCode fields could not be loaded.'] : [];
    let submissionCalendar = {};
    try {
      const calendar = calendarResult.status === 'fulfilled' ? calendarResult.value.data?.data?.matchedUser?.userCalendar?.submissionCalendar : null;
      if (calendar == null) throw invalidResponse();
      submissionCalendar = typeof calendar === 'string' ? JSON.parse(calendar) : calendar;
      if (!submissionCalendar || typeof submissionCalendar !== 'object' || Array.isArray(submissionCalendar)) throw invalidResponse();
    } catch { submissionCalendar = {}; warnings.push('LeetCode calendar is private or unavailable.'); }
    res.json({ profile: {
      ranking: user.profile?.ranking ?? null, totalSolved: count('All'), easySolved: count('Easy'), mediumSolved: count('Medium'), hardSolved: count('Hard'),
      acceptanceRate: null, contributionPoints: user.contributions?.points ?? null, reputation: user.profile?.reputation ?? null,
      submissionCalendar, contestRanking: data.userContestRanking ?? null,
      contestHistory: Array.isArray(data.userContestRankingHistory) ? data.userContestRankingHistory.filter(item => item.attended && Number.isFinite(item.rating) && Number.isFinite(item.contest?.startTime)) : [],
    }, warnings });
  } catch (error) { fail(res, error, 'LeetCode'); }
});
router.post('/codeforces', async (req, res) => {
  const handle = req.platformUsername;
  try {
    const info = cfResult(await client.get('https://codeforces.com/api/user.info', { params: { handles: handle } }));
    const profile = info[0];
    if (!profile?.handle) throw invalidResponse();
    const warnings = [];
    const submissionCalendar = {};
    let totalSolved = null;
    let ratingHistory = [];
    try {
      const solved = new Set();
      for (let page = 0; page < 10; page++) {
        const submissions = cfResult(await client.get('https://codeforces.com/api/user.status', { params: { handle, from: page * 1000 + 1, count: 1000 } }));
        for (const submission of submissions) {
          if (Number.isFinite(submission.creationTimeSeconds)) add(submissionCalendar, day(submission.creationTimeSeconds));
          const problem = submission.problem;
          if (submission.verdict === 'OK' && problem?.index && (problem.contestId != null || problem.problemsetName)) solved.add(`${problem.contestId ?? problem.problemsetName}:${problem.index}`);
        }
        if (submissions.length < 1000) { totalSolved = solved.size; break; }
        if (page === 9) warnings.push('Submission history is limited to 10,000 records; total solved is unavailable.');
      }
    } catch { warnings.push('Codeforces submissions are unavailable or incomplete.'); }
    try {
      ratingHistory = cfResult(await client.get('https://codeforces.com/api/user.rating', { params: { handle } }))
        .filter(item => Number.isFinite(item.newRating) && Number.isFinite(item.ratingUpdateTimeSeconds))
        .map(item => ({ contestName: item.contestName, rating: item.newRating, rank: item.rank, date: day(item.ratingUpdateTimeSeconds) }));
    } catch { warnings.push('Codeforces rating history is unavailable.'); }
    res.json({ profile: { ...profile, submissionCalendar, totalSolved, ratingHistory }, warnings });
  } catch (error) { fail(res, error, 'Codeforces'); }
});
router.post('/codechef', async (req, res) => {
  try {
    const { data } = await client.get(`https://codechef-api.vercel.app/${encodeURIComponent(req.platformUsername)}`);
    if (data?.status === 'success' && data.data && typeof data.data === 'object') return res.json({ profile: data.data });
    if (data?.status === 'failed' || data?.status === 'error') return res.status(404).json({ error: 'CodeChef user not found.' });
    throw invalidResponse();
  } catch (error) { fail(res, error, 'CodeChef'); }
});
module.exports = router;