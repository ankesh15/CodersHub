const express = require('express');
const axios = require('axios');
const router = express.Router();

// Helper for axios with timeout
const axiosInstance = axios.create({
  timeout: 10000, // 10 seconds timeout
});

// Configure GitHub headers to prevent rate limits if token is present
const getGithubHeaders = () => {
  const headers = {};
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
};

// POST /api/github
router.post('/github', async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username required' });
  try {
    // Fetch user profile
    const userRes = await axiosInstance.get(`https://api.github.com/users/${username}`, {
      headers: getGithubHeaders()
    });
    
    // Fetch repos for language stats
    const reposRes = await axiosInstance.get(`https://api.github.com/users/${username}/repos?per_page=100`, {
      headers: getGithubHeaders()
    });
    const repos = reposRes.data;
    
    // Aggregate language usage
    const languageStats = {};
    repos.forEach(repo => {
      if (repo.language) {
        languageStats[repo.language] = (languageStats[repo.language] || 0) + 1;
      }
    });

    // Fetch public events to parse contribution heatmap (last 90 days)
    let submissionCalendar = {};
    try {
      const eventsRes = await axiosInstance.get(`https://api.github.com/users/${username}/events?per_page=100`, {
        headers: getGithubHeaders()
      });
      const events = eventsRes.data;
      events.forEach(event => {
        if (event.created_at) {
          const dateStr = new Date(event.created_at).toISOString().split('T')[0].replace(/-/g, '/');
          submissionCalendar[dateStr] = (submissionCalendar[dateStr] || 0) + 1;
        }
      });
    } catch (eventErr) {
      console.error('Error fetching github events:', eventErr.message);
    }

    res.json({
      profile: userRes.data,
      languageStats,
      submissionCalendar
    });
  } catch (err) {
    res.status(404).json({ error: 'GitHub user not found or API error.' });
  }
});

// POST /api/leetcode
router.post('/leetcode', async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username required' });
  try {
    // 1. Fetch calendar/solved stats from unofficial API
    const statsUrl = `https://leetcode-stats-api.herokuapp.com/${username}`;
    const statsRes = await axiosInstance.get(statsUrl);
    const statsData = statsRes.data;

    // 2. Fetch rating history & detailed solves from LeetCode GraphQL API
    let graphqlData = null;
    try {
      const graphqlRes = await axiosInstance.post('https://leetcode.com/graphql', {
        query: `
          query userProblemsSolved($username: String!) {
            allQuestionsCount {
              difficulty
              count
            }
            matchedUser(username: $username) {
              submitStatsGlobal {
                acSubmissionNum {
                  difficulty
                  count
                }
              }
            }
            userContestRanking(username: $username) {
              rating
              globalRanking
              attendedContestsCount
              topPercentage
            }
            userContestRankingHistory(username: $username) {
              attended
              rating
              contest {
                title
                startTime
              }
            }
          }
        `,
        variables: { username }
      });
      graphqlData = graphqlRes.data?.data;
    } catch (gqlErr) {
      console.error('Error fetching LeetCode GraphQL:', gqlErr.message);
    }

    // Combine payloads
    res.json({
      profile: {
        ranking: statsData.ranking || graphqlData?.userContestRanking?.globalRanking || 0,
        totalSolved: statsData.totalSolved || 0,
        easySolved: statsData.easySolved || 0,
        mediumSolved: statsData.mediumSolved || 0,
        hardSolved: statsData.hardSolved || 0,
        acceptanceRate: statsData.acceptanceRate || 0,
        contributionPoints: statsData.contributionPoints || 0,
        reputation: statsData.reputation || 0,
        submissionCalendar: statsData.submissionCalendar || {},
        contestRanking: graphqlData?.userContestRanking || null,
        contestHistory: graphqlData?.userContestRankingHistory?.filter(h => h.attended) || []
      }
    });
  } catch (err) {
    res.status(404).json({ error: 'LeetCode user not found or API error.' });
  }
});

// POST /api/codeforces
router.post('/codeforces', async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username required' });
  try {
    // 1. Fetch user info
    const infoUrl = `https://codeforces.com/api/user.info?handles=${username}`;
    const infoRes = await axiosInstance.get(infoUrl);
    const profile = infoRes.data.result[0];

    // 2. Fetch submissions to build heatmaps
    let submissionCalendar = {};
    try {
      const statusUrl = `https://codeforces.com/api/user.status?handle=${username}`;
      const statusRes = await axiosInstance.get(statusUrl);
      const submissions = statusRes.data.result;
      submissions.forEach(sub => {
        if (sub.creationTimeSeconds) {
          const dateStr = new Date(sub.creationTimeSeconds * 1000).toISOString().split('T')[0].replace(/-/g, '/');
          submissionCalendar[dateStr] = (submissionCalendar[dateStr] || 0) + 1;
        }
      });
    } catch (subErr) {
      console.error('Error fetching Codeforces status:', subErr.message);
    }

    // 3. Fetch rating history
    let ratingHistory = [];
    try {
      const ratingUrl = `https://codeforces.com/api/user.rating?handle=${username}`;
      const ratingRes = await axiosInstance.get(ratingUrl);
      ratingHistory = ratingRes.data.result.map(r => ({
        contestName: r.contestName,
        rating: r.newRating,
        rank: r.rank,
        date: new Date(r.ratingUpdateTimeSeconds * 1000).toISOString().split('T')[0]
      }));
    } catch (ratErr) {
      console.error('Error fetching Codeforces rating history:', ratErr.message);
    }

    res.json({
      profile: {
        ...profile,
        submissionCalendar,
        ratingHistory
      }
    });
  } catch (err) {
    res.status(404).json({ error: 'Codeforces user not found or API error.' });
  }
});

// POST /api/codechef
router.post('/codechef', async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username required' });
  try {
    // Third-party CodeChef API endpoint
    const url = `https://codechef-api.vercel.app/${username}`;
    const response = await axiosInstance.get(url);
    if (response.data.status === 'success') {
      res.json({ profile: response.data.data });
    } else {
      res.status(404).json({ error: 'CodeChef user not found.' });
    }
  } catch (err) {
    res.status(404).json({ error: 'CodeChef user not found or API error.' });
  }
});

module.exports = router;