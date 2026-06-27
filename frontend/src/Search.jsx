import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Search as SearchIcon, Loader2 } from "lucide-react";

const Search = () => {
  const navigate = useNavigate();
  const [userSearch, setUserSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const getUser = async (e) => {
    e?.preventDefault();
    if (!userSearch.trim()) {
      toast.warning("Please enter a profile username");
      return;
    }

    const payload = {
      profile: userSearch.toLowerCase().trim(),
    };

    try {
      setIsSearching(true);
      const data = await axios.post(`${API_BASE}/user`, payload);
      
      if (data.data && data.data.profile) {
        navigate(`/result/${data.data.profile}`);
      } else {
        toast.error("User Not Found");
      }
    } catch (err) {
      toast.error("User Not Found");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
          Find A <span className="text-yellow-500">Profile</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Search for existing developer profiles and view their heatmaps.
        </p>
      </div>

      <div className="w-full max-w-2xl bg-white dark:bg-[#0f1115] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 md:p-8">
        <form onSubmit={getUser} className="relative flex items-center">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-32 py-4 bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all text-lg"
            placeholder="Search by username..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
          />
          <div className="absolute inset-y-0 right-2 flex items-center">
            <button
              type="submit"
              disabled={isSearching}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg px-6 py-2.5 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm flex items-center gap-2"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="hidden sm:inline">Searching</span>
                </>
              ) : (
                "Search"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Search;
