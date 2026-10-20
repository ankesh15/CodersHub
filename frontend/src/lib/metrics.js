export function calendarValues(calendar = {}) {
  if (!calendar || typeof calendar !== 'object' || Array.isArray(calendar)) return [];
  return Object.entries(calendar).flatMap(([key, value]) => {
    const date = /^\d+$/.test(key) ? new Date(Number(key) * 1000) : new Date(`${key.replaceAll('/', '-')}T00:00:00Z`);
    const count = Number(value);
    return Number.isFinite(date.getTime()) && Number.isFinite(count) && count >= 0
      ? [{ date: date.toISOString().slice(0, 10), count }] : [];
  });
}
export function ratingChartData(leetcode, codeforces) {
  const dates = new Map();
  const put = (date, key, rating) => {
    if (!date || !Number.isFinite(Date.parse(date)) || !Number.isFinite(rating)) return;
    dates.set(date, { ...dates.get(date), date, [key]: Math.round(rating) });
  };
  for (const item of leetcode?.contestHistory || []) {
    const timestamp = item.contest?.startTime;
    if (Number.isFinite(timestamp) && Number.isFinite(new Date(timestamp * 1000).getTime())) put(new Date(timestamp * 1000).toISOString().slice(0, 10), 'LeetCode', item.rating);
  }
  for (const item of codeforces?.ratingHistory || []) put(item.date, 'Codeforces', item.rating);
  return [...dates.values()].sort((a, b) => a.date.localeCompare(b.date));
}
export function earnedBadgeIds(leetcode, codeforces, github) {
  const result = ['welcome'];
  if (leetcode?.totalSolved >= 100 || codeforces?.totalSolved >= 100) result.push('century');
  if (calendarValues(github?.submissionCalendar).reduce((sum, item) => sum + item.count, 0) >= 15) result.push('git_star');
  if (Object.keys(github?.languageStats || {}).length >= 3) result.push('polyglot');
  if (codeforces?.rating > 0) result.push('cf_competitor');
  return result;
}
export function comparisonRows(first, second) {
  const rows = [ ['LeetCode Solved', 'leetcode', 'totalSolved'], ['Codeforces Max Rating', 'codeforces', 'maxRating'], ['GitHub Repos', 'github', 'public_repos'] ];
  return rows.map(([name, platform, key]) => ({ name, player1: first?.[platform]?.[key] ?? null, player2: second?.[platform]?.[key] ?? null }));
}
