import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { CheckCircle2, Loader2, ArrowRight, Eye, EyeOff, User, Mail, Lock, ShieldAlert } from "lucide-react";

const Form = ({ setUser }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    profile: "",
    password: "",
    leetcode: "",
    codeforces: "",
    github: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successProfile, setSuccessProfile] = useState("");
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Name is required";
    if (!formData.email.trim()) return "Email is required";
    if (!formData.profile.trim()) return "Profile handle is required";
    if (!formData.password || formData.password.length < 6) return "Password must be at least 6 characters";
    if (/\s/.test(formData.profile)) return "Profile handle should not contain spaces";
    if (/\s/.test(formData.leetcode)) return "LeetCode username should not contain spaces";
    if (/\s/.test(formData.codeforces)) return "CodeForces username should not contain spaces";
    if (/\s/.test(formData.github)) return "GitHub username should not contain spaces";

    const urlPattern = /^(https?:\/\/|www\.)/i;
    if (urlPattern.test(formData.profile)) return "Profile handle should not be a URL";
    if (urlPattern.test(formData.leetcode)) return "LeetCode username should not be a URL";
    if (urlPattern.test(formData.codeforces)) return "CodeForces username should not be a URL";
    if (urlPattern.test(formData.github)) return "GitHub username should not be a URL";

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    const payload = {
      name: formData.name.trim(),
      email: formData.email.toLowerCase().trim(),
      profile: formData.profile.toLowerCase().trim(),
      password: formData.password,
      leetcode: formData.leetcode.toLowerCase().trim(),
      codeforces: formData.codeforces.toLowerCase().trim(),
      github: formData.github.toLowerCase().trim(),
    };

    try {
      setIsSubmitting(true);
      const res = await axios.post(`${API_BASE}/auth/register`, payload);
      if (res.data && res.data.user) {
        setUser(res.data.user);
        setSuccessProfile(res.data.user.profile);
        toast.success("Account created successfully!");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failed. Username or email may already exist.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successProfile) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center animate-in fade-in duration-500">
        <div className="bg-white dark:bg-[#0f1115] p-8 rounded-2xl border border-gray-205 dark:border-gray-800 text-center max-w-md w-full shadow-2xl">
          <CheckCircle2 className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">You're All Set!</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Your developer analytics profile has been created.</p>
          <Link
            to={`/result/${successProfile}`}
            className="flex items-center justify-center gap-2 w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 px-6 rounded-xl transition-all active:scale-95 shadow-lg shadow-yellow-500/10"
          >
            Visit Profile <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 animate-in fade-in duration-500">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
          Create Your <span className="text-yellow-500">Profile</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400">Join the leaderboard and benchmark your stats across platforms.</p>
      </div>

      <div className="bg-white dark:bg-[#0f1115] rounded-2xl shadow-xl border border-gray-200 dark:border-gray-808 p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Full Name *</label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-gray-400 pointer-events-none"><User size={16} /></span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Email Address *</label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-gray-400 pointer-events-none"><Mail size={16} /></span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Profile Handle *</label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-gray-400 pointer-events-none font-bold text-sm">@</span>
                <input
                  type="text"
                  name="profile"
                  value={formData.profile}
                  onChange={handleChange}
                  placeholder="johndoe"
                  className="w-full bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Password *</label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-gray-400 pointer-events-none"><Lock size={16} /></span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-800 rounded-xl pl-10 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900 dark:text-white"
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
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Platform Usernames</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">GitHub</label>
                <input
                  type="text"
                  name="github"
                  value={formData.github}
                  onChange={handleChange}
                  placeholder="GitHub handle"
                  className="w-full bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">LeetCode</label>
                <input
                  type="text"
                  name="leetcode"
                  value={formData.leetcode}
                  onChange={handleChange}
                  placeholder="LeetCode handle"
                  className="w-full bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Codeforces</label>
                <input
                  type="text"
                  name="codeforces"
                  value={formData.codeforces}
                  onChange={handleChange}
                  placeholder="Codeforces handle"
                  className="w-full bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-yellow-500/10 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" />
                Registering...
              </>
            ) : (
              "Complete Registration"
            )}
          </button>
        </form>

        <div className="text-center pt-6 mt-6 border-t border-gray-100 dark:border-gray-808">
          <p className="text-xs text-gray-400 font-medium">
            Already have an account?{" "}
            <Link to="/login" className="text-yellow-500 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Form;
