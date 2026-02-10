"use client";

import React from 'react';
import { useDashboard, User } from '@/context/DashboardContext';
import DashboardTable, { Column } from '@/components/dashboard/DashboardTable';

export default function UsersPage() {
  const { users } = useDashboard();

  const columns: Column<User>[] = [
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Role', accessor: 'role' },
    { header: 'Joined Date', accessor: 'joinedDate' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Users</h1>
      <DashboardTable data={users} columns={columns} />
    </div>
  );
}
