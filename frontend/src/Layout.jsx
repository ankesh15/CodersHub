import React, { useEffect, useState } from 'react';
import Header from './Header';

const Layout = ({ user, onLogout, setUser, children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem('theme') === 'dark'; } catch { return false; }
  });

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      try { localStorage.setItem('theme', 'dark'); } catch { /* Storage may be disabled. */ }
    } else {
      document.documentElement.classList.remove('dark');
      try { localStorage.setItem('theme', 'light'); } catch { /* Storage may be disabled. */ }
    }
  }, [darkMode]);

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 dark:bg-[#09090b] dark:text-gray-100 transition-colors duration-300">
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header (Top Navbar) */}
        <Header user={user} onLogout={onLogout} setUser={setUser} darkMode={darkMode} toggleTheme={toggleTheme} />
        
        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout; 