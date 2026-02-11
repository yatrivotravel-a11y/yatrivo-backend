"use client";

import DashboardStats from "@/components/dashboard/DashboardStats";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { useDashboardData } from "@/hooks/useDashboardData";
import Link from "next/link";

export default function DashboardPage() {
  const { categories, destinations, packages, isLoading, error, refreshData } = useDashboardData();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Welcome back! Here's an overview of your travel management system.
            </p>
          </div>
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? "Refreshing..." : "Refresh Data"}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-red-800 dark:text-red-200">
            <p className="font-medium">Error loading dashboard data</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Dashboard Stats */}
        <DashboardStats />

        {/* Content Grid */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <RecentActivity />
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-1">
            <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
              <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                Quick Actions
              </h2>
              <div className="grid gap-4">
                <Link
                  href="/dashboard/trip-category"
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🗂️</span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Manage Trip Categories
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {categories.length} categories
                      </p>
                    </div>
                  </div>
                  <span className="text-gray-400">→</span>
                </Link>

                <Link
                  href="/dashboard/destinations"
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📍</span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Manage Destinations
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {destinations.length} destinations
                      </p>
                    </div>
                  </div>
                  <span className="text-gray-400">→</span>
                </Link>

                <Link
                  href="/dashboard/packages"
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎫</span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Manage Tour Packages
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {packages.length} packages
                      </p>
                    </div>
                  </div>
                  <span className="text-gray-400">→</span>
                </Link>

                <Link
                  href="/dashboard/users"
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">👥</span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Manage Users
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        View all users
                      </p>
                    </div>
                  </div>
                  <span className="text-gray-400">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg">
            <h3 className="text-lg font-semibold">Trip Categories</h3>
            <p className="mt-2 text-3xl font-bold">{categories.length}</p>
            <p className="mt-2 text-sm opacity-90">
              Organize destinations by travel type
            </p>
          </div>

          <div className="rounded-lg bg-gradient-to-br from-green-500 to-green-600 p-6 text-white shadow-lg">
            <h3 className="text-lg font-semibold">Destinations</h3>
            <p className="mt-2 text-3xl font-bold">{destinations.length}</p>
            <p className="mt-2 text-sm opacity-90">
              Popular travel destinations listed
            </p>
          </div>

          <div className="rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white shadow-lg">
            <h3 className="text-lg font-semibold">Tour Packages</h3>
            <p className="mt-2 text-3xl font-bold">{packages.length}</p>
            <p className="mt-2 text-sm opacity-90">
              Complete travel packages available
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
