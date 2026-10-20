import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calendarValues, ratingChartData, earnedBadgeIds, comparisonRows } from '../src/lib/metrics.js';
test('calendar normalizes epoch and calendar keys and excludes invalid values', () => {
  assert.deepEqual(calendarValues({ '1704067200': 2, '2024/01/02': '3', bad: 2, '2024-01-03': -1 }), [
    { date: '2024-01-01', count: 2 }, { date: '2024-01-02', count: 3 },
  ]);
  assert.deepEqual(calendarValues(null), []);
});
test('same-day contest series share one row and malformed dates do not crash', () => {
  const lc = { contestHistory: [{ rating: 1500.7, contest: { startTime: 1704067200 } }, { rating: 1 }] };
  const cf = { ratingHistory: [{ date: '2024-01-01', rating: 1700 }] };
  assert.deepEqual(ratingChartData(lc, cf), [{ date: '2024-01-01', LeetCode: 1501, Codeforces: 1700 }]);
});
test('failed submissions do not award a solver badge and GitHub packet awards activity/languages', () => {
  assert.deepEqual(earnedBadgeIds(null, { submissionCalendar: { '2024-01-01': 200 }, totalSolved: 1 }, null), ['welcome']);
  assert.deepEqual(earnedBadgeIds({ totalSolved: 100 }, { rating: 1 }, { submissionCalendar: { '2024-01-01': 15 }, languageStats: { Java: 1, Python: 1, Go: 1 } }), ['welcome', 'century', 'git_star', 'polyglot', 'cf_competitor']);
});
test('comparison series remain distinct with duplicate display names and missing data stays null', () => {
  const rows = comparisonRows({ profile: { name: 'Alex' }, leetcode: { totalSolved: 0 } }, { profile: { name: 'Alex' }, leetcode: { totalSolved: 2 } });
  assert.deepEqual(rows[0], { name: 'LeetCode Solved', player1: 0, player2: 2 });
  assert.deepEqual(rows[1], { name: 'Codeforces Max Rating', player1: null, player2: null });
});
