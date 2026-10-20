import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
const API_BASE = import.meta.env.VITE_API_BASE_URL;
export default function usePlatformStats(user, year) {
  const [state, setState] = useState({ leetcode: null, codeforces: null, github: null, errors: [], loading: false });
  const request = useRef(null);
  const leetcode = user?.leetcode || '';
  const codeforces = user?.codeforces || '';
  const github = user?.github || '';
  const refresh = useCallback(async () => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setState({ leetcode: null, codeforces: null, github: null, errors: [], loading: true });
    const handles = { leetcode, codeforces, github };
    const entries = Object.entries(handles).filter(([, handle]) => handle);
    const results = await Promise.allSettled(entries.map(([platform, username]) => axios.post(`${API_BASE}/${platform}`, { username, ...(year ? { year } : {}) }, { signal: controller.signal })));
    if (controller.signal.aborted) return;
    const next = { leetcode: null, codeforces: null, github: null, errors: [], loading: false };
    results.forEach((result, i) => {
      const platform = entries[i][0];
      if (result.status === 'fulfilled' && result.value.data?.profile) {
        next[platform] = platform === 'github' ? result.value.data : result.value.data.profile;
        next.errors.push(...(result.value.data.warnings || []).map(message => `${platform}: ${message}`));
      } else next.errors.push(`${platform}: ${result.reason?.response?.data?.error || 'Metrics unavailable. Try syncing again.'}`);
    });
    setState(next);
  }, [leetcode, codeforces, github, year]);
  useEffect(() => {
    refresh();
    return () => request.current?.abort();
  }, [refresh]);
  return { ...state, refresh };
}
