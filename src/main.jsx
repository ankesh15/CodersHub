import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import Users from './Users';
import Result from './Result';
import Form from './Form';
import About from './About';
import Layout from './Layout';
import Login from './Login';
import Search from './Search';
import Landing from './Landing';
import Compare from './Compare';
import axios from 'axios';
import './index.css';

axios.defaults.withCredentials = true;

const Root = () => {
  // Global user state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  // Restore session on mount
  useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { credentials: 'include' })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error("Not logged in");
      })
      .then(data => {
        if (data && data.user) {
          setUser(data.user);
        }
      })
      .catch(err => {
        // Safe to ignore, user is guest
      })
      .finally(() => {
        setLoading(false);
      });
  }, [API_BASE]);

  const handleLogout = () => setUser(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#09090b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border-2 border-yellow-500 border-t-transparent animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Syncing with CodersHub...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Layout user={user} onLogout={handleLogout} setUser={setUser}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<App user={user} setUser={setUser} />} />
          <Route path="/leaderboard" element={<Users user={user} setUser={setUser} />} />
          <Route path="/profile" element={<About user={user} setUser={setUser} />} />
          <Route path="/register" element={<Form user={user} setUser={setUser} />} />
          <Route path="/search" element={<Search />} />
          <Route path="/result/:profile" element={<Result user={user} setUser={setUser} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/compare" element={<Compare />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
