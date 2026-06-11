import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Copy, CheckCircle2, Bookmark, Star, ArrowLeft, Award, ExternalLink, Printer, Code, Cpu, GitBranch } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import HeatmapCard from "./components/HeatmapCard";

function Result({ user, setUser }) {
  const { profile } = useParams();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [startDate, setStartDate] = useState(new Date(`${currentYear}/01/01`));
  const [endDate, setEndDate] = useState(new Date(`${currentYear}/12/31`));

  const [username, setUsername] = useState("");
  const [leetcode, setLeetcode] = useState("");
  const [codeForces, setCodeForces] = useState("");
  const [github, setGithub] = useState("");

  const [leetData, setLeetData] = useState([]);
  const [cfData, setCfData] = useState([]);
  const [githubData, setGithubData] = useState([]);

  // Complex profile details
  const [lcStats, setLcStats] = useState(null);
  const [cfStats, setCfStats] = useState(null);
  const [ghStats, setGhStats] = useState(null);

  const [leetLoading, setLeetLoading] = useState(false);
  const [cfLoading, setCfLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);

  const [copied, setCopied] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  // Sync bookmark state
  useEffect(() => {
    if (user && user.bookmarks) {
      setIsBookmarked(user.bookmarks.includes(profile.toLowerCase()));
    }
  }, [user, profile]);

  const handleYearChange = (e) => {
    const year = e.target.value;
    setSelectedYear(year);
    setStartDate(new Date(`${year}/01/01`));
    if (year === currentYear.toString()) {
      setEndDate(new Date());
    } else {
      setEndDate(new Date(`${year}/12/31`));
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Profile link copied!");
    setTimeout(() => setCopied(false), 2000);
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
        setUser({ ...user, bookmarks: res.data.bookmarks });
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
    const fetchUserData = async () => {
      try {
        const res = await axios.post(`${API_BASE}/user`, { profile });
        if (res.data) {
          setUsername(res.data.name);
          setLeetcode(res.data.leetcode || "");
          setCodeForces(res.data.codeforces || "");
          setGithub(res.data.github || "");

          if (res.data.leetcode) fetchLeetCode(res.data.leetcode);
          if (res.data.codeforces) fetchCodeForces(res.data.codeforces);
          if (res.data.github) fetchGithub(res.data.github);
        }
      } catch (err) {
        toast.error("User not found");
      }
    };
    fetchUserData();
  }, [profile]);

  const fetchLeetCode = async (usernameStr) => {
    setLeetLoading(true);
    try {
      const value = await axios.post(`${API_BASE}/leetcode`, { username: usernameStr });
      if (value.data.profile) {
        setLcStats(value.data.profile);
        const cal = value.data.profile.submissionCalendar;
        const formatted = [];
        for (let property in cal) {
          let dateStr = new Date(parseInt(property) * 1000).toISOString().split("T")[0].replace(/-/g, "/");
          formatted.push({ date: dateStr, count: parseInt(cal[property]) });
        }
        setLeetData(formatted);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLeetLoading(false);
    }
  };

  const fetchCodeForces = async (usernameStr) => {
    setCfLoading(true);
    try {
      const value = await axios.post(`${API_BASE}/codeforces`, { username: usernameStr });
      if (value.data.profile) {
        setCfStats(value.data.profile);
        const cal = value.data.profile.submissionCalendar;
        const formatted = [];
        for (let property in cal) {
          formatted.push({ date: property, count: parseInt(cal[property]) });
        }
        setCfData(formatted);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setCfLoading(false);
    }
  };

  const fetchGithub = async (usernameStr) => {
    setGithubLoading(true);
    try {
      const value = await axios.post(`${API_BASE}/github`, { username: usernameStr });
      if (value.data) {
        setGhStats(value.data);
        const cal = value.data.submissionCalendar;
        const formatted = [];
        for (let property in cal) {
          formatted.push({ date: property, count: parseInt(cal[property]) });
        }
        setGithubData(formatted);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setGithubLoading(false);
    }
  };

  // Compute Achievements dynamically
  const getAchievements = () => {
    const achievements = [];
    const lcSolved = lcStats?.totalSolved || 0;
    const cfStatus = cfData ? cfData.reduce((a, b) => a + b.count, 0) : 0;
    const ghCommits = githubData ? githubData.reduce((a, b) => a + b.count, 0) : 0;
    const langCount = ghStats?.languageStats ? Object.keys(ghStats.languageStats).length : 0;

    if (lcSolved >= 100 || cfStatus >= 100) {
      achievements.push({
        id: "century",
        title: "Century Solver",
        desc: "Solved over 100 problems on a coding platform.",
        color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
      });
    }
    if (ghCommits >= 15) {
      achievements.push({
        id: "git_star",
        title: "Consistent Git",
        desc: "Logged over 15 commits on GitHub.",
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

    return achievements;
  };

  const getRatingChartData = () => {
    const data = [];
    const lcHistory = lcStats?.contestHistory || [];
    const cfHistory = cfStats?.ratingHistory || [];

    lcHistory.forEach(h => {
      data.push({
        date: new Date(h.contest.startTime * 1000).toISOString().split("T")[0],
        LeetCode: Math.round(h.rating),
      });
    });

    cfHistory.forEach(h => {
      data.push({
        date: h.date,
        Codeforces: h.rating,
      });
    });

    return data.sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const getSolvePieData = () => {
    if (!lcStats) return [];
    return [
      { name: "Easy", value: lcStats.easySolved || 0, color: "#10b981" },
      { name: "Medium", value: lcStats.mediumSolved || 0, color: "#eab308" },
      { name: "Hard", value: lcStats.hardSolved || 0, color: "#f43f5e" }
    ];
  };

  const achievementsList = getAchievements();
  const ratingData = getRatingChartData();
  const solveData = getSolvePieData();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16 print:p-0 print:space-y-4">
      
      {/* Printable Report Styles */}
      <style>{`
        @media print {
          header, nav, button, select, a, .no-print {
            display: none !important;
          }
          body {
            background-color: white !important;
            color: black !important;
          }
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
        
        <div className="flex items-center gap-3 no-print">
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
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-900 dark:text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print-full">
        {/* GitHub stats Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500"><GitBranch size={24} /></div>
          <div>
            <span className="text-xs text-gray-400 font-medium">GitHub Repos</span>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
              {ghStats?.profile?.public_repos || 0}
            </h3>
          </div>
        </div>

        {/* LeetCode stats Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500"><Code size={24} /></div>
          <div>
            <span className="text-xs text-gray-400 font-medium">LeetCode Solved</span>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
              {lcStats?.totalSolved || 0}
            </h3>
          </div>
        </div>

        {/* Codeforces stats Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-xl text-red-500"><Cpu size={24} /></div>
          <div>
            <span className="text-xs text-gray-400 font-medium">Codeforces Rating</span>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
              {cfStats?.rating || "Unrated"}
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
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ratingData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip contentStyle={{ backgroundColor: "#111", border: "none", borderRadius: "8px", color: "#fff" }} />
                  <Legend />
                  <Line type="monotone" dataKey="LeetCode" stroke="#eab308" strokeWidth={2} connectNulls />
                  <Line type="monotone" dataKey="Codeforces" stroke="#f43f5e" strokeWidth={2} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-gray-450 text-sm">
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
