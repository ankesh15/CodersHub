import React, { useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Search, Code, GitBranch, Cpu, Loader2, GitPullRequest, Award } from "lucide-react";
import { toast } from "react-toastify";

const Compare = () => {
  const [user1, setUser1] = useState("");
  const [user2, setUser2] = useState("");
  const [data1, setData1] = useState(null);
  const [data2, setData2] = useState(null);
  const [loading, setLoading] = useState(false);
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const handleCompare = async (e) => {
    e.preventDefault();
    if (!user1.trim() || !user2.trim()) {
      toast.warning("Please enter both handles.");
      return;
    }
    setLoading(true);
    setData1(null);
    setData2(null);

    try {
      // Fetch details for user 1
      const res1 = await axios.post(`${API_BASE}/user`, { profile: user1.toLowerCase().trim() });
      // Fetch details for user 2
      const res2 = await axios.post(`${API_BASE}/user`, { profile: user2.toLowerCase().trim() });

      const u1 = res1.data;
      const u2 = res2.data;

      // Parallel platform fetching
      const [lc1, cf1, gh1, lc2, cf2, gh2] = await Promise.allSettled([
        u1.leetcode ? axios.post(`${API_BASE}/leetcode`, { username: u1.leetcode }) : Promise.resolve(null),
        u1.codeforces ? axios.post(`${API_BASE}/codeforces`, { username: u1.codeforces }) : Promise.resolve(null),
        u1.github ? axios.post(`${API_BASE}/github`, { username: u1.github }) : Promise.resolve(null),
        u2.leetcode ? axios.post(`${API_BASE}/leetcode`, { username: u2.leetcode }) : Promise.resolve(null),
        u2.codeforces ? axios.post(`${API_BASE}/codeforces`, { username: u2.codeforces }) : Promise.resolve(null),
        u2.github ? axios.post(`${API_BASE}/github`, { username: u2.github }) : Promise.resolve(null),
      ]);

      setData1({
        profile: u1,
        leetcode: lc1.status === "fulfilled" && lc1.value ? lc1.value.data.profile : null,
        codeforces: cf1.status === "fulfilled" && cf1.value ? cf1.value.data.profile : null,
        github: gh1.status === "fulfilled" && gh1.value ? gh1.value.data.profile : null,
      });

      setData2({
        profile: u2,
        leetcode: lc2.status === "fulfilled" && lc2.value ? lc2.value.data.profile : null,
        codeforces: cf2.status === "fulfilled" && cf2.value ? cf2.value.data.profile : null,
        github: gh2.status === "fulfilled" && gh2.value ? gh2.value.data.profile : null,
      });

      toast.success("Comparison loaded successfully!");
    } catch (err) {
      toast.error("One or both users not found in CodersHub.");
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    if (!data1 || !data2) return [];
    return [
      {
        name: "LeetCode Solved",
        [data1.profile.name]: data1.leetcode?.totalSolved || 0,
        [data2.profile.name]: data2.leetcode?.totalSolved || 0,
      },
      {
        name: "Codeforces Max Rating",
        [data1.profile.name]: data1.codeforces?.maxRating || 0,
        [data2.profile.name]: data2.codeforces?.maxRating || 0,
      },
      {
        name: "GitHub Repos",
        [data1.profile.name]: data1.github?.public_repos || 0,
        [data2.profile.name]: data2.github?.public_repos || 0,
      },
    ];
  };

  const compareVal = (val1, val2) => {
    if (val1 === val2) return "text-gray-500";
    return val1 > val2 ? "text-green-500 font-bold" : "text-gray-400";
  };

  return (
    <div className="space-y-10 py-6 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Compare <span className="text-yellow-500">Developers</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
          Compare solve counts, ratings, repository counts, and consistency across platforms side-by-side.
        </p>
      </div>

      {/* Input Form */}
      <div className="max-w-2xl mx-auto bg-white dark:bg-[#0f1115] border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
        <form onSubmit={handleCompare} className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1 w-full relative">
            <input
              type="text"
              className="w-full bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900 dark:text-white"
              placeholder="Developer Handle 1 (e.g. john)"
              value={user1}
              onChange={(e) => setUser1(e.target.value)}
              required
            />
          </div>
          <span className="text-gray-400 font-bold text-xs uppercase">VS</span>
          <div className="flex-1 w-full relative">
            <input
              type="text"
              className="w-full bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900 dark:text-white"
              placeholder="Developer Handle 2 (e.g. jane)"
              value={user2}
              onChange={(e) => setUser2(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl px-6 py-3 transition-all active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Comparing
              </>
            ) : (
              "Compare"
            )}
          </button>
        </form>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Fetching metrics and syncing profiles...</p>
        </div>
      )}

      {/* Comparison Grid & Dashboard */}
      {data1 && data2 && !loading && (
        <div className="space-y-8 animate-in fade-in duration-500">
          
          {/* Header comparison */}
          <div className="grid grid-cols-2 md:grid-cols-2 gap-8 text-center max-w-4xl mx-auto">
            <div className="bg-white dark:bg-[#0f1115] border border-gray-200 dark:border-gray-800 p-6 rounded-2xl">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{data1.profile.name}</h3>
              <p className="text-sm text-yellow-500 font-medium mt-1">@{data1.profile.profile}</p>
            </div>
            <div className="bg-white dark:bg-[#0f1115] border border-gray-200 dark:border-gray-800 p-6 rounded-2xl">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{data2.profile.name}</h3>
              <p className="text-sm text-yellow-500 font-medium mt-1">@{data2.profile.profile}</p>
            </div>
          </div>

          {/* Side by side stats comparison */}
          <div className="bg-white dark:bg-[#0f1115] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden max-w-4xl mx-auto">
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
              <h3 className="font-bold text-gray-950 dark:text-white text-lg">Platform Performance Matrix</h3>
            </div>
            
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {/* LeetCode comparison row */}
              <div className="grid grid-cols-3 p-6 text-center items-center">
                <div className={`text-xl ${compareVal(data1.leetcode?.totalSolved || 0, data2.leetcode?.totalSolved || 0)}`}>
                  {data1.leetcode?.totalSolved || 0}
                </div>
                <div className="flex flex-col items-center justify-center gap-1">
                  <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500"><Code size={18} /></div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">LeetCode Solved</span>
                </div>
                <div className={`text-xl ${compareVal(data2.leetcode?.totalSolved || 0, data1.leetcode?.totalSolved || 0)}`}>
                  {data2.leetcode?.totalSolved || 0}
                </div>
              </div>

              {/* Codeforces comparison row */}
              <div className="grid grid-cols-3 p-6 text-center items-center">
                <div className={`text-xl ${compareVal(data1.codeforces?.maxRating || 0, data2.codeforces?.maxRating || 0)}`}>
                  {data1.codeforces?.maxRating || 0}
                </div>
                <div className="flex flex-col items-center justify-center gap-1">
                  <div className="p-2 bg-red-500/10 rounded-lg text-red-500"><Cpu size={18} /></div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Codeforces Max</span>
                </div>
                <div className={`text-xl ${compareVal(data2.codeforces?.maxRating || 0, data1.codeforces?.maxRating || 0)}`}>
                  {data2.codeforces?.maxRating || 0}
                </div>
              </div>

              {/* GitHub Repos comparison row */}
              <div className="grid grid-cols-3 p-6 text-center items-center">
                <div className={`text-xl ${compareVal(data1.github?.public_repos || 0, data2.github?.public_repos || 0)}`}>
                  {data1.github?.public_repos || 0}
                </div>
                <div className="flex flex-col items-center justify-center gap-1">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><GitBranch size={18} /></div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">GitHub Repos</span>
                </div>
                <div className={`text-xl ${compareVal(data2.github?.public_repos || 0, data1.github?.public_repos || 0)}`}>
                  {data2.github?.public_repos || 0}
                </div>
              </div>

              {/* Leetcode Easy solves */}
              <div className="grid grid-cols-3 p-6 text-center items-center">
                <div className={`text-base ${compareVal(data1.leetcode?.easySolved || 0, data2.leetcode?.easySolved || 0)}`}>
                  {data1.leetcode?.easySolved || 0}
                </div>
                <div className="flex flex-col items-center justify-center">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">LC Easy Solves</span>
                </div>
                <div className={`text-base ${compareVal(data2.leetcode?.easySolved || 0, data1.leetcode?.easySolved || 0)}`}>
                  {data2.leetcode?.easySolved || 0}
                </div>
              </div>

              {/* Leetcode Medium solves */}
              <div className="grid grid-cols-3 p-6 text-center items-center">
                <div className={`text-base ${compareVal(data1.leetcode?.mediumSolved || 0, data2.leetcode?.mediumSolved || 0)}`}>
                  {data1.leetcode?.mediumSolved || 0}
                </div>
                <div className="flex flex-col items-center justify-center">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">LC Medium Solves</span>
                </div>
                <div className={`text-base ${compareVal(data2.leetcode?.mediumSolved || 0, data1.leetcode?.mediumSolved || 0)}`}>
                  {data2.leetcode?.mediumSolved || 0}
                </div>
              </div>

              {/* Leetcode Hard solves */}
              <div className="grid grid-cols-3 p-6 text-center items-center">
                <div className={`text-base ${compareVal(data1.leetcode?.hardSolved || 0, data2.leetcode?.hardSolved || 0)}`}>
                  {data1.leetcode?.hardSolved || 0}
                </div>
                <div className="flex flex-col items-center justify-center">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">LC Hard Solves</span>
                </div>
                <div className={`text-base ${compareVal(data2.leetcode?.hardSolved || 0, data1.leetcode?.hardSolved || 0)}`}>
                  {data2.leetcode?.hardSolved || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Comparative Chart */}
          <div className="bg-white dark:bg-[#0f1115] border border-gray-200 dark:border-gray-800 p-6 rounded-2xl max-w-4xl mx-auto">
            <h3 className="font-bold text-gray-950 dark:text-white text-lg mb-6">Visual Comparison Chart</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Legend />
                  <Bar dataKey={data1.profile.name} fill="#eab308" radius={[4, 4, 0, 0]} />
                  <Bar dataKey={data2.profile.name} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Compare;
