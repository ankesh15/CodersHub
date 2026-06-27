import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { toast } from "react-toastify";

const Login = ({ setUser }) => {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loginId.trim() || !password) {
      toast.warning("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ loginId: loginId.trim(), password }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        toast.success("Welcome back!");
        navigate("/dashboard");
      } else {
        toast.error(data.error || "Login failed");
      }
    } catch (err) {
      toast.error("Network error. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      <div className="w-full max-w-md bg-white dark:bg-[#0f1115] border border-gray-200 dark:border-gray-800 p-8 rounded-2xl shadow-xl space-y-6">
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Welcome <span className="text-yellow-500 font-light">Back</span>
          </h1>
          <p className="text-sm text-gray-550 dark:text-gray-400">
            Sign in to track your stats and compare metrics
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Email or Handle
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-gray-400 pointer-events-none">
                <Mail size={16} />
              </span>
              <input
                type="text"
                placeholder="you@example.com or username"
                className="w-full bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900 dark:text-white transition-all"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Password
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-gray-400 pointer-events-none">
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-800 rounded-xl pl-10 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900 dark:text-white transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl py-3.5 transition-all active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/10"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-gray-100 dark:border-gray-805">
          <p className="text-xs text-gray-400">
            Don't have an account?{" "}
            <Link to="/register" className="text-yellow-500 font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;