import React, { useEffect, useState } from 'react';
import Header from './Header';

const Layout = ({ user, onLogout, setUser, children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 dark:bg-[#09090b] dark:text-gray-100 transition-colors duration-300">
      <div className="flex-1 flex flex-col">
        {/* Header (Top Navbar) */}
        <Header user={user} onLogout={onLogout} setUser={setUser} darkMode={darkMode} toggleTheme={toggleTheme} />
        
        {/* Main Content Area */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout; 