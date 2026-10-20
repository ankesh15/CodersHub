import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Copy, CheckCircle2, Bookmark, Award, Printer, Code, Cpu, GitBranch } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import usePrintMode from "./hooks/usePrintMode";
import usePlatformStats from "./hooks/usePlatformStats";
import { calendarValues, earnedBadgeIds, ratingChartData } from "./lib/metrics";
import HeatmapCard from "./components/HeatmapCard";

function Result({ user, setUser }) {
  const { profile } = useParams();
  const printing = usePrintMode();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [startDate, setStartDate] = useState(new Date(currentYear, 0, 0));
  const [endDate, setEndDate] = useState(new Date());

  const [username, setUsername] = useState("");
  const [leetcode, setLeetcode] = useState("");
  const [codeForces, setCodeForces] = useState("");
  const [github, setGithub] = useState("");

  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const { leetcode: lcStats, codeforces: cfStats, github: ghStats, loading: statsLoading, errors } = usePlatformStats({ leetcode, codeforces: codeForces, github }, Number(selectedYear));
  const leetData = calendarValues(lcStats?.submissionCalendar);
  const cfData = calendarValues(cfStats?.submissionCalendar);
  const githubData = calendarValues(ghStats?.submissionCalendar);
  const leetLoading = statsLoading;
  const cfLoading = statsLoading;
  const githubLoading = statsLoading;

  const [copied, setCopied] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  // Sync bookmark state
  useEffect(() => {
    setIsBookmarked(Boolean(user?.bookmarks?.includes(profile.toLowerCase())));
  }, [user, profile]);

  const handleYearChange = (e) => {
    const year = e.target.value;
    setSelectedYear(year);
    setStartDate(new Date(Number(year), 0, 0));
    if (year === currentYear.toString()) {
      setEndDate(new Date());
    } else {
      setEndDate(new Date(Number(year), 11, 31));
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Profile link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch { toast.error("Unable to copy the link. Copy the URL from your address bar."); }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleToggleBookmark = async () => {
    if (!user) {
      toast.warning("Please sign in to bookmark profiles.");
      return;
    }
    setBookmarking(true);
    try {
      const res = await axios.post(`${API_BASE}/user/bookmark`, {
        targetProfile: profile.toLowerCase().trim()
      }, {
        withCredentials: true
      });
      if (res.data && res.data.bookmarks) {
        setUser(current => current?._id === user._id ? { ...current, bookmarks: res.data.bookmarks } : current);
        toast.success(
          res.data.bookmarks.includes(profile.toLowerCase())
            ? "Added to favorites!"
            : "Removed from favorites."
        );
      }
    } catch (err) {
      toast.error("Failed to update bookmark.");
    } finally {
      setBookmarking(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    setProfileLoading(true);
    setProfileError("");
    setUsername(""); setLeetcode(""); setCodeForces(""); setGithub("");
    axios.post(`${API_BASE}/user`, { profile }, { signal: controller.signal })
      .then(({ data }) => {
        setUsername(data.name);
        setLeetcode(data.leetcode || "");
        setCodeForces(data.codeforces || "");
        setGithub(data.github || "");
      })
      .catch(error => { if (!controller.signal.aborted) setProfileError(error.response?.data?.error || "Could not load profile. Please try again later."); })
      .finally(() => { if (!controller.signal.aborted) setProfileLoading(false); });
    return () => controller.abort();
  }, [profile]);

  // Compute Achievements dynamically
  const getAchievements = () => {
    const achievements = [];
    const lcSolved = lcStats?.totalSolved || 0;
    const cfStatus = cfStats?.totalSolved || 0;
    const ghCommits = githubData ? githubData.reduce((a, b) => a + b.count, 0) : 0;
    const langCount = ghStats?.languageStats ? Object.keys(ghStats.languageStats).length : 0;

    if (lcSolved >= 100 || cfStatus >= 100) {
      achievements.push({
        id: "century",
        title: "Century Solver",
        desc: "Solved at least 100 problems on a coding platform.",
        color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
      });
    }
    if (ghCommits >= 15) {
      achievements.push({
        id: "git_star",
        title: "Consistent Git",
        desc: "Logged at least 15 recent public events on GitHub.",
        color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
      });
    }
    if (langCount >= 3) {
      achievements.push({
        id: "polyglot",
        title: "Polyglot Coder",
        desc: "Wrote code in 3 or more distinct languages on GitHub.",
        color: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
      });
    }
    if (cfStats?.rating) {
      achievements.push({
        id: "cf_competitor",
        title: "Active CP Competitor",
        desc: "Registered active rating on Codeforces.",
        color: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
      });
    }

    achievements.unshift({
      id: "welcome",
      title: "CodersHub Member",
      desc: "Synced and initialized your global profile developer card.",
      color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20"
    });

    const earned = earnedBadgeIds(lcStats, cfStats, ghStats);
    return achievements.filter(item => earned.includes(item.id));
  };

  const getRatingChartData = () => ratingChartData(lcStats, cfStats);

  const achievementsList = getAchievements();
  const ratingData = getRatingChartData();

  if (profileLoading) return <p role="status" className="py-12 text-center">Loading profile...</p>;
  if (profileError) return <div role="alert" className="py-12 text-center space-y-4"><p>{profileError}</p><Link to="/search" className="text-yellow-500">Back to search</Link></div>;
  return (
    <div className="print-report space-y-8 animate-in fade-in duration-500 pb-16 print:p-0 print:space-y-4">
      
      {errors.length > 0 && <div role="alert" className="rounded-xl border border-yellow-500/30 p-4 text-sm text-yellow-700 dark:text-yellow-400">{errors.map((error, index) => <p key={index}>{error}</p>)}</div>}
      {/* Printable Report Styles */}
      <style>{`
        @page { size: A4; margin: 12mm; }
        @media print {
          .print-report { font-size: 10pt; }
          .print-report h1 { font-size: 24pt; }
          .print-report h1, .print-report h2, .print-report h3, .print-report h4,
          .print-report p, .print-report span { color: #111 !important; }
          .print-report > * + * { margin-top: 12px !important; }
          .heatmap-card { display: block !important; padding: 12px !important; }
          .profile-stats > div { padding: 12px !important; gap: 8px !important; }
          .profile-stats h3 { font-size: 16pt !important; }
          .profile-stats span { font-size: 8pt !important; }
          .heatmap-card > div { display: block !important; width: 100% !important; }
          .empty-heatmap { display: block !important; text-align: center; padding-top: 10px !important; }
          .heatmap-card h2 { font-size: 14pt; }
          .heatmap-card .mb-6 { margin-bottom: 8px !important; }
          .heatmap-content { display: block !important; overflow: visible !important; padding: 0 !important; }
          .heatmap-content > div { min-width: 0 !important; }
          .empty-heatmap, .empty-rating { height: 40px !important; }
          header, nav, button, select, a, .no-print {
            display: none !important;
          }
          body {
            background-color: white !important;
            color: black !important;
          }
          main { max-width: none !important; padding: 0 !important; }
          div { background-color: white !important; color: black !important; }
          .custom-scrollbar { overflow: visible !important; max-height: none !important; }
          .rounded-xl { break-inside: avoid; }
          .print-full {
            width: 100% !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
        }
      `}</style>

      {/* Profile Info Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-200 dark:border-gray-800 print-full">
        <div>
          <h2 className="text-sm font-semibold text-yellow-500 uppercase tracking-wider mb-1">Developer Profile</h2>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white capitalize">
              {username || profile}
            </h1>
            <button
              aria-label="Bookmark profile"
              onClick={handleToggleBookmark}
              disabled={bookmarking}
              className={`p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 transition-colors ${
                isBookmarked
                  ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-500"
                  : "text-gray-400 hover:text-yellow-500"
              } no-print`}
            >
              <Bookmark size={18} fill={isBookmarked ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 no-print">
          <select
            value={selectedYear}
            onChange={handleYearChange}
            className="w-32 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-xl focus:ring-yellow-500 focus:border-yellow-500 p-2.5 shadow-sm transition-colors cursor-pointer"
          >
            {[...Array(5)].map((_, i) => {
              const y = currentYear - i;
              return <option key={y} value={y}>{y}</option>;
            })}
          </select>

          <button
            onClick={handlePrint}
            disabled={statsLoading}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
          >
            <Printer size={16} /> Print Report
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95"
          >
            {copied ? <CheckCircle2 size={16} className="text-green-500 dark:text-green-600" /> : <Copy size={16} />}
            {copied ? "Copied!" : "Share Profile"}
          </button>
        </div>
      </div>

      {/* Platform Cards Grid */}
      <div className="profile-stats grid grid-cols-1 md:grid-cols-3 gap-6 print-full">
        {/* GitHub stats Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500"><GitBranch size={24} /></div>
          <div>
            <span className="text-xs text-gray-400 font-medium">GitHub Repos</span>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
              {statsLoading ? "..." : ghStats?.profile?.public_repos ?? (github ? "Unavailable" : "Not linked")}
            </h3>
          </div>
        </div>

        {/* LeetCode stats Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500"><Code size={24} /></div>
          <div>
            <span className="text-xs text-gray-400 font-medium">LeetCode Solved</span>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
              {statsLoading ? "..." : lcStats?.totalSolved ?? (leetcode ? "Unavailable" : "Not linked")}
            </h3>
          </div>
        </div>

        {/* Codeforces stats Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-xl text-red-500"><Cpu size={24} /></div>
          <div>
            <span className="text-xs text-gray-400 font-medium">Codeforces Rating</span>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
              {statsLoading ? "..." : cfStats ? cfStats.rating ?? "Unrated" : codeForces ? "Unavailable" : "Not linked"}
            </h3>
          </div>
        </div>
      </div>

      {/* Charts & Milestones Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 print-full">
        
        {/* Rating Line Chart */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 rounded-xl xl:col-span-2 space-y-4">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg">Rating Progress History</h3>
          {ratingData.length > 0 ? (
            <div className="rating-chart h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ratingData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip contentStyle={{ backgroundColor: "#111", border: "none", borderRadius: "8px", color: "#fff" }} />
                  <Legend />
                  <Line isAnimationActive={!printing} type="monotone" dataKey="LeetCode" stroke="#eab308" strokeWidth={2} connectNulls />
                  <Line isAnimationActive={!printing} type="monotone" dataKey="Codeforces" stroke="#f43f5e" strokeWidth={2} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty-rating h-[260px] flex items-center justify-center text-gray-400 text-sm">
              No contest rating changes logged.
            </div>
          )}
        </div>

        {/* Milestones badge card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 rounded-xl space-y-4">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg">Achievements & Badges</h3>
          <div className="space-y-2.5 max-h-[260px] overflow-y-auto custom-scrollbar">
            {achievementsList.map(a => (
              <div key={a.id} className={`p-2.5 rounded-lg border flex gap-2.5 items-start ${a.color}`}>
                <div className="pt-0.5"><Award size={14} /></div>
                <div>
                  <h4 className="font-bold text-xs">{a.title}</h4>
                  <p className="text-[10px] opacity-75 mt-0.5">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Heatmaps Block */}
      <div className="space-y-8 print-full">
        <HeatmapCard 
          title="GitHub"
          activityLabel="Public events"
          note={ghStats?.activityLabel || "Only recent public GitHub events are available; historical years may be empty."}
          platformUrl={github ? `https://github.com/${github}` : null}
          loading={githubLoading} 
          data={githubData} 
          startDate={startDate} 
          endDate={endDate} 
        />
        
        <HeatmapCard 
          title="LeetCode" 
          platformUrl={leetcode ? `https://leetcode.com/${leetcode}` : null}
          loading={leetLoading} 
          data={leetData} 
          startDate={startDate} 
          endDate={endDate} 
        />
        
        <HeatmapCard 
          title="Codeforces" 
          platformUrl={codeForces ? `https://codeforces.com/profile/${codeForces}` : null}
          loading={cfLoading} 
          data={cfData} 
          startDate={startDate} 
          endDate={endDate} 
        />
      </div>

    </div>
  );
}

export default Result;
