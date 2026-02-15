"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/context/DashboardContext";

export default function DashboardNav() {
  const router = useRouter();
  const { toggleSidebar } = useDashboard();
  const [showMenu, setShowMenu] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Get user email from localStorage
  useState(() => {
    if (typeof window !== 'undefined') {
      setUserEmail(localStorage.getItem('userEmail') || 'Admin');
    }
  });

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      // Clear authentication data
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
      
      // Redirect to login
      router.push('/login');
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200/50 bg-white/80 backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/80 shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 lg:px-8">
        <div className="flex items-center">
          <button
            type="button"
            className="rounded-lg p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700/50 transition-all lg:hidden"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button 
            className="relative rounded-xl p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700/50 transition-all group"
            aria-label="Notifications"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800"></span>
          </button>

          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 dark:hover:bg-gray-700/50 transition-all"
            >
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                {userEmail.charAt(0).toUpperCase()}
              </div>
              <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Admin</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userEmail}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
