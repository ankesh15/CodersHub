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
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

axios.defaults.withCredentials = true;
axios.defaults.timeout = 45000;

const Root = () => {
  // Global user state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState("");
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  // Restore session on mount
  useEffect(() => {
    const controller = new AbortController();
    axios.get(`${API_BASE}/auth/me`, { signal: controller.signal, timeout: 10000 })
      .then(({ data }) => { if (data?.user) setUser(data.user); })
      .catch(error => { if (!controller.signal.aborted && error.response?.status !== 401) setSessionError("Could not restore your session. Check the backend connection, then reload or sign in."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
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
        <ToastContainer position="top-right" autoClose={4000} />
        {sessionError && !user && <p role="alert" className="mb-4 rounded-lg border border-yellow-500/30 p-3 text-sm">{sessionError}</p>}
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
          <Route path="*" element={<div className="py-16 text-center"><h1 className="text-2xl font-bold">Page not found</h1><a href="/" className="text-yellow-500">Return home</a></div>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
