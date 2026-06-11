import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { Search as SearchIcon, Users as UsersIcon, Trophy, ExternalLink, Loader2 } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const Users = () => {
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        fetch(`${API_BASE}/users`)
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch");
                return res.json();
            })
            .then(data => {
                setUsers(data);
                setLoading(false);
            })
            .catch(() => {
                setError('Failed to fetch leaderboard data.');
                setLoading(false);
            });
    }, []);

    // Filter users based on the search query
    const filteredUsers = users.filter(
        (user) =>
            user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.profile?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    function formatName(name) {
        if (!name) return "Unknown";
        return name
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    return (
        <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                        <Trophy className="text-yellow-500" size={32} />
                        Global Leaderboard
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Top developers ranked by platform activity and consistency.
                    </p>
                </div>
                
                <div className="relative w-full md:w-72">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-[#0f1115] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 sm:text-sm transition-all"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-md mb-6">
                    <p className="text-red-700 dark:text-red-400 text-sm font-medium">{error}</p>
                </div>
            )}

            <div className="bg-white dark:bg-[#0f1115] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
                        <Loader2 className="w-8 h-8 animate-spin mb-4 text-yellow-500" />
                        <p className="font-medium">Loading leaderboard...</p>
                    </div>
                ) : filteredUsers.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-[#1a1c23] border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold">
                                    <th className="px-6 py-4 text-center w-16">Rank</th>
                                    <th className="px-6 py-4">Developer</th>
                                    <th className="px-6 py-4">Profile Handle</th>
                                    <th className="px-6 py-4 hidden sm:table-cell">Joined</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {filteredUsers.map((user, idx) => (
                                    <tr key={user._id || idx} className="hover:bg-gray-50/50 dark:hover:bg-[#1a1c23]/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center h-8 w-8 rounded-full font-bold text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 mx-auto">
                                                {idx + 1}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-500 flex items-center justify-center rounded-full font-bold text-sm">
                                                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {formatName(user.name)}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 hidden md:block">
                                                        {user.email || 'Private Email'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                                                @{user.profile}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium">
                                            <Link
                                                to={`/result/${user.profile}`}
                                                className="inline-flex items-center gap-1 text-yellow-600 hover:text-yellow-500 dark:text-yellow-500 dark:hover:text-yellow-400 transition-colors"
                                            >
                                                View <ExternalLink size={14} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
                        <UsersIcon className="w-12 h-12 mb-4 opacity-50" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No developers found</h3>
                        <p>Try adjusting your search query.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Users;
