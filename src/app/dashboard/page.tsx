"use client";

import DashboardStats from "@/components/dashboard/DashboardStats";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { useDashboardData } from "@/hooks/useDashboardData";
import Link from "next/link";

export default function DashboardPage() {
  const { categories, destinations, packages, isLoading, error, refreshData } = useDashboardData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
              Dashboard
            </h1>
            <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
              Welcome back! Here's an overview of your travel management system.
            </p>
          </div>
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="group relative rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-white font-medium shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            <span className="relative flex items-center gap-2">
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Refreshing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh Data
                </>
              )}
            </span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 text-red-800 dark:text-red-200 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-semibold">Error loading dashboard data</p>
                <p className="text-sm mt-0.5">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Overview Cards - Moved to top */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white opacity-10"></div>
            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-32 w-32 rounded-full bg-white opacity-5"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                  <span className="text-3xl">🗂️</span>
                </div>
                <div className="text-right">
                  <p className="text-5xl font-extrabold tracking-tight">{categories.length}</p>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">Trip Categories</h3>
              <p className="text-sm text-blue-100">
                Organize destinations by travel type
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white opacity-10"></div>
            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-32 w-32 rounded-full bg-white opacity-5"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                  <span className="text-3xl">📍</span>
                </div>
                <div className="text-right">
                  <p className="text-5xl font-extrabold tracking-tight">{destinations.length}</p>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">Destinations</h3>
              <p className="text-sm text-emerald-100">
                Popular travel destinations listed
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white opacity-10"></div>
            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-32 w-32 rounded-full bg-white opacity-5"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                  <span className="text-3xl">🎫</span>
                </div>
                <div className="text-right">
                  <p className="text-5xl font-extrabold tracking-tight">{packages.length}</p>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">Tour Packages</h3>
              <p className="text-sm text-purple-100">
                Complete travel packages available
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="mb-8">
          <DashboardStats />
        </div>

        {/* Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <RecentActivity />
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-8 shadow-xl border border-gray-100 dark:bg-gray-800/80 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Quick Actions
                </h2>
              </div>
              <div className="grid gap-3">
                <Link
                  href="/dashboard/trip-category"
                  className="group flex items-center justify-between rounded-xl border-2 border-gray-200 bg-gradient-to-r from-white to-gray-50 p-5 hover:border-blue-400 hover:shadow-lg dark:border-gray-700 dark:from-gray-800 dark:to-gray-800/50 dark:hover:border-blue-500 transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md group-hover:shadow-lg transition-shadow">
                      <span className="text-2xl">🗂️</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white mb-1">
                        Manage Trip Categories
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {categories.length} categories
                      </p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                <Link
                  href="/dashboard/destinations"
                  className="group flex items-center justify-between rounded-xl border-2 border-gray-200 bg-gradient-to-r from-white to-gray-50 p-5 hover:border-green-400 hover:shadow-lg dark:border-gray-700 dark:from-gray-800 dark:to-gray-800/50 dark:hover:border-green-500 transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-md group-hover:shadow-lg transition-shadow">
                      <span className="text-2xl">📍</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white mb-1">
                        Manage Destinations
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {destinations.length} destinations
                      </p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-green-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                <Link
                  href="/dashboard/packages"
                  className="group flex items-center justify-between rounded-xl border-2 border-gray-200 bg-gradient-to-r from-white to-gray-50 p-5 hover:border-purple-400 hover:shadow-lg dark:border-gray-700 dark:from-gray-800 dark:to-gray-800/50 dark:hover:border-purple-500 transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-md group-hover:shadow-lg transition-shadow">
                      <span className="text-2xl">🎫</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white mb-1">
                        Manage Tour Packages
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {packages.length} packages
                      </p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                <Link
                  href="/dashboard/bookings"
                  className="group flex items-center justify-between rounded-xl border-2 border-gray-200 bg-gradient-to-r from-white to-gray-50 p-5 hover:border-pink-400 hover:shadow-lg dark:border-gray-700 dark:from-gray-800 dark:to-gray-800/50 dark:hover:border-pink-500 transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 text-white shadow-md group-hover:shadow-lg transition-shadow">
                      <span className="text-2xl">📅</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white mb-1">
                        Manage Bookings
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        View all bookings
                      </p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-pink-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                <Link
                  href="/dashboard/users"
                  className="group flex items-center justify-between rounded-xl border-2 border-gray-200 bg-gradient-to-r from-white to-gray-50 p-5 hover:border-orange-400 hover:shadow-lg dark:border-gray-700 dark:from-gray-800 dark:to-gray-800/50 dark:hover:border-orange-500 transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md group-hover:shadow-lg transition-shadow">
                      <span className="text-2xl">👥</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white mb-1">
                        Manage Users
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        View all users
                      </p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
