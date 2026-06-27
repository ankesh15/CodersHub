import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Sun, Moon, Code, LogOut, Search, User, LayoutDashboard, Trophy, Info, GitCompare, Settings } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "react-toastify";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Header = ({ user, onLogout, setUser, darkMode, toggleTheme }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const handleLogout = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        onLogout();
        toast.success("Successfully logged out!");
        navigate("/");
      }
    } catch (err) {
      toast.error("Logout failed.");
    }
  };

  const navLinks = [
    { name: "Explore", path: "/", icon: <Info size={16} /> },
    { name: "Leaderboard", path: "/leaderboard", icon: <Trophy size={16} /> },
    { name: "Compare", path: "/compare", icon: <GitCompare size={16} /> },
    { name: "Search", path: "/search", icon: <Search size={16} /> },
  ];

  // If user is logged in, show Dashboard link
  if (user) {
    navLinks.unshift({ name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={16} /> });
  }

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-150 bg-white/75 backdrop-blur-md dark:border-gray-800/80 dark:bg-[#09090b]/75 transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 text-white font-bold text-xl group-hover:scale-105 transition-all shadow-md shadow-yellow-500/10">
                C
              </div>
              <span className="font-extrabold text-xl tracking-tight text-gray-900 dark:text-white">
                Coders<span className="text-yellow-500">Hub</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive(link.path)
                    ? "bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/15 dark:text-yellow-400 font-semibold"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-950 dark:text-gray-450 dark:hover:bg-gray-900 dark:hover:text-white"
                )}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Actions & Profile Dropdown */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white transition-colors"
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all focus:outline-none"
                >
                  <div className="h-7 w-7 rounded-lg bg-yellow-500/15 text-yellow-600 flex items-center justify-center font-bold text-sm">
                    {user.name[0].toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 pr-1">
                    {user.name.split(" ")[0]}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-150 bg-white dark:border-gray-800 dark:bg-gray-950 shadow-xl py-1 z-20 animate-in fade-in slide-in-from-top-1">
                      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-850">
                        <p className="text-xs text-gray-400">Signed in as</p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate capitalize">{user.name}</p>
                      </div>
                      <Link
                        to="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-900"
                      >
                        <LayoutDashboard size={14} /> My Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center gap-2.5 w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                      >
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-gray-800 px-4 py-2 text-sm font-semibold text-gray-750 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 text-sm font-bold shadow-sm transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:text-gray-450 dark:hover:bg-gray-900 transition-colors"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="inline-flex items-center justify-center rounded-xl p-2 text-gray-450 hover:bg-gray-100 hover:text-gray-650 dark:hover:bg-gray-900 focus:outline-none"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-150 dark:border-gray-850 bg-white dark:bg-[#09090b] shadow-xl animate-in slide-in-from-top-2">
          <div className="space-y-1 px-4 pb-4 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-base font-medium transition-all",
                  isActive(link.path)
                    ? "bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/15 dark:text-yellow-400 font-semibold"
                    : "text-gray-650 hover:bg-gray-50 hover:text-gray-950 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-white"
                )}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
          </div>
          
          <div className="border-t border-gray-150 dark:border-gray-850 pb-6 pt-4 px-4">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-3.5">
                  <div className="h-9 w-9 rounded-lg bg-yellow-500/15 text-yellow-600 flex items-center justify-center font-bold">
                    {user.name[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="text-base font-semibold text-gray-850 dark:text-gray-200 capitalize">{user.name}</div>
                    <div className="text-xs text-gray-450">@{user.profile}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-3 w-full rounded-xl px-3.5 py-2.5 text-base font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  <LogOut size={18} /> Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-800 py-2.5 text-base font-semibold text-gray-750 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center rounded-xl bg-yellow-500 hover:bg-yellow-600 py-2.5 text-base font-bold text-white shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
