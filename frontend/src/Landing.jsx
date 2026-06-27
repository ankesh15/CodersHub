import React from "react";
import { Link } from "react-router-dom";
import { Code, Trophy, Search, GitBranch, Cpu, Activity, BarChart2, Star, CheckCircle, ArrowRight, Zap, Users } from "lucide-react";

const Landing = () => {
  return (
    <div className="space-y-24 pb-20 animate-in fade-in duration-700">
      
      {/* Hero Section */}
      <section className="relative flex flex-col items-center text-center pt-12 md:pt-20 space-y-8 overflow-hidden">
        {/* Background Decorative Gradients */}
        <div className="absolute top-0 -z-10 h-[300px] w-full rounded-full bg-gradient-to-r from-yellow-500/10 via-purple-500/5 to-transparent blur-3xl" />
        
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400 text-xs font-semibold tracking-wide uppercase mb-2 border border-yellow-500/20">
          <Zap size={14} className="animate-pulse" /> Live Leaderboard & Developer Metrics
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white max-w-4xl leading-tight">
          Analyze and Benchmark Your <span className="bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-600 bg-clip-text text-transparent">Coding Journey</span>
        </h1>
        
        <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed">
          Aggregating your profiles from GitHub, LeetCode, and Codeforces into a unified developer dashboard. Track progress, compare metrics, and showcase your profile.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Link
            to="/register"
            className="flex items-center justify-center gap-2 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-4 text-base font-bold shadow-lg shadow-yellow-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            Create Your Profile <ArrowRight size={18} />
          </Link>
          <Link
            to="/leaderboard"
            className="flex items-center justify-center gap-2 rounded-xl bg-white dark:bg-gray-800 text-gray-950 dark:text-white border border-gray-200 dark:border-gray-700 px-8 py-4 text-base font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            <Trophy size={18} className="text-yellow-500" /> View Leaderboard
          </Link>
        </div>

        {/* Product Preview Mockup */}
        <div className="w-full max-w-5xl pt-12">
          <div className="relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-2 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent blur-xl -z-10 rounded-2xl" />
            <div className="rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-6 sm:p-8 space-y-6 text-left">
              {/* Mockup Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold">JD</div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-base">John Doe</h4>
                    <p className="text-xs text-gray-400">john_doe_dev</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-green-500/10 text-green-500 text-xs font-semibold border border-green-500/20">Consistent Solver</span>
                  <span className="px-2.5 py-1 rounded-md bg-yellow-500/10 text-yellow-500 text-xs font-semibold border border-yellow-500/20">1800+ LeetCode</span>
                </div>
              </div>
              
              {/* Mockup Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500"><GitBranch size={20} /></div>
                  <div>
                    <span className="text-xs text-gray-400">GitHub Repos</span>
                    <h5 className="text-lg font-bold text-gray-900 dark:text-white">42 Repos</h5>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center gap-4">
                  <div className="p-3 bg-yellow-500/10 rounded-lg text-yellow-500"><Code size={20} /></div>
                  <div>
                    <span className="text-xs text-gray-400">LeetCode Solved</span>
                    <h5 className="text-lg font-bold text-gray-900 dark:text-white">547 Solved</h5>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center gap-4">
                  <div className="p-3 bg-red-500/10 rounded-lg text-red-500"><Cpu size={20} /></div>
                  <div>
                    <span className="text-xs text-gray-400">Codeforces Rating</span>
                    <h5 className="text-lg font-bold text-gray-900 dark:text-white">1642 Max</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
            Unified Analytics for <span className="text-yellow-500">Every Platform</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Stop switching tabs. View your code output, profile stats, and ratings updates in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white dark:bg-[#0f1115] border border-gray-200 dark:border-gray-850 p-8 rounded-2xl hover:border-yellow-500/50 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-950 flex items-center justify-center text-gray-950 dark:text-white mb-6 group-hover:bg-yellow-500 group-hover:text-white transition-all">
              <GitBranch size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">GitHub Analytics</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Analyze repository languages, retrieve public commit histories, and view interactive contribution heatmaps.
            </p>
          </div>
          
          {/* Card 2 */}
          <div className="bg-white dark:bg-[#0f1115] border border-gray-200 dark:border-gray-850 p-8 rounded-2xl hover:border-yellow-500/50 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-950 flex items-center justify-center text-gray-950 dark:text-white mb-6 group-hover:bg-yellow-500 group-hover:text-white transition-all">
              <Code size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">LeetCode Analytics</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Fetch difficulty solve counts, contest rating trends over time, and rank changes dynamically via official APIs.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white dark:bg-[#0f1115] border border-gray-200 dark:border-gray-850 p-8 rounded-2xl hover:border-yellow-500/50 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-950 flex items-center justify-center text-gray-950 dark:text-white mb-6 group-hover:bg-yellow-500 group-hover:text-white transition-all">
              <Cpu size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Codeforces Analytics</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Track competitive programming rankings, solve counts, contest history, and rating milestones.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
            Sync in <span className="text-yellow-500">Three Easy Steps</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Connect your profiles and watch your progress update instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          <div className="flex flex-col items-center text-center space-y-4 relative">
            <div className="w-16 h-16 rounded-full bg-yellow-500/10 text-yellow-500 flex items-center justify-center font-bold text-2xl border border-yellow-500/20">
              1
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create Account</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-xs">
              Sign up securely with your email and set up your personal Developer Profile.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center space-y-4 relative">
            <div className="w-16 h-16 rounded-full bg-yellow-500/10 text-yellow-500 flex items-center justify-center font-bold text-2xl border border-yellow-500/20">
              2
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Connect Usernames</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-xs">
              Link your public GitHub, LeetCode, and Codeforces handles.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-4 relative">
            <div className="w-16 h-16 rounded-full bg-yellow-500/10 text-yellow-500 flex items-center justify-center font-bold text-2xl border border-yellow-500/20">
              3
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">View Analytics</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-xs">
              Track progress, compare yourself with friends on the leaderboard, and unlock milestones.
            </p>
          </div>
        </div>
      </section>

      {/* Stats / CTA */}
      <section className="bg-yellow-500/5 dark:bg-yellow-500/10 rounded-3xl p-8 sm:p-12 border border-yellow-500/20 text-center max-w-5xl mx-auto space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-500/10 blur-3xl -z-10 rounded-full" />
        
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white max-w-2xl mx-auto leading-tight">
          Ready to Elevate Your Developer Presence?
        </h2>
        
        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
          Start aggregating your metrics, tracking milestones, and comparing rankings with peers today.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/register"
            className="flex items-center justify-center gap-2 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-4 text-base font-bold shadow-lg transition-all active:scale-95"
          >
            Get Started Now <ArrowRight size={18} />
          </Link>
          <Link
            to="/search"
            className="flex items-center justify-center gap-2 rounded-xl bg-white dark:bg-gray-800 text-gray-950 dark:text-white border border-gray-200 dark:border-gray-700 px-8 py-4 text-base font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            <Search size={18} /> Search Profiles
          </Link>
        </div>
      </section>
      
    </div>
  );
};

export default Landing;
