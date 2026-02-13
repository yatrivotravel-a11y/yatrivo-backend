"use client";

import React, { useState, useEffect } from 'react';
import { getUsers } from '@/lib/api';
import type { UserData } from '@/lib/api';
import DashboardTable, { Column } from '@/components/dashboard/DashboardTable';

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getUsers();
      if (result.success && result.data) {
        setUsers(result.data);
      } else {
        setError(result.error || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const columns: Column<UserData>[] = [
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { 
      header: 'Created At', 
      accessor: (item) => new Date(item.createdAt).toLocaleDateString()
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">Users Management</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">View and manage all registered users</p>
        </div>
        <button
          onClick={fetchUsers}
          disabled={isLoading}
          className="group relative rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-white font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95"
        >
          <span className="flex items-center gap-2">
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
                Refresh
              </>
            )}
          </span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20 bg-white/50 dark:bg-gray-800/50 rounded-2xl backdrop-blur-sm">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">Loading users...</p>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 text-red-800 dark:text-red-200 shadow-sm">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-semibold text-lg">Error</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-800 p-12 rounded-2xl text-center border-2 border-dashed border-gray-300 dark:border-gray-600">
          <div className="inline-block p-4 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
            <svg className="w-12 h-12 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">No users found</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Users will appear here after they sign up
          </p>
        </div>
      ) : (
        <DashboardTable data={users} columns={columns} />
      )}
    </div>
  );
}
