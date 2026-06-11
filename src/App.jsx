import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Code, Trophy, GitBranch, Cpu, Loader2, Award, Bookmark, Edit2, Check, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";function App({ user, setUser }) {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    github: "",
    leetcode: "",
    codeforces: "",
  });

  const [lcData, setLcData] = useState(null);
  const [cfData, setCfData] = useState(null);
  const [ghData, setGhData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  // Initialize edit form when user loads
  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name,
        github: user.github || "",
        leetcode: user.leetcode || "",
        codeforces: user.codeforces || "",
      });
      fetchPlatformStats();
    }
  }, [user]);

  const fetchPlatformStats = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [lcRes, cfRes, ghRes] = await Promise.allSettled([
        user.leetcode ? axios.post(`${API_BASE}/leetcode`, { username: user.leetcode }) : Promise.resolve(null),
        user.codeforces ? axios.post(`${API_BASE}/codeforces`, { username: user.codeforces }) : Promise.resolve(null),
        user.github ? axios.post(`${API_BASE}/github`, { username: user.github }) : Promise.resolve(null),
      ]);

      if (lcRes.status === "fulfilled" && lcRes.value) setLcData(lcRes.value.data.profile);
      if (cfRes.status === "fulfilled" && cfRes.value) setCfData(cfRes.value.data.profile);
      if (ghRes.status === "fulfilled" && ghRes.value) setGhData(ghRes.value.data.profile);

    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHandles = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.post(`${API_BASE}/user/update`, editForm, {
        withCredentials: true
      });
      if (res.data && res.data.user) {
        setUser(res.data.user);
        toast.success("Profile handles updated!");
        setEditing(false);
      }
    } catch (err) {
      toast.error("Failed to update profile handles.");
    } finally {
      setSaving(false);
    }
  };

  // Compute Achievements dynamically
  const getAchievements = () => {
    const achievements = [];
    
    // 1. Century Club (Solved 100+ on LeetCode or CF)
    const lcSolved = lcData?.totalSolved || 0;
    const cfStatus = cfData?.submissionCalendar ? Object.values(cfData.submissionCalendar).reduce((a, b) => a + b, 0) : 0;
    
    if (lcSolved >= 100 || cfStatus >= 100) {
      achievements.push({
        id: "century",
        title: "Century Solver",
        desc: "Solved over 100 problems on a coding platform.",
        color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
      });
    }

    // 2. Consistent Committer (10+ commits/active days on Github)
    const ghCommits = ghData?.submissionCalendar ? Object.values(ghData.submissionCalendar).reduce((a, b) => a + b, 0) : 0;
    if (ghCommits >= 15) {
      achievements.push({
        id: "git_star",
        title: "Consistent Git",
        desc: "Logged over 15 recent commits on GitHub.",
        color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
      });
    }

    // 3. Polyglot Developer (3+ distinct repository languages)
    const langCount = ghData?.languageStats ? Object.keys(ghData.languageStats).length : 0;
    if (langCount >= 3) {
      achievements.push({
        id: "polyglot",
        title: "Polyglot Coder",
        desc: "Wrote code in 3 or more distinct languages on GitHub.",
        color: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
      });
    }

    // 4. Competitor (Any Codeforces rating)
    if (cfData?.rating) {
      achievements.push({
        id: "cf_competitor",
        title: "Active CP Competitor",
        desc: "Registered active rating on Codeforces.",
        color: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
      });
    }

    // Default achievement for joining
    achievements.unshift({
      id: "welcome",
      title: "CodersHub Member",
      desc: "Synced and initialized your global profile developer card.",
      color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20"
    });

    return achievements;
  };

  // Format Recharts data for Rating Trends Chart
  const getRatingChartData = () => {
    const data = [];
    const lcHistory = lcData?.contestHistory || [];
    const cfHistory = cfData?.ratingHistory || [];

    // Map LeetCode history
    lcHistory.forEach(h => {
      data.push({
        date: new Date(h.contest.startTime * 1000).toISOString().split("T")[0],
        LeetCode: Math.round(h.rating),
      });
    });

    // Map Codeforces history
    cfHistory.forEach(h => {
      data.push({
        date: h.date,
        Codeforces: h.rating,
      });
    });

    // Sort by date chronologically
    return data.sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  // Format Pie Chart Data for solves
  const getSolvePieData = () => {
    if (!lcData) return [];
    return [
      { name: "Easy", value: lcData.easySolved || 0, color: "#10b981" },
      { name: "Medium", value: lcData.mediumSolved || 0, color: "#eab308" },
      { name: "Hard", value: lcData.hardSolved || 0, color: "#f43f5e" }
    ];
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center py-12 px-4 text-center animate-in fade-in duration-500">
        <div className="bg-white dark:bg-[#0f1115] border border-gray-200 dark:border-gray-800 p-8 rounded-2xl max-w-md w-full shadow-xl space-y-6">
          <div className="w-16 h-16 rounded-full bg-yellow-500/10 text-yellow-500 flex items-center justify-center mx-auto">
            <Trophy size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Join the Community</h2>
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">
            Sign up or log in to customize your dashboard, track your contest ratings, and compare analytics with peers.
          </p>
          <div className="flex gap-4">
            <Link
              to="/login"
              className="flex-1 text-center bg-gray-900 hover:bg-gray-805 dark:bg-white dark:text-gray-900 text-white font-bold py-3 rounded-xl text-sm transition-all"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="flex-1 text-center bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-lg shadow-yellow-500/10"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const ratingData = getRatingChartData();
  const solveData = getSolvePieData();
  const achievementsList = getAchievements();

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-500">
      
      {/* Upper Profile Header Panel */}
      <div className="bg-white dark:bg-[#0f1115] border border-gray-200 dark:border-gray-808 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white capitalize">{user.name}</h1>
            <Link to={`/result/${user.profile}`} className="text-xs text-yellow-500 hover:underline flex items-center gap-1">
              View public card <ExternalLink size={12} />
            </Link>
          </div>
          <p className="text-sm text-gray-450">Profile Handle: <span className="font-semibold text-yellow-500">@{user.profile}</span></p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={fetchPlatformStats}
            disabled={loading}
            className="flex items-center gap-2 border border-gray-250 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-200 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Sync Metrics
          </button>
          
          <button
            onClick={() => setEditing(!editing)}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95"
          >
            <Edit2 size={16} />
            {editing ? "Cancel Edit" : "Edit Handles"}
          </button>
        </div>
      </div>

      {/* Edit Form Drawer */}
      {editing && (
        <div className="bg-white dark:bg-[#0f1115] border border-gray-200 dark:border-gray-808 p-6 rounded-2xl shadow-sm animate-in slide-in-from-top-2">
          <h3 className="font-bold text-gray-950 dark:text-white text-lg mb-4">Edit Platform Handles</h3>
          <form onSubmit={handleSaveHandles} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">GitHub Username</label>
              <input
                type="text"
                className="w-full bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white"
                value={editForm.github}
                onChange={e => setEditForm({ ...editForm, github: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">LeetCode Username</label>
              <input
                type="text"
                className="w-full bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white"
                value={editForm.leetcode}
                onChange={e => setEditForm({ ...editForm, leetcode: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Codeforces Username</label>
              <input
                type="text"
                className="w-full bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white"
                value={editForm.codeforces}
                onChange={e => setEditForm({ ...editForm, codeforces: e.target.value })}
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3.5 px-6 rounded-xl text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              Save Changes
            </button>
          </form>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* GitHub Card */}
        <div className="bg-white dark:bg-[#0f1115] border border-gray-200 dark:border-gray-808 p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500"><GitBranch size={24} /></div>
          <div>
            <span className="text-xs text-gray-450 font-medium">GitHub Repositories</span>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
              {loading ? "..." : ghData?.public_repos || "0"}
            </h3>
          </div>
        </div>

        {/* LeetCode Card */}
        <div className="bg-white dark:bg-[#0f1115] border border-gray-200 dark:border-gray-808 p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500"><Code size={24} /></div>
          <div>
            <span className="text-xs text-gray-450 font-medium">LeetCode Solved</span>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
              {loading ? "..." : lcData?.totalSolved || "0"}
            </h3>
          </div>
        </div>

        {/* Codeforces Card */}
        <div className="bg-white dark:bg-[#0f1115] border border-gray-200 dark:border-gray-808 p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-xl text-red-500"><Cpu size={24} /></div>
          <div>
            <span className="text-xs text-gray-450 font-medium">Codeforces Rating</span>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
              {loading ? "..." : cfData?.rating || "Unrated"}
            </h3>
          </div>
        </div>
      </div>

      {/* Charts Block */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Rating History Line Chart */}
        <div className="bg-white dark:bg-[#0f1115] border border-gray-200 dark:border-gray-808 p-6 rounded-2xl xl:col-span-2 space-y-6">
          <h3 className="font-bold text-gray-950 dark:text-white text-lg">Contest Rating Progress</h3>
          {ratingData.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ratingData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip contentStyle={{ backgroundColor: "#111", border: "none", borderRadius: "8px", color: "#fff" }} />
                  <Legend />
                  <Line type="monotone" dataKey="LeetCode" stroke="#eab308" strokeWidth={2.5} activeDot={{ r: 8 }} connectNulls />
                  <Line type="monotone" dataKey="Codeforces" stroke="#f43f5e" strokeWidth={2.5} activeDot={{ r: 8 }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">
              Participate in contests on Codeforces or LeetCode to populate rating trends.
            </div>
          )}
        </div>

        {/* Solves Breakdown Pie Chart */}
        <div className="bg-white dark:bg-[#0f1115] border border-gray-200 dark:border-gray-808 p-6 rounded-2xl flex flex-col justify-between">
          <h3 className="font-bold text-gray-950 dark:text-white text-lg">LeetCode Difficulty Split</h3>
          {solveData.length > 0 ? (
            <>
              <div className="h-[220px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={solveData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                    >
                      {solveData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#111", border: "none", borderRadius: "8px", color: "#fff" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 text-xs mt-2">
                {solveData.map(d => (
                  <span key={d.name} className="flex items-center gap-1.5 font-medium text-gray-600 dark:text-gray-300">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    {d.name}: {d.value}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">
              LeetCode solve details not found.
            </div>
          )}
        </div>
      </div>

      {/* Bookmarks & Achievements Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Saved Profiles */}
        <div className="bg-white dark:bg-[#0f1115] border border-gray-200 dark:border-gray-808 p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-850">
            <Bookmark size={18} className="text-yellow-500" />
            <h3 className="font-bold text-gray-950 dark:text-white text-lg">Favorite Developers</h3>
          </div>
          {user.bookmarks && user.bookmarks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {user.bookmarks.map(profileHandle => (
                <Link
                  key={profileHandle}
                  to={`/result/${profileHandle}`}
                  className="p-3 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-850 border border-gray-150 dark:border-gray-800 rounded-xl flex items-center justify-between transition-all"
                >
                  <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">@{profileHandle}</span>
                  <ExternalLink size={14} className="text-gray-400" />
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-6 text-center">No favorited profiles yet. Explore developers to bookmark them!</p>
          )}
        </div>

        {/* Milestone Achievements */}
        <div className="bg-white dark:bg-[#0f1115] border border-gray-200 dark:border-gray-808 p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-850">
            <Award size={18} className="text-yellow-500" />
            <h3 className="font-bold text-gray-950 dark:text-white text-lg">Milestones & Badges</h3>
          </div>
          <div className="space-y-3 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
            {achievementsList.map(a => (
              <div key={a.id} className={`p-3 rounded-xl border flex gap-3 items-start ${a.color}`}>
                <div className="pt-0.5"><Award size={16} /></div>
                <div>
                  <h4 className="font-bold text-sm">{a.title}</h4>
                  <p className="text-xs opacity-75 mt-0.5">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}

export default App;
